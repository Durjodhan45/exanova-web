import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import RefreshIcon from '@mui/icons-material/Refresh';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import { SEO } from '../../components/common/SEO';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { dashboardService } from '../../services/dashboard.service';
import { resultsService } from '../../services/results.service';
import { useNotification } from '../../context/NotificationContext';
import { extractErrorMessage } from '../../services/api';
import { Result } from '../../types';
import { BRANDING } from '../../config/env';

export const StudentResultsPage: React.FC = () => {
  const { showSuccess, showError } = useNotification();
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchResults = async () => {
    setLoading(true);
    try {
      const data = await dashboardService.getStudentRecentResults();
      setResults(data);
    } catch (err: unknown) {
      showError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
  }, []);

  const handleDownloadScorecard = async (resultId: string, examTitle?: string) => {
    try {
      const blob = await resultsService.downloadScorecardPdf(resultId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `scorecard_${examTitle ? examTitle.replace(/\s+/g, '_') : 'exanova'}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      showSuccess('Official Scorecard PDF downloaded!');
    } catch (err: unknown) {
      showError(extractErrorMessage(err));
    }
  };

  if (loading) {
    return <LoadingSpinner message="Checking released examination scorecards..." />;
  }

  return (
    <Box sx={{ pb: 6 }}>
      <SEO title="Examination Results & Official Scorecards" isPrivate />

      {/* Header bar */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: BRANDING.colors.primary, mb: 0.5 }}>
            Results & Scorecards
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Official released examination scorecards, GPA grades, merit ranks, and evaluator feedback
          </Typography>
        </Box>

        <IconButton onClick={fetchResults} title="Refresh">
          <RefreshIcon />
        </IconButton>
      </Box>

      {results.length === 0 ? (
        <EmptyState
          title="No released examination results yet"
          description="Examination scorecards will appear here as soon as evaluations are completed and released by the examination branch."
        />
      ) : (
        <Stack spacing={3}>
          {results.map((r) => (
            <Card key={r.id} sx={{ p: 3, border: `1px solid ${BRANDING.colors.border}`, borderRadius: 2.5 }}>
              <Grid container spacing={3} alignItems="center">
                {/* Exam Title & Subject */}
                <Grid item xs={12} md={5}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: BRANDING.colors.primary }}>
                      {r.examination?.title || 'Examination Assessment'}
                    </Typography>
                    {r.rank && (
                      <Chip
                        icon={<EmojiEventsIcon />}
                        label={`Rank #${r.rank}`}
                        size="small"
                        sx={{ bgcolor: '#FEF3C7', color: '#B45309', fontWeight: 800 }}
                      />
                    )}
                  </Box>
                  <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>
                    Subject: {r.examination?.subject?.name || 'Computer Science'} • Term: {r.examination?.academicSession?.name || '2025-2026'}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    Released on: {r.releasedAt ? new Date(r.releasedAt).toLocaleDateString() : 'Released'}
                  </Typography>
                </Grid>

                {/* Score Breakdown */}
                <Grid item xs={12} md={4}>
                  <Grid container spacing={2}>
                    <Grid item xs={4}>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>Total Score</Typography>
                      <Typography variant="h6" sx={{ fontWeight: 800 }}>
                        {r.finalMarks} / {r.maximumMarks}
                      </Typography>
                    </Grid>
                    <Grid item xs={4}>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>Percentage</Typography>
                      <Typography variant="h6" sx={{ fontWeight: 800 }}>
                        {r.percentage.toFixed(1)}%
                      </Typography>
                    </Grid>
                    <Grid item xs={4}>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>Grade</Typography>
                      <Chip
                        label={`Grade ${r.grade}`}
                        size="small"
                        sx={{
                          fontWeight: 800,
                          bgcolor: r.passFailStatus === 'PASS' ? '#DCFCE7' : '#FEE2E2',
                          color: r.passFailStatus === 'PASS' ? '#15803D' : '#991B1B',
                        }}
                      />
                    </Grid>
                  </Grid>

                  <Box sx={{ display: 'flex', gap: 2, mt: 1.5, fontSize: '0.75rem', color: 'text.secondary' }}>
                    <span>Correct: <strong>{r.correctAnswers}</strong></span>
                    <span>Incorrect: <strong>{r.incorrectAnswers}</strong></span>
                    <span>Unanswered: <strong>{r.unansweredCount}</strong></span>
                  </Box>
                </Grid>

                {/* Download Button */}
                <Grid item xs={12} md={3} sx={{ textAlign: { md: 'right' } }}>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<PictureAsPdfIcon />}
                    onClick={() => handleDownloadScorecard(r.id, r.examination?.title)}
                    sx={{ px: 2.5, py: 1 }}
                  >
                    Download PDF Scorecard
                  </Button>
                </Grid>
              </Grid>
            </Card>
          ))}
        </Stack>
      )}
    </Box>
  );
};
