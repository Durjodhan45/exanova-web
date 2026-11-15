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
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AssessmentIcon from '@mui/icons-material/Assessment';
import RefreshIcon from '@mui/icons-material/Refresh';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import TimerIcon from '@mui/icons-material/Timer';
import { useNavigate } from 'react-router-dom';
import { SEO } from '../../components/common/SEO';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { StatusBadge } from '../../components/common/StatusBadge';
import { useAuth } from '../../context/AuthContext';
import { dashboardService } from '../../services/dashboard.service';
import { resultsService } from '../../services/results.service';
import { useNotification } from '../../context/NotificationContext';
import { Examination, Result, StudentDashboardData } from '../../types';
import { BRANDING } from '../../config/env';

export const StudentDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showSuccess, showError } = useNotification();

  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState<StudentDashboardData | null>(null);
  const [upcomingExams, setUpcomingExams] = useState<Examination[]>([]);
  const [recentResults, setRecentResults] = useState<Result[]>([]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [ov, up, res] = await Promise.all([
        dashboardService.getStudentOverview().catch(() => ({
          upcomingCount: 1,
          activeCount: 1,
          completedCount: 0,
          eligibleExaminations: [],
          recentResults: [],
        })),
        dashboardService.getStudentUpcoming().catch(() => []),
        dashboardService.getStudentRecentResults().catch(() => []),
      ]);
      setOverview(ov);
      setUpcomingExams(up);
      setRecentResults(res);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDownloadScorecard = async (resultId: string) => {
    try {
      const blob = await resultsService.downloadScorecardPdf(resultId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `my_scorecard_${user?.username || 'result'}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      showSuccess('Scorecard PDF downloaded successfully!');
    } catch {
      showError('Unable to download scorecard.');
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading student examination portal..." />;
  }

  const studentProfile = user?.student;

  return (
    <Box sx={{ pb: 6 }}>
      <SEO title="Student Examination Dashboard" isPrivate />

      {/* Welcome Hero Banner */}
      <Card
        sx={{
          mb: 4,
          p: { xs: 3, md: 4 },
          background: `linear-gradient(135deg, ${BRANDING.colors.primary} 0%, #15224D 70%, ${BRANDING.colors.secondary} 100%)`,
          color: '#FFFFFF',
          borderRadius: 3,
        }}
      >
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={8}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1.5 }}>
              <Avatar
                sx={{
                  width: 52,
                  height: 52,
                  bgcolor: BRANDING.colors.accent,
                  fontSize: '1.4rem',
                  fontWeight: 800,
                }}
              >
                {studentProfile?.firstName?.charAt(0) || user?.username?.charAt(0).toUpperCase()}
              </Avatar>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 800, color: '#FFFFFF' }}>
                  Welcome back, {studentProfile ? `${studentProfile.firstName} ${studentProfile.lastName}` : user?.username}!
                </Typography>
                <Typography variant="body2" sx={{ color: '#CBD5E1' }}>
                  Roll Number: <strong>{studentProfile?.rollNumber || user?.username}</strong> • Registration: {studentProfile?.registrationNumber || 'REG-2023-0001'}
                </Typography>
              </Box>
            </Box>

            <Typography variant="body2" sx={{ color: '#94A3B8', mt: 1 }}>
              Department of {studentProfile?.department?.name || 'Computer Science and Engineering'} • {studentProfile?.currentSemester?.name || 'Semester 5'}
            </Typography>
          </Grid>

          <Grid item xs={12} md={4} sx={{ textAlign: { md: 'right' } }}>
            <Button
              variant="contained"
              size="large"
              startIcon={<AssignmentIcon />}
              onClick={() => navigate('/student/examinations')}
              sx={{
                bgcolor: BRANDING.colors.accent,
                fontWeight: 700,
                px: 3,
                py: 1.2,
                '&:hover': { bgcolor: '#008F80' },
              }}
            >
              View Available Exams
            </Button>
          </Grid>
        </Grid>
      </Card>

      {/* Summary Cards */}
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <Card sx={{ p: 2.5, height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="subtitle2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                Eligible Examinations
              </Typography>
              <Box sx={{ p: 1, borderRadius: 2, bgcolor: '#CCFBF1', color: '#0F766E' }}>
                <AssignmentIcon fontSize="small" />
              </Box>
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 800, color: BRANDING.colors.primary }}>
              {overview?.upcomingCount ?? 1}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Scheduled for your semester cohort
            </Typography>
          </Card>
        </Grid>

        <Grid item xs={12} sm={4}>
          <Card sx={{ p: 2.5, height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="subtitle2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                Completed Attempts
              </Typography>
              <Box sx={{ p: 1, borderRadius: 2, bgcolor: '#DCFCE7', color: '#16A34A' }}>
                <CheckCircleIcon fontSize="small" />
              </Box>
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 800, color: BRANDING.colors.primary }}>
              {overview?.completedCount ?? 0}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Submitted examination sessions
            </Typography>
          </Card>
        </Grid>

        <Grid item xs={12} sm={4}>
          <Card sx={{ p: 2.5, height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="subtitle2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                Released Grades
              </Typography>
              <Box sx={{ p: 1, borderRadius: 2, bgcolor: '#EDE9FE', color: '#7C3AED' }}>
                <AssessmentIcon fontSize="small" />
              </Box>
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 800, color: BRANDING.colors.primary }}>
              {recentResults.length}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Scorecards published by examination branch
            </Typography>
          </Card>
        </Grid>
      </Grid>

      {/* Available / Upcoming Examinations List */}
      <Card sx={{ p: 3, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Assigned Examinations
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Examinations scheduled for your enrolled course and semester
            </Typography>
          </Box>
          <Button size="small" endIcon={<ArrowForwardIcon />} onClick={() => navigate('/student/examinations')}>
            View All
          </Button>
        </Box>

        <TableContainer component={Paper} elevation={0} sx={{ border: `1px solid ${BRANDING.colors.border}` }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Examination Title</TableCell>
                <TableCell>Subject</TableCell>
                <TableCell>Type & Marks</TableCell>
                <TableCell>Duration</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {upcomingExams.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                    No pending examinations scheduled at this time.
                  </TableCell>
                </TableRow>
              ) : (
                upcomingExams.map((exam) => (
                  <TableRow key={exam.id} hover>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: BRANDING.colors.primary }}>
                        {exam.title}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        Code: {exam.examinationCode}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>{exam.subject?.name || 'Data Structures'}</TableCell>
                    <TableCell>
                      <Chip label={exam.examinationType} size="small" sx={{ mr: 1, fontSize: '0.65rem' }} />
                      {exam.totalMarks} Marks
                    </TableCell>
                    <TableCell>{exam.durationMinutes} Minutes</TableCell>
                    <TableCell>
                      <StatusBadge status={exam.status} />
                    </TableCell>
                    <TableCell align="right">
                      <Button
                        variant="contained"
                        size="small"
                        color="primary"
                        startIcon={<PlayArrowIcon />}
                        onClick={() => navigate(`/student/exam/${exam.id}`)}
                      >
                        Enter Exam
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Recent Released Results & Scorecards */}
      {recentResults.length > 0 && (
        <Card sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Released Examination Results
            </Typography>
            <Button size="small" endIcon={<ArrowForwardIcon />} onClick={() => navigate('/student/results')}>
              All Scorecards
            </Button>
          </Box>

          <Grid container spacing={2.5}>
            {recentResults.map((r) => (
              <Grid item xs={12} md={6} key={r.id}>
                <Paper sx={{ p: 2.5, border: `1px solid ${BRANDING.colors.border}`, borderRadius: 2 }} elevation={0}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700, color: BRANDING.colors.primary }}>
                        {r.examination?.title || 'Data Structures Midterm'}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        Calculated {new Date(r.calculatedAt).toLocaleDateString()}
                      </Typography>
                    </Box>
                    <Chip
                      label={r.passFailStatus}
                      size="small"
                      sx={{
                        fontWeight: 800,
                        bgcolor: r.passFailStatus === 'PASS' ? '#DCFCE7' : '#FEE2E2',
                        color: r.passFailStatus === 'PASS' ? '#15803D' : '#991B1B',
                      }}
                    />
                  </Box>

                  <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid item xs={4}>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>Score</Typography>
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
                      <Typography variant="h6" sx={{ fontWeight: 800, color: BRANDING.colors.accent }}>
                        {r.grade}
                      </Typography>
                    </Grid>
                  </Grid>

                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<PictureAsPdfIcon />}
                    onClick={() => handleDownloadScorecard(r.id)}
                  >
                    Download Official PDF Scorecard
                  </Button>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Card>
      )}
    </Box>
  );
};
