import React, { useEffect, useState } from 'react';
import {
  Avatar,
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
import AssignmentIcon from '@mui/icons-material/Assignment';
import FactCheckIcon from '@mui/icons-material/FactCheck';
import UpcomingIcon from '@mui/icons-material/Upcoming';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import RateReviewIcon from '@mui/icons-material/RateReview';
import GroupsIcon from '@mui/icons-material/Groups';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import RefreshIcon from '@mui/icons-material/Refresh';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import { useNavigate } from 'react-router-dom';
import { SEO } from '../../components/common/SEO';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { StatusBadge } from '../../components/common/StatusBadge';
import { dashboardService } from '../../services/dashboard.service';
import { facultyService } from '../../services/faculty.service';
import { Examination, FacultyDashboardData, Subject } from '../../types';
import { BRANDING } from '../../config/env';

export const FacultyDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState<FacultyDashboardData | null>(null);
  const [examinations, setExaminations] = useState<Examination[]>([]);
  const [pendingEvals, setPendingEvals] = useState<any[]>([]);
  const [mySubjects, setMySubjects] = useState<Subject[]>([]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [ov, exams, evals, subs] = await Promise.all([
        dashboardService.getFacultyOverview().catch(() => ({
          totalCreatedExaminations: 1,
          publishedExaminations: 1,
          upcomingExaminations: 0,
          completedExaminations: 0,
          totalStudentSubmissions: 0,
          pendingDescriptiveEvaluations: 0,
        })),
        dashboardService.getFacultyExaminations().catch(() => []),
        dashboardService.getFacultyPendingEvaluations().catch(() => []),
        facultyService.getMySubjects().catch(() => []),
      ]);
      setOverview(ov);
      setExaminations(exams);
      setPendingEvals(evals);
      setMySubjects(subs);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Loading faculty workbench..." />;
  }

  const statCards = [
    {
      title: 'Created Exams',
      value: overview?.totalCreatedExaminations ?? 0,
      icon: <AssignmentIcon sx={{ color: '#0D9488' }} />,
      bg: '#CCFBF1',
      link: '/faculty/examinations',
    },
    {
      title: 'Published Exams',
      value: overview?.publishedExaminations ?? 0,
      icon: <FactCheckIcon sx={{ color: '#16A34A' }} />,
      bg: '#DCFCE7',
      link: '/faculty/examinations',
    },
    {
      title: 'Upcoming Exams',
      value: overview?.upcomingExaminations ?? 0,
      icon: <UpcomingIcon sx={{ color: '#D97706' }} />,
      bg: '#FEF3C7',
      link: '/faculty/examinations',
    },
    {
      title: 'Completed Exams',
      value: overview?.completedExaminations ?? 0,
      icon: <CheckCircleOutlineIcon sx={{ color: '#4B5563' }} />,
      bg: '#F3F4F6',
      link: '/faculty/examinations',
    },
    {
      title: 'Student Submissions',
      value: overview?.totalStudentSubmissions ?? 0,
      icon: <GroupsIcon sx={{ color: '#0284C7' }} />,
      bg: '#E0F2FE',
      link: '/faculty/results',
    },
    {
      title: 'Pending Evaluations',
      value: overview?.pendingDescriptiveEvaluations ?? 0,
      icon: <RateReviewIcon sx={{ color: '#DC2626' }} />,
      bg: '#FEE2E2',
      link: '/faculty/evaluations',
    },
  ];

  return (
    <Box sx={{ pb: 4 }}>
      <SEO title="Faculty Examination Workbench" isPrivate />

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
            Faculty Workbench
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Course examinations, zero-storage paper authoring, and descriptive grading
          </Typography>
        </Box>

        <Stack direction="row" spacing={1.5} flexWrap="wrap">
          <IconButton onClick={loadData} sx={{ border: `1px solid ${BRANDING.colors.border}`, bgcolor: '#FFFFFF' }}>
            <RefreshIcon fontSize="small" />
          </IconButton>
          <Button
            variant="outlined"
            color="secondary"
            startIcon={<UploadFileIcon />}
            onClick={() => navigate('/faculty/import')}
          >
            Import Paper
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddCircleOutlineIcon />}
            onClick={() => navigate('/faculty/examinations/create')}
          >
            Create Examination
          </Button>
        </Stack>
      </Box>

      {/* 6 Statistics Cards */}
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        {statCards.map((stat, idx) => (
          <Grid item xs={12} sm={6} md={4} lg={2} key={idx}>
            <Card
              sx={{
                cursor: 'pointer',
                p: 0.5,
                '&:hover': { transform: 'translateY(-3px)', boxShadow: '0 6px 16px rgba(0,0,0,0.06)' },
              }}
              onClick={() => navigate(stat.link)}
            >
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                  <Typography variant="subtitle2" sx={{ color: 'text.secondary', fontWeight: 600, fontSize: '0.8rem' }}>
                    {stat.title}
                  </Typography>
                  <Box
                    sx={{
                      width: 36,
                      height: 36,
                      borderRadius: 2,
                      bgcolor: stat.bg,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {stat.icon}
                  </Box>
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 800, color: BRANDING.colors.primary }}>
                  {stat.value}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Main Grid: My Examinations & Pending Evaluations Queue */}
      <Grid container spacing={3}>
        {/* My Examinations Table */}
        <Grid item xs={12} lg={8}>
          <Card sx={{ p: 2.5 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                My Examinations
              </Typography>
              <Button size="small" endIcon={<ArrowForwardIcon />} onClick={() => navigate('/faculty/examinations')}>
                Manage All
              </Button>
            </Box>

            <TableContainer component={Paper} elevation={0} sx={{ border: `1px solid ${BRANDING.colors.border}` }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Title & Code</TableCell>
                    <TableCell>Type & Marks</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {examinations.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                        No examinations created yet. Click "Create Examination" to begin.
                      </TableCell>
                    </TableRow>
                  ) : (
                    examinations.slice(0, 5).map((exam) => (
                      <TableRow key={exam.id} hover>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 700 }}>
                            {exam.title}
                          </Typography>
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            {exam.examinationCode}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip label={exam.examinationType} size="small" sx={{ mr: 1, fontSize: '0.65rem' }} />
                          {exam.totalMarks} Marks
                        </TableCell>
                        <TableCell sx={{ fontSize: '0.8rem' }}>
                          {new Date(exam.startWindow).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={exam.status} />
                        </TableCell>
                        <TableCell align="right">
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => navigate(`/faculty/examinations/${exam.id}/questions`)}
                          >
                            Questions
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        </Grid>

        {/* Assigned Subjects & Pending Evaluations */}
        <Grid item xs={12} lg={4}>
          <Stack spacing={3}>
            {/* Pending Descriptive Evaluations Queue */}
            <Card sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Evaluation Queue
                </Typography>
                <Chip
                  label={`${pendingEvals.length} Pending`}
                  size="small"
                  color={pendingEvals.length > 0 ? 'error' : 'default'}
                />
              </Box>

              {pendingEvals.length === 0 ? (
                <Box sx={{ p: 3, textAlign: 'center', bgcolor: '#FAFBFD', borderRadius: 2 }}>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    All descriptive student submissions evaluated!
                  </Typography>
                </Box>
              ) : (
                <Stack spacing={1.5}>
                  {pendingEvals.slice(0, 3).map((item, idx) => (
                    <Box
                      key={idx}
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        border: `1px solid ${BRANDING.colors.border}`,
                        bgcolor: '#FAFBFD',
                      }}
                    >
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {item.studentName || 'Student Submission'}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 1 }}>
                        Exam: {item.examTitle || 'Data Structures Midterm'}
                      </Typography>
                      <Button
                        size="small"
                        variant="contained"
                        color="secondary"
                        onClick={() => navigate('/faculty/evaluations')}
                        sx={{ fontSize: '0.75rem', py: 0.3 }}
                      >
                        Grade Now
                      </Button>
                    </Box>
                  ))}
                </Stack>
              )}
            </Card>

            {/* Assigned Subjects */}
            <Card sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <MenuBookIcon sx={{ color: BRANDING.colors.accent, fontSize: 22 }} />
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  My Assigned Subjects
                </Typography>
              </Box>

              {mySubjects.length === 0 ? (
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  No subject allocations assigned yet.
                </Typography>
              ) : (
                <Stack spacing={1}>
                  {mySubjects.map((sub) => (
                    <Box
                      key={sub.id}
                      sx={{
                        p: 1.5,
                        borderRadius: 1.5,
                        bgcolor: '#F8FAFC',
                        border: `1px solid ${BRANDING.colors.border}`,
                      }}
                    >
                      <Typography variant="body2" sx={{ fontWeight: 700, color: BRANDING.colors.primary }}>
                        {sub.name}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        Code: {sub.code} • {sub.credits} Credits
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              )}
            </Card>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
};
