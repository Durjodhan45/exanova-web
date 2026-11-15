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
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import SendIcon from '@mui/icons-material/Send';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import RefreshIcon from '@mui/icons-material/Refresh';
import CalculateIcon from '@mui/icons-material/Calculate';
import { useSearchParams } from 'react-router-dom';
import { SEO } from '../../components/common/SEO';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { resultsService } from '../../services/results.service';
import { examinationsService } from '../../services/examinations.service';
import { reportsService } from '../../services/reports.service';
import { useNotification } from '../../context/NotificationContext';
import { extractErrorMessage } from '../../services/api';
import { Examination, Result } from '../../types';
import { BRANDING } from '../../config/env';

export const ResultsManagementPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialTestId = searchParams.get('testId') || 'ALL';

  const { showSuccess, showError } = useNotification();

  const [results, setResults] = useState<Result[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const [examinations, setExaminations] = useState<Examination[]>([]);
  const [selectedExamId, setSelectedExamId] = useState<string>(initialTestId);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Release Modal
  const [releaseOpen, setReleaseOpen] = useState(false);
  const [releaseRemarks, setReleaseRemarks] = useState('Official Examination Results Released.');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    examinationsService
      .getExaminations({ limit: 100 })
      .then((res) => setExaminations(res.items))
      .catch(() => {});
  }, []);

  const fetchResults = async () => {
    setLoading(true);
    try {
      const res = await resultsService.getResults({
        page: page + 1,
        limit: rowsPerPage,
        testId: selectedExamId !== 'ALL' ? selectedExamId : undefined,
      });
      setResults(res.items);
      setTotal(res.total);
    } catch (err: unknown) {
      showError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
  }, [page, rowsPerPage, selectedExamId]);

  const handleCalculateAll = async () => {
    if (selectedExamId === 'ALL') {
      showError('Please select a specific examination to calculate results.');
      return;
    }
    setActionLoading(true);
    try {
      await resultsService.calculateResults(selectedExamId);
      showSuccess('Results and merit ranks computed successfully!');
      fetchResults();
    } catch (err: unknown) {
      showError(extractErrorMessage(err));
    } finally {
      setActionLoading(false);
    }
  };

  const handleReleaseSubmit = async () => {
    if (selectedExamId === 'ALL') {
      showError('Please select a specific examination to release results.');
      return;
    }
    setActionLoading(true);
    try {
      await resultsService.releaseResults(selectedExamId, releaseRemarks);
      showSuccess('Results published and scorecards released to student portals!');
      setReleaseOpen(false);
      fetchResults();
    } catch (err: unknown) {
      showError(extractErrorMessage(err));
    } finally {
      setActionLoading(false);
    }
  };

  const handleWithhold = async () => {
    if (selectedExamId === 'ALL') {
      showError('Please select an examination.');
      return;
    }
    setActionLoading(true);
    try {
      await resultsService.withholdResults(selectedExamId);
      showSuccess('Results withheld from student visibility.');
      fetchResults();
    } catch (err: unknown) {
      showError(extractErrorMessage(err));
    } finally {
      setActionLoading(false);
    }
  };

  const handleDownloadScorecard = async (resultId: string, rollNumber: string) => {
    try {
      const blob = await resultsService.downloadScorecardPdf(resultId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `scorecard_${rollNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      showSuccess(`Scorecard downloaded for student ${rollNumber}`);
    } catch (err: unknown) {
      showError(extractErrorMessage(err));
    }
  };

  const handleExportExcel = async () => {
    try {
      const testId = selectedExamId !== 'ALL' ? selectedExamId : undefined;
      const blob = await reportsService.exportExcel(testId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'exanova_grade_sheet.xlsx';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      showSuccess('Excel grade sheet downloaded!');
    } catch (err: unknown) {
      showError(extractErrorMessage(err));
    }
  };

  return (
    <Box sx={{ pb: 4 }}>
      <SEO title="Results Management & Scorecards" isPrivate />

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
            Results & Scorecards
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Grade calculation, merit rank publishing, institutional withholding, and scorecard downloads
          </Typography>
        </Box>

        <Stack direction="row" spacing={1.5} flexWrap="wrap">
          <Button variant="outlined" startIcon={<FileDownloadIcon />} onClick={handleExportExcel}>
            Export Excel
          </Button>

          {selectedExamId !== 'ALL' && (
            <>
              <Button
                variant="outlined"
                color="secondary"
                startIcon={<CalculateIcon />}
                onClick={handleCalculateAll}
                disabled={actionLoading}
              >
                Re-Calculate Ranks
              </Button>
              <Button
                variant="outlined"
                color="error"
                startIcon={<VisibilityOffIcon />}
                onClick={handleWithhold}
                disabled={actionLoading}
              >
                Withhold
              </Button>
              <Button
                variant="contained"
                color="success"
                startIcon={<SendIcon />}
                onClick={() => setReleaseOpen(true)}
                disabled={actionLoading}
              >
                Release Results
              </Button>
            </>
          )}
        </Stack>
      </Box>

      {/* Filter by Exam */}
      <Card sx={{ p: 2.5, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={8}>
            <FormControl fullWidth size="small">
              <InputLabel>Filter by Examination</InputLabel>
              <Select
                value={selectedExamId}
                label="Filter by Examination"
                onChange={(e) => {
                  setSelectedExamId(e.target.value);
                  setPage(0);
                }}
              >
                <MenuItem value="ALL">All Examinations (Consolidated)</MenuItem>
                {examinations.map((ex) => (
                  <MenuItem key={ex.id} value={ex.id}>
                    {ex.title} ({ex.examinationCode})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={4} sx={{ textAlign: 'right' }}>
            <IconButton onClick={fetchResults} title="Refresh">
              <RefreshIcon />
            </IconButton>
          </Grid>
        </Grid>
      </Card>

      {/* Results Table */}
      <TableContainer component={Paper} elevation={0} sx={{ border: `1px solid ${BRANDING.colors.border}`, borderRadius: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Rank</TableCell>
              <TableCell>Roll No. & Student</TableCell>
              <TableCell>Examination</TableCell>
              <TableCell>MCQ Net</TableCell>
              <TableCell>Descriptive</TableCell>
              <TableCell>Final Marks</TableCell>
              <TableCell>Percentage & Grade</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">PDF Scorecard</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={9}>
                  <LoadingSpinner message="Calculating grade distribution..." minHeight={200} />
                </TableCell>
              </TableRow>
            ) : results.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9}>
                  <EmptyState
                    title="No results found"
                    description="No evaluated examination results are recorded for this selection. Calculate results once student attempts are submitted."
                  />
                </TableCell>
              </TableRow>
            ) : (
              results.map((r) => (
                <TableRow key={r.id} hover>
                  <TableCell>
                    {r.rank ? (
                      <Chip
                        label={`#${r.rank}`}
                        size="small"
                        sx={{
                          fontWeight: 800,
                          bgcolor: r.rank === 1 ? '#FEF3C7' : '#F1F5F9',
                          color: r.rank === 1 ? '#B45309' : '#475569',
                        }}
                      />
                    ) : (
                      '—'
                    )}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: BRANDING.colors.primary }}>
                      {r.student?.rollNumber || '230001'}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      {r.student ? `${r.student.firstName} ${r.student.lastName}` : 'Aarav Sen'}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ fontSize: '0.85rem' }}>
                    {r.examination?.title || 'Data Structures Midterm'}
                  </TableCell>
                  <TableCell sx={{ fontSize: '0.85rem' }}>
                    {r.netMcqScore} / {r.totalQuestions * 2}
                  </TableCell>
                  <TableCell sx={{ fontSize: '0.85rem' }}>
                    {r.descriptiveScore ?? '—'}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      {r.finalMarks} / {r.maximumMarks}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      {r.percentage.toFixed(1)}%
                    </Typography>
                    <Chip
                      label={`Grade ${r.grade}`}
                      size="small"
                      sx={{
                        height: 20,
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        bgcolor: r.passFailStatus === 'PASS' ? '#DCFCE7' : '#FEE2E2',
                        color: r.passFailStatus === 'PASS' ? '#15803D' : '#991B1B',
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={r.status} />
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Download Official PDF Scorecard">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleDownloadScorecard(r.id, r.student?.rollNumber || '230001')}
                      >
                        <PictureAsPdfIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
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

      {/* Release Results Dialog */}
      <Dialog open={releaseOpen} onClose={() => setReleaseOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, color: '#16A34A' }}>Release Results to Students</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="body2">
              Are you sure you want to officially publish and release results for this examination?
              Students will instantly view their grade and download PDF scorecards.
            </Typography>
            <TextField
              label="Official Remarks (Optional)"
              fullWidth
              size="small"
              multiline
              rows={2}
              value={releaseRemarks}
              onChange={(e) => setReleaseRemarks(e.target.value)}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setReleaseOpen(false)}>Cancel</Button>
          <Button variant="contained" color="success" onClick={handleReleaseSubmit} disabled={actionLoading}>
            {actionLoading ? 'Publishing...' : 'Confirm & Release'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
