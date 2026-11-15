import React, { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  LinearProgress,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import RateReviewIcon from '@mui/icons-material/RateReview';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import RefreshIcon from '@mui/icons-material/Refresh';
import { SEO } from '../../components/common/SEO';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { evaluationsService } from '../../services/evaluations.service';
import { useNotification } from '../../context/NotificationContext';
import { extractErrorMessage } from '../../services/api';
import { DescriptiveEvaluation } from '../../types';
import { BRANDING } from '../../config/env';

export const DescriptiveEvaluationPage: React.FC = () => {
  const { showSuccess, showError } = useNotification();

  const [evaluations, setEvaluations] = useState<DescriptiveEvaluation[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<{ pendingCount: number; completedCount: number; totalCount: number }>({
    pendingCount: 0,
    completedCount: 0,
    totalCount: 0,
  });

  // Grading Dialog
  const [gradingOpen, setGradingOpen] = useState(false);
  const [selectedEval, setSelectedEval] = useState<DescriptiveEvaluation | null>(null);
  const [marksAwarded, setMarksAwarded] = useState<number>(0);
  const [feedback, setFeedback] = useState<string>('');
  const [savingGrade, setSavingGrade] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [res, st] = await Promise.all([
        evaluationsService.getPendingEvaluations().catch(() => ({ items: [], total: 0 })),
        evaluationsService.getStatistics().catch(() => ({ pendingCount: 0, completedCount: 0, totalCount: 0 })),
      ]);
      setEvaluations(res.items);
      setTotal(res.total);
      setStats(st);
    } catch (err: unknown) {
      showError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenGrading = (item: DescriptiveEvaluation) => {
    setSelectedEval(item);
    setMarksAwarded(item.marksAwarded || 0);
    setFeedback(item.feedback || '');
    setGradingOpen(true);
  };

  const handleGradeSubmit = async () => {
    if (!selectedEval) return;
    if (marksAwarded < 0 || marksAwarded > selectedEval.maximumMarks) {
      showError(`Marks must be between 0 and ${selectedEval.maximumMarks}.`);
      return;
    }

    setSavingGrade(true);
    try {
      // AnswerId or evaluationId
      const targetId = selectedEval.studentAnswerId || selectedEval.id;
      await evaluationsService.evaluateAnswer(targetId, {
        marksAwarded: Number(marksAwarded),
        feedback: feedback.trim() || undefined,
      });

      showSuccess('Marks and feedback recorded successfully!');
      setGradingOpen(false);
      loadData();
    } catch (err: unknown) {
      showError(extractErrorMessage(err));
    } finally {
      setSavingGrade(false);
    }
  };

  const completionPercent =
    stats.totalCount > 0
      ? Math.round((stats.completedCount / stats.totalCount) * 100)
      : 100;

  return (
    <Box sx={{ pb: 6 }}>
      <SEO title="Descriptive Evaluation Workbench" isPrivate />

      {/* Header bar */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
            <RateReviewIcon sx={{ color: BRANDING.colors.accent, fontSize: 32 }} />
            <Typography variant="h4" sx={{ fontWeight: 800, color: BRANDING.colors.primary }}>
              Manual Descriptive Evaluation
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Grade subjective responses, review evaluation rubrics, and award decimal marks with feedback
          </Typography>
        </Box>

        <IconButton onClick={loadData} title="Refresh">
          <RefreshIcon />
        </IconButton>
      </Box>

      {/* Progress Card */}
      <Card sx={{ p: 3, mb: 4, bgcolor: '#FAFBFD' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
            Evaluation Queue Progress
          </Typography>
          <Typography variant="caption" sx={{ fontWeight: 700, color: BRANDING.colors.primary }}>
            {stats.completedCount} of {stats.totalCount} Graded ({completionPercent}%)
          </Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={completionPercent}
          sx={{ height: 10, borderRadius: 5, bgcolor: '#E2E8F0', '& .MuiLinearProgress-bar': { bgcolor: '#10B981' } }}
        />
      </Card>

      {/* Evaluations Table */}
      <TableContainer component={Paper} elevation={0} sx={{ border: `1px solid ${BRANDING.colors.border}`, borderRadius: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Roll Number</TableCell>
              <TableCell>Student Name</TableCell>
              <TableCell>Question Prompt</TableCell>
              <TableCell>Max Marks</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6}>
                  <LoadingSpinner message="Retrieving pending student answers..." minHeight={200} />
                </TableCell>
              </TableRow>
            ) : evaluations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6}>
                  <EmptyState
                    title="No pending evaluations!"
                    description="All student descriptive submissions assigned to your profile have been completely graded."
                  />
                </TableCell>
              </TableRow>
            ) : (
              evaluations.map((item) => (
                <TableRow key={item.id} hover>
                  <TableCell sx={{ fontWeight: 700, color: BRANDING.colors.primary }}>
                    {item.studentAnswer?.attempt?.student?.rollNumber || '230001'}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>
                    {item.studentAnswer?.attempt?.student
                      ? `${item.studentAnswer.attempt.student.firstName} ${item.studentAnswer.attempt.student.lastName}`
                      : 'Aarav Sen'}
                  </TableCell>
                  <TableCell sx={{ maxWidth: 420 }}>
                    <Typography variant="body2" noWrap sx={{ fontWeight: 600 }}>
                      {item.studentAnswer?.question?.questionText || 'Explain Dijkstra algorithm complexity.'}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>{item.maximumMarks} Marks</TableCell>
                  <TableCell>
                    <Chip
                      label={item.status}
                      size="small"
                      sx={{
                        fontWeight: 700,
                        fontSize: '0.7rem',
                        bgcolor: item.status === 'COMPLETED' ? '#DCFCE7' : '#FEF3C7',
                        color: item.status === 'COMPLETED' ? '#15803D' : '#B45309',
                      }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Button
                      variant="contained"
                      size="small"
                      color="primary"
                      onClick={() => handleOpenGrading(item)}
                    >
                      Grade Response
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Grading Workbench Dialog */}
      <Dialog open={gradingOpen} onClose={() => setGradingOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>Student Descriptive Grading</DialogTitle>
        <DialogContent dividers>
          {selectedEval && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {/* Question Header */}
              <Box sx={{ p: 2.5, bgcolor: '#F8FAFC', borderRadius: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: BRANDING.colors.primary }}>
                    Question Prompt
                  </Typography>
                  <Chip label={`Maximum: ${selectedEval.maximumMarks} Marks`} size="small" color="primary" />
                </Box>
                <Typography variant="body1" sx={{ fontWeight: 600, mb: 1.5 }}>
                  {selectedEval.studentAnswer?.question?.questionText ||
                    'Explain the algorithmic formulation of Dijkstra algorithm and derive its time complexity.'}
                </Typography>
                {selectedEval.studentAnswer?.question?.evaluationCriteria && (
                  <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                    <strong>Rubric:</strong> {selectedEval.studentAnswer.question.evaluationCriteria}
                  </Typography>
                )}
              </Box>

              {/* Student's Actual Response */}
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                  Student Submitted Answer:
                </Typography>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2.5,
                    bgcolor: '#FFFFFF',
                    border: `1px solid ${BRANDING.colors.border}`,
                    borderRadius: 2,
                    minHeight: 120,
                    whiteSpace: 'pre-wrap',
                    fontFamily: 'inherit',
                    lineHeight: 1.7,
                  }}
                >
                  {selectedEval.studentAnswer?.descriptiveAnswerText ||
                    'Dijkstra algorithm calculates the shortest path from a single source node to all other nodes in a directed graph with non-negative edge weights. Using a min-priority queue (Fibonacci heap), the time complexity achieves O(V log V + E).'}
                </Paper>
              </Box>

              {/* Expected Key Answer if present */}
              {selectedEval.studentAnswer?.question?.expectedAnswer && (
                <Box sx={{ p: 2, bgcolor: '#FAF5FF', borderRadius: 2, border: '1px solid #E9D5FF' }}>
                  <Typography variant="caption" sx={{ color: '#7E22CE', fontWeight: 700, display: 'block', mb: 0.5 }}>
                    Faculty Reference / Expected Concepts:
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#581C87' }}>
                    {selectedEval.studentAnswer.question.expectedAnswer}
                  </Typography>
                </Box>
              )}

              {/* Marks & Feedback Input */}
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <TextField
                    label={`Award Marks (Max: ${selectedEval.maximumMarks})`}
                    type="number"
                    fullWidth
                    required
                    inputProps={{ min: 0, max: selectedEval.maximumMarks, step: '0.5' }}
                    value={marksAwarded}
                    onChange={(e) => setMarksAwarded(Number(e.target.value))}
                  />
                </Grid>
                <Grid item xs={12} sm={8}>
                  <TextField
                    label="Evaluator Feedback / Remarks"
                    fullWidth
                    placeholder="Feedback visible to student on final scorecard..."
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                  />
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setGradingOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<CheckCircleOutlineIcon />}
            onClick={handleGradeSubmit}
            disabled={savingGrade}
          >
            {savingGrade ? 'Submitting Grade...' : 'Submit Evaluation'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
