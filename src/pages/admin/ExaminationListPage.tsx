import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Card,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Tabs,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PublishIcon from '@mui/icons-material/Publish';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import BlockIcon from '@mui/icons-material/Block';
import CalculateIcon from '@mui/icons-material/Calculate';
import AssessmentIcon from '@mui/icons-material/Assessment';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useNavigate } from 'react-router-dom';
import { SEO } from '../../components/common/SEO';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { examinationsService } from '../../services/examinations.service';
import { resultsService } from '../../services/results.service';
import { useNotification } from '../../context/NotificationContext';
import { extractErrorMessage } from '../../services/api';
import { Examination, ExaminationStatus } from '../../types';
import { BRANDING } from '../../config/env';

export const ExaminationListPage: React.FC = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotification();

  const [examinations, setExaminations] = useState<Examination[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusTab, setStatusTab] = useState<string>('ALL');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Preview Paper Modal
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewData, setPreviewData] = useState<any | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  // Cancel Modal
  const [cancelOpen, setCancelOpen] = useState(false);
  const [selectedExam, setSelectedExam] = useState<Examination | null>(null);
  const [cancelReason, setCancelReason] = useState('');

  const fetchExaminations = async () => {
    setLoading(true);
    try {
      const res = await examinationsService.getExaminations({
        page: page + 1,
        limit: rowsPerPage,
        search: search.trim() || undefined,
        status: statusTab !== 'ALL' ? (statusTab as ExaminationStatus) : undefined,
      });
      setExaminations(res.items);
      setTotal(res.total);
    } catch (err: unknown) {
      showError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExaminations();
  }, [page, rowsPerPage, statusTab]);

  const handlePublish = async (testId: string) => {
    try {
      await examinationsService.publishExamination(testId);
      showSuccess('Examination published and eligible students notified!');
      fetchExaminations();
    } catch (err: unknown) {
      showError(extractErrorMessage(err));
    }
  };

  const handleSchedule = async (testId: string) => {
    try {
      await examinationsService.scheduleExamination(testId);
      showSuccess('Examination scheduled successfully!');
      fetchExaminations();
    } catch (err: unknown) {
      showError(extractErrorMessage(err));
    }
  };

  const handleCancelSubmit = async () => {
    if (!selectedExam) return;
    try {
      await examinationsService.cancelExamination(selectedExam.id, cancelReason);
      showSuccess('Examination marked as cancelled.');
      setCancelOpen(false);
      setCancelReason('');
      fetchExaminations();
    } catch (err: unknown) {
      showError(extractErrorMessage(err));
    }
  };

  const handleCalculateResults = async (testId: string) => {
    try {
      await resultsService.calculateResults(testId);
      showSuccess('Results and merit ranks computed successfully!');
      fetchExaminations();
    } catch (err: unknown) {
      showError(extractErrorMessage(err));
    }
  };

  const handlePreviewPaper = async (testId: string) => {
    setPreviewLoading(true);
    setPreviewOpen(true);
    try {
      const data = await examinationsService.getPreview(testId);
      setPreviewData(data);
    } catch (err: unknown) {
      showError(extractErrorMessage(err));
      setPreviewOpen(false);
    } finally {
      setPreviewLoading(false);
    }
  };

  return (
    <Box sx={{ pb: 4 }}>
      <SEO title="Examination Management" isPrivate />

      {/* Header bar */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
          gap: 2,
          mb: 4,
        }}
      >
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: BRANDING.colors.primary, mb: 0.5 }}>
            Examination Registry
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Authoritative Test UUID tracking, lifecycle publication, scheduling, and evaluation control
          </Typography>
        </Box>

        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => navigate('/faculty/examinations/create')}
        >
          Create Examination
        </Button>
      </Box>

      {/* Status Tabs */}
      <Card sx={{ mb: 3 }}>
        <Tabs
          value={statusTab}
          onChange={(_, val) => {
            setStatusTab(val);
            setPage(0);
          }}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: `1px solid ${BRANDING.colors.border}`, px: 2 }}
        >
          <Tab value="ALL" label="All Examinations" />
          <Tab value="DRAFT" label="Drafts" />
          <Tab value="SCHEDULED" label="Scheduled" />
          <Tab value="PUBLISHED" label="Published" />
          <Tab value="LIVE" label="Live (Ongoing)" />
          <Tab value="COMPLETED" label="Completed" />
          <Tab value="CANCELLED" label="Cancelled" />
        </Tabs>

        {/* Search */}
        <Box sx={{ p: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Search examination title or code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                setPage(0);
                fetchExaminations();
              }
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" color="action" />
                </InputAdornment>
              ),
            }}
          />
          <IconButton onClick={fetchExaminations} title="Refresh">
            <RefreshIcon />
          </IconButton>
        </Box>
      </Card>

      {/* Examinations Table */}
      <TableContainer component={Paper} elevation={0} sx={{ border: `1px solid ${BRANDING.colors.border}`, borderRadius: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Exam Title & Code</TableCell>
              <TableCell>Subject & Term</TableCell>
              <TableCell>Type & Marks</TableCell>
              <TableCell>Duration & Window</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6}>
                  <LoadingSpinner message="Retrieving examination ledger..." minHeight={200} />
                </TableCell>
              </TableRow>
            ) : examinations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6}>
                  <EmptyState
                    title="No examinations found"
                    description="No examinations correspond to the active filter."
                    actionText="Create Examination"
                    onAction={() => navigate('/faculty/examinations/create')}
                  />
                </TableCell>
              </TableRow>
            ) : (
              examinations.map((exam) => (
                <TableRow key={exam.id} hover>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: BRANDING.colors.primary }}>
                      {exam.title}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                      {exam.examinationCode}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {exam.subject?.name || 'Data Structures'}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      {exam.department?.code || 'CSE'} • {exam.semester?.name || 'Sem 5'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={exam.examinationType}
                      size="small"
                      sx={{
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        mr: 1,
                        bgcolor: exam.examinationType === 'MCQ' ? '#E0F2FE' : '#EDE9FE',
                      }}
                    />
                    <Typography variant="caption" sx={{ fontWeight: 600 }}>
                      {exam.totalMarks} Marks (Pass: {exam.passingMarks})
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {exam.durationMinutes} Mins
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                      {new Date(exam.startWindow).toLocaleDateString()}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={exam.status} />
                  </TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                      <Tooltip title="Preview Paper">
                        <IconButton size="small" onClick={() => handlePreviewPaper(exam.id)}>
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>

                      {(exam.status === 'DRAFT' || exam.status === 'SCHEDULED') && (
                        <Tooltip title="Publish Exam">
                          <IconButton
                            size="small"
                            color="success"
                            onClick={() => handlePublish(exam.id)}
                          >
                            <PublishIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}

                      {exam.status === 'DRAFT' && (
                        <Tooltip title="Schedule Exam">
                          <IconButton
                            size="small"
                            color="info"
                            onClick={() => handleSchedule(exam.id)}
                          >
                            <EventAvailableIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}

                      {(exam.status === 'LIVE' || exam.status === 'COMPLETED' || exam.status === 'PUBLISHED') && (
                        <Tooltip title="Calculate & Rank Results">
                          <IconButton
                            size="small"
                            color="secondary"
                            onClick={() => handleCalculateResults(exam.id)}
                          >
                            <CalculateIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}

                      <Tooltip title="View Results">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => navigate(`/admin/results?testId=${exam.id}`)}
                        >
                          <AssessmentIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>

                      {exam.status !== 'CANCELLED' && exam.status !== 'COMPLETED' && (
                        <Tooltip title="Cancel Exam">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => {
                              setSelectedExam(exam);
                              setCancelOpen(true);
                            }}
                          >
                            <BlockIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Stack>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={total}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
        />
      </TableContainer>

      {/* Paper Preview Dialog */}
      <Dialog open={previewOpen} onClose={() => setPreviewOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>Examination Paper Preview</DialogTitle>
        <DialogContent dividers>
          {previewLoading ? (
            <LoadingSpinner message="Fetching authoritative question paper..." />
          ) : !previewData ? (
            <Typography>No paper details available.</Typography>
          ) : (
            <Box>
              <Box sx={{ p: 2, bgcolor: '#F8FAFC', borderRadius: 2, mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 800, color: BRANDING.colors.primary }}>
                  {previewData.examination?.title}
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Code: {previewData.examination?.examinationCode} • Duration: {previewData.examination?.durationMinutes} Minutes • Total Marks: {previewData.totalMarks || previewData.examination?.totalMarks}
                </Typography>
                {previewData.examination?.instructions && (
                  <Typography variant="caption" sx={{ display: 'block', mt: 1, fontStyle: 'italic' }}>
                    Instructions: {previewData.examination.instructions}
                  </Typography>
                )}
              </Box>

              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>
                Question Set ({previewData.questions?.length || 0} Questions):
              </Typography>

              <Stack spacing={2.5}>
                {previewData.questions?.map((q: any, idx: number) => (
                  <Paper key={q.id || idx} sx={{ p: 2.5, border: `1px solid ${BRANDING.colors.border}` }} elevation={0}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                        Q{idx + 1}. {q.questionText}
                      </Typography>
                      <Chip label={`+${q.marks} Marks`} size="small" color="primary" />
                    </Box>
                    {q.options && q.options.length > 0 && (
                      <Box sx={{ pl: 2, mt: 1.5, display: 'flex', flexDirection: 'column', gap: 0.8 }}>
                        {q.options.map((opt: any) => (
                          <Box
                            key={opt.id}
                            sx={{
                              p: 1,
                              borderRadius: 1,
                              bgcolor: opt.isCorrect ? '#DCFCE7' : 'transparent',
                              border: opt.isCorrect ? '1px solid #16A34A' : '1px solid #E2E8F0',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                            }}
                          >
                            <Typography variant="body2">
                              <strong>{opt.optionLabel}.</strong> {opt.optionText}
                            </Typography>
                            {opt.isCorrect && (
                              <Typography variant="caption" sx={{ fontWeight: 700, color: '#16A34A' }}>
                                Correct Answer
                              </Typography>
                            )}
                          </Box>
                        ))}
                      </Box>
                    )}
                  </Paper>
                ))}
              </Stack>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setPreviewOpen(false)} variant="contained">
            Close Preview
          </Button>
        </DialogActions>
      </Dialog>

      {/* Cancel Exam Confirmation */}
      <Dialog open={cancelOpen} onClose={() => setCancelOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, color: '#DC2626' }}>Cancel Examination</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Are you sure you want to cancel <strong>{selectedExam?.title}</strong>? All enrolled students
            will receive a notification.
          </Typography>
          <TextField
            label="Cancellation Reason (Optional)"
            fullWidth
            size="small"
            multiline
            rows={3}
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setCancelOpen(false)}>Back</Button>
          <Button variant="contained" color="error" onClick={handleCancelSubmit}>
            Confirm Cancellation
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
