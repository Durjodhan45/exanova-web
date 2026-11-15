import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Typography,
} from '@mui/material';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import AssessmentIcon from '@mui/icons-material/Assessment';
import SchoolIcon from '@mui/icons-material/School';
import PeopleIcon from '@mui/icons-material/People';
import { SEO } from '../../components/common/SEO';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { reportsService } from '../../services/reports.service';
import { examinationsService } from '../../services/examinations.service';
import { useNotification } from '../../context/NotificationContext';
import { extractErrorMessage } from '../../services/api';
import { Examination } from '../../types';
import { BRANDING } from '../../config/env';

export const ReportsPage: React.FC = () => {
  const { showSuccess, showError } = useNotification();

  const [examinations, setExaminations] = useState<Examination[]>([]);
  const [selectedExamId, setSelectedExamId] = useState<string>('ALL');
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    examinationsService
      .getExaminations({ limit: 100 })
      .then((res) => setExaminations(res.items))
      .catch(() => {});
  }, []);

  const handleExportExcel = async () => {
    setDownloading(true);
    try {
      const testId = selectedExamId !== 'ALL' ? selectedExamId : undefined;
      const blob = await reportsService.exportExcel(testId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'exanova_performance_master.xlsx';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      showSuccess('Excel master performance report downloaded!');
    } catch (err: unknown) {
      showError(extractErrorMessage(err));
    } finally {
      setDownloading(false);
    }
  };

  const handleExportPdf = async () => {
    setDownloading(true);
    try {
      const testId = selectedExamId !== 'ALL' ? selectedExamId : undefined;
      const blob = await reportsService.exportPdf(testId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'exanova_performance_summary.pdf';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      showSuccess('PDF summary performance report downloaded!');
    } catch (err: unknown) {
      showError(extractErrorMessage(err));
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Box sx={{ pb: 4 }}>
      <SEO title="Academic Reporting & Analytics" isPrivate />

      {/* Header bar */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, color: BRANDING.colors.primary, mb: 0.5 }}>
          Reporting & Analytics
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Stream dynamic PDF score reports and multi-sheet Excel grade summaries generated on-the-fly
        </Typography>
      </Box>

      {/* Filter Card */}
      <Card sx={{ p: 3, mb: 4 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>
          Select Examination Target
        </Typography>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={7}>
            <FormControl fullWidth size="small">
              <InputLabel>Examination</InputLabel>
              <Select
                value={selectedExamId}
                label="Examination"
                onChange={(e) => setSelectedExamId(e.target.value)}
              >
                <MenuItem value="ALL">All Completed Examinations (Consolidated Master Report)</MenuItem>
                {examinations.map((ex) => (
                  <MenuItem key={ex.id} value={ex.id}>
                    {ex.title} ({ex.examinationCode})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={5}>
            <Stack direction="row" spacing={2}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<FileDownloadIcon />}
                onClick={handleExportExcel}
                disabled={downloading}
                sx={{ flex: 1 }}
              >
                {downloading ? 'Streaming...' : 'Export Excel (.xlsx)'}
              </Button>
              <Button
                variant="contained"
                color="secondary"
                startIcon={<PictureAsPdfIcon />}
                onClick={handleExportPdf}
                disabled={downloading}
                sx={{ flex: 1 }}
              >
                {downloading ? 'Streaming...' : 'Export PDF (.pdf)'}
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </Card>

      {/* Report Categories Grid */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%', p: 1 }}>
            <CardContent>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 2,
                  bgcolor: '#E0F2FE',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#0284C7',
                  mb: 2,
                }}
              >
                <AssessmentIcon />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                Consolidated Grade Sheet
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2.5, lineHeight: 1.6 }}>
                Full tabular breakdown with student roll numbers, MCQ accurate scores, negative marking
                deductions, descriptive marks, final GPA/Percentage, and merit ranks.
              </Typography>
              <Button size="small" variant="outlined" onClick={handleExportExcel} disabled={downloading}>
                Download Spreadsheet
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%', p: 1 }}>
            <CardContent>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 2,
                  bgcolor: '#DCFCE7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#16A34A',
                  mb: 2,
                }}
              >
                <PictureAsPdfIcon />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                Official Examination Summary
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2.5, lineHeight: 1.6 }}>
                Publication-ready PDF document formatted with {BRANDING.organization} header, passing
                statistics, top merit performers, and institutional clearance signatures.
              </Typography>
              <Button size="small" variant="outlined" onClick={handleExportPdf} disabled={downloading}>
                Generate PDF
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%', p: 1 }}>
            <CardContent>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 2,
                  bgcolor: '#EDE9FE',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#7C3AED',
                  mb: 2,
                }}
              >
                <SchoolIcon />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                Zero File Storage Compliance
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2.5, lineHeight: 1.6 }}>
                All Excel and PDF documents are dynamically generated from memory buffers using ExcelJS and
                PDFKit. No intermediate reports are ever persisted to disk or cloud buckets.
              </Typography>
              <Typography variant="caption" sx={{ color: BRANDING.colors.accent, fontWeight: 700 }}>
                • Compliant with ExaNova Architecture
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};
