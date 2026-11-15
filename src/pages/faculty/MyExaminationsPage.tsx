import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Card,
  Chip,
  IconButton,
  Paper,
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
import AddIcon from '@mui/icons-material/Add';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';
import PublishIcon from '@mui/icons-material/Publish';
import AssessmentIcon from '@mui/icons-material/Assessment';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useNavigate } from 'react-router-dom';
import { SEO } from '../../components/common/SEO';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { examinationsService } from '../../services/examinations.service';
import { useNotification } from '../../context/NotificationContext';
import { extractErrorMessage } from '../../services/api';
import { Examination, ExaminationStatus } from '../../types';
import { BRANDING } from '../../config/env';

export const MyExaminationsPage: React.FC = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotification();

  const [examinations, setExaminations] = useState<Examination[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const [statusTab, setStatusTab] = useState<string>('ALL');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const fetchExams = async () => {
    setLoading(true);
    try {
      const res = await examinationsService.getExaminations({
        page: page + 1,
        limit: rowsPerPage,
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
    fetchExams();
  }, [page, rowsPerPage, statusTab]);

  const handlePublish = async (testId: string) => {
    try {
      await examinationsService.publishExamination(testId);
      showSuccess('Examination published and eligible cohort notified!');
      fetchExams();
    } catch (err: unknown) {
      showError(extractErrorMessage(err));
    }
  };

  return (
    <Box sx={{ pb: 4 }}>
      <SEO title="My Examinations" isPrivate />

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
            My Examinations
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Manage authored question papers, schedule tests, and publish student assessments
          </Typography>
        </Box>

        <Stack direction="row" spacing={1.5}>
          <Button
            variant="outlined"
            startIcon={<UploadFileIcon />}
            onClick={() => navigate('/faculty/import')}
          >
            Import Questions
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => navigate('/faculty/examinations/create')}
          >
            Create Examination
          </Button>
        </Stack>
      </Box>

      {/* Status Tabs */}
      <Card sx={{ mb: 3 }}>
        <Tabs
          value={statusTab}
          onChange={(_, val) => {
            setStatusTab(val);
            setPage(0);
          }}
          sx={{ borderBottom: `1px solid ${BRANDING.colors.border}`, px: 2 }}
        >
          <Tab value="ALL" label="All" />
          <Tab value="DRAFT" label="Drafts" />
          <Tab value="SCHEDULED" label="Scheduled" />
          <Tab value="PUBLISHED" label="Published" />
          <Tab value="LIVE" label="Live" />
          <Tab value="COMPLETED" label="Completed" />
        </Tabs>
      </Card>

      {/* Table */}
      <TableContainer component={Paper} elevation={0} sx={{ border: `1px solid ${BRANDING.colors.border}`, borderRadius: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Title & Code</TableCell>
              <TableCell>Subject & Term</TableCell>
              <TableCell>Type & Marks</TableCell>
              <TableCell>Duration & Date</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6}>
                  <LoadingSpinner message="Loading examinations..." minHeight={200} />
                </TableCell>
              </TableRow>
            ) : examinations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6}>
                  <EmptyState
                    title="No examinations created yet"
                    description="Create your first examination paper or import questions from DOCX / XLSX."
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
                      {exam.semester?.name || 'Semester 5'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip label={exam.examinationType} size="small" sx={{ mr: 1, fontSize: '0.65rem' }} />
                    <Typography variant="caption" sx={{ fontWeight: 700 }}>
                      {exam.totalMarks} M
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{exam.durationMinutes} Mins</Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      {new Date(exam.startWindow).toLocaleDateString()}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={exam.status} />
                  </TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<QuestionAnswerIcon />}
                        onClick={() => navigate(`/faculty/examinations/${exam.id}/questions`)}
                      >
                        Questions
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        color="secondary"
                        startIcon={<UploadFileIcon />}
                        onClick={() => navigate(`/faculty/import?testId=${exam.id}`)}
                      >
                        Import
                      </Button>
                      {(exam.status === 'DRAFT' || exam.status === 'SCHEDULED') && (
                        <Button
                          size="small"
                          variant="contained"
                          color="success"
                          startIcon={<PublishIcon />}
                          onClick={() => handlePublish(exam.id)}
                        >
                          Publish
                        </Button>
                      )}
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => navigate(`/faculty/results?testId=${exam.id}`)}
                      >
                        <AssessmentIcon fontSize="small" />
                      </IconButton>
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
    </Box>
  );
};
