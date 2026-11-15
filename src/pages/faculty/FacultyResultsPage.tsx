import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  FormControl,
  Grid,
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
  TableRow,
  Typography,
} from '@mui/material';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import { useSearchParams } from 'react-router-dom';
import { SEO } from '../../components/common/SEO';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { StatusBadge } from '../../components/common/StatusBadge';
import { resultsService } from '../../services/results.service';
import { examinationsService } from '../../services/examinations.service';
import { reportsService } from '../../services/reports.service';
import { useNotification } from '../../context/NotificationContext';
import { extractErrorMessage } from '../../services/api';
import { Examination, Result } from '../../types';
import { BRANDING } from '../../config/env';

export const FacultyResultsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialTestId = searchParams.get('testId') || '';

  const { showSuccess, showError } = useNotification();

  const [examinations, setExaminations] = useState<Examination[]>([]);
  const [selectedTestId, setSelectedTestId] = useState<string>(initialTestId);
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    examinationsService
      .getExaminations({ limit: 100 })
      .then((res) => {
        setExaminations(res.items);
        if (!selectedTestId && res.items.length > 0) {
          setSelectedTestId(res.items[0].id);
        }
      })
      .catch(() => {});
  }, []);

  const fetchResults = async () => {
    if (!selectedTestId) return;
    setLoading(true);
    try {
      const res = await resultsService.getByTestId(selectedTestId);
      setResults(res);
    } catch (err: unknown) {
      showError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedTestId) {
      fetchResults();
    }
  }, [selectedTestId]);

  const handleExportExcel = async () => {
    try {
      const blob = await reportsService.exportExcel(selectedTestId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `grade_sheet_${selectedTestId}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      showSuccess('Excel grade sheet downloaded!');
    } catch (err: unknown) {
      showError(extractErrorMessage(err));
    }
  };

  const handleExportPdf = async () => {
    try {
      const blob = await reportsService.exportPdf(selectedTestId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `grade_summary_${selectedTestId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      showSuccess('PDF summary downloaded!');
    } catch (err: unknown) {
      showError(extractErrorMessage(err));
    }
  };

  const avgMarks =
    results.length > 0
      ? (results.reduce((sum, r) => sum + r.finalMarks, 0) / results.length).toFixed(1)
      : '0.0';

  const passRate =
    results.length > 0
      ? Math.round(
          (results.filter((r) => r.passFailStatus === 'PASS').length / results.length) * 100,
        )
      : 0;

  return (
    <Box sx={{ pb: 6 }}>
      <SEO title="Examination Results & Performance" isPrivate />

      {/* Header */}
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
            Examination Performance & Results
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Score analytics, passing rates, and student answer breakdowns
          </Typography>
        </Box>

        <Stack direction="row" spacing={1.5}>
          <Button variant="outlined" startIcon={<FileDownloadIcon />} onClick={handleExportExcel}>
            Export Excel
          </Button>
          <Button variant="contained" startIcon={<PictureAsPdfIcon />} onClick={handleExportPdf}>
            Export PDF
          </Button>
        </Stack>
      </Box>

      {/* Exam Selector & Stats */}
      <Card sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={6}>
            <FormControl fullWidth size="small">
              <InputLabel>Select Examination</InputLabel>
              <Select
                value={selectedTestId}
                label="Select Examination"
                onChange={(e) => setSelectedTestId(e.target.value)}
              >
                {examinations.map((ex) => (
                  <MenuItem key={ex.id} value={ex.id}>
                    {ex.title} ({ex.examinationCode})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={4} md={2}>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>Total Submissions</Typography>
            <Typography variant="h6" sx={{ fontWeight: 800, color: BRANDING.colors.primary }}>
              {results.length}
            </Typography>
          </Grid>
          <Grid item xs={4} md={2}>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>Average Score</Typography>
            <Typography variant="h6" sx={{ fontWeight: 800, color: BRANDING.colors.primary }}>
              {avgMarks} Marks
            </Typography>
          </Grid>
          <Grid item xs={4} md={2}>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>Passing Rate</Typography>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#16A34A' }}>
              {passRate}%
            </Typography>
          </Grid>
        </Grid>
      </Card>

      {/* Results Table */}
      <TableContainer component={Paper} elevation={0} sx={{ border: `1px solid ${BRANDING.colors.border}`, borderRadius: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Merit Rank</TableCell>
              <TableCell>Roll Number</TableCell>
              <TableCell>Student Name</TableCell>
              <TableCell>MCQ Net</TableCell>
              <TableCell>Descriptive</TableCell>
              <TableCell>Final Marks</TableCell>
              <TableCell>Percentage & Grade</TableCell>
              <TableCell>Outcome</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={9}>
                  <LoadingSpinner message="Loading results ledger..." minHeight={200} />
                </TableCell>
              </TableRow>
            ) : results.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9}>
                  <EmptyState
                    title="No results calculated yet"
                    description="When student attempts are completed and descriptive evaluations are graded, calculate results to display merit standings."
                  />
                </TableCell>
              </TableRow>
            ) : (
              results.map((r) => (
                <TableRow key={r.id} hover>
                  <TableCell>
                    {r.rank ? <Chip label={`#${r.rank}`} size="small" sx={{ fontWeight: 800 }} /> : '—'}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, color: BRANDING.colors.primary }}>
                    {r.student?.rollNumber || '230001'}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>
                    {r.student ? `${r.student.firstName} ${r.student.lastName}` : 'Aarav Sen'}
                  </TableCell>
                  <TableCell sx={{ fontSize: '0.85rem' }}>{r.netMcqScore}</TableCell>
                  <TableCell sx={{ fontSize: '0.85rem' }}>{r.descriptiveScore ?? '—'}</TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      {r.finalMarks} / {r.maximumMarks}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {r.percentage.toFixed(1)}% (Grade {r.grade})
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={r.passFailStatus}
                      size="small"
                      sx={{
                        fontWeight: 700,
                        bgcolor: r.passFailStatus === 'PASS' ? '#DCFCE7' : '#FEE2E2',
                        color: r.passFailStatus === 'PASS' ? '#15803D' : '#991B1B',
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={r.status} />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};
