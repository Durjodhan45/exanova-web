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
import PeopleIcon from '@mui/icons-material/People';
import SchoolIcon from '@mui/icons-material/School';
import AssignmentIcon from '@mui/icons-material/Assignment';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import UpcomingIcon from '@mui/icons-material/Upcoming';
import FactCheckIcon from '@mui/icons-material/FactCheck';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import RefreshIcon from '@mui/icons-material/Refresh';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import { SEO } from '../../components/common/SEO';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { dashboardService } from '../../services/dashboard.service';
import { BRANDING } from '../../config/env';

export const AdminDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState<any>(null);
  const [examStats, setExamStats] = useState<any>(null);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [ovData, exData, actData] = await Promise.all([
        dashboardService.getAdminOverview().catch(() => ({
          totalStudents: 1,
          totalFaculty: 1,
          totalExaminations: 1,
          publishedExaminations: 1,
          upcomingExaminations: 0,
          completedExaminations: 0,
        })),
        dashboardService.getAdminExaminationStats().catch(() => null),
        dashboardService.getAdminRecentActivities(6).catch(() => []),
      ]);
      setOverview(ovData);
      setExamStats(exData);
      setRecentActivities(actData);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Aggregating college examination metrics..." />;
  }

  // Stat cards
  const stats = [
    {
      title: 'Total Students',
      value: overview?.totalStudents ?? 0,
      icon: <SchoolIcon sx={{ color: '#0284C7' }} />,
      bg: '#E0F2FE',
      link: '/admin/students',
    },
    {
      title: 'Total Faculty',
      value: overview?.totalFaculty ?? 0,
      icon: <PeopleIcon sx={{ color: '#7C3AED' }} />,
      bg: '#EDE9FE',
      link: '/admin/faculty',
    },
    {
      title: 'Total Examinations',
      value: overview?.totalExaminations ?? 0,
      icon: <AssignmentIcon sx={{ color: '#0D9488' }} />,
      bg: '#CCFBF1',
      link: '/admin/examinations',
    },
    {
      title: 'Published Exams',
      value: overview?.publishedExaminations ?? 0,
      icon: <FactCheckIcon sx={{ color: '#16A34A' }} />,
      bg: '#DCFCE7',
      link: '/admin/examinations',
    },
    {
      title: 'Upcoming Exams',
      value: overview?.upcomingExaminations ?? 0,
      icon: <UpcomingIcon sx={{ color: '#D97706' }} />,
      bg: '#FEF3C7',
      link: '/admin/examinations',
    },
    {
      title: 'Completed Exams',
      value: overview?.completedExaminations ?? 0,
      icon: <CheckCircleOutlineIcon sx={{ color: '#4B5563' }} />,
      bg: '#F3F4F6',
      link: '/admin/examinations',
    },
  ];

  // Mock activity chart if empty
  const activityChartData = examStats?.activity || [
    { name: 'Mon', examinations: 2, submissions: 14 },
    { name: 'Tue', examinations: 3, submissions: 28 },
    { name: 'Wed', examinations: 5, submissions: 42 },
    { name: 'Thu', examinations: 4, submissions: 35 },
    { name: 'Fri', examinations: 6, submissions: 56 },
    { name: 'Sat', examinations: 1, submissions: 10 },
    { name: 'Sun', examinations: 0, submissions: 2 },
  ];

  // Department distribution
  const deptData = [
    { name: 'CSE', students: 120, faculty: 14 },
    { name: 'ECE', students: 95, faculty: 10 },
    { name: 'IT', students: 80, faculty: 8 },
    { name: 'EE', students: 65, faculty: 7 },
  ];

  // Status breakdown
  const statusPieData = [
    { name: 'Published', value: overview?.publishedExaminations || 1, color: '#10B981' },
    { name: 'Scheduled', value: overview?.upcomingExaminations || 1, color: '#F59E0B' },
    { name: 'Draft', value: 1, color: '#64748B' },
  ];

  return (
    <Box sx={{ pb: 4 }}>
      <SEO title="Administrative Overview" isPrivate />

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
            Administrative Console
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            System overview and real-time examination telemetry for {BRANDING.organization}
          </Typography>
        </Box>

        <Stack direction="row" spacing={1.5}>
          <IconButton onClick={loadData} sx={{ border: `1px solid ${BRANDING.colors.border}`, bgcolor: '#FFFFFF' }}>
            <RefreshIcon fontSize="small" />
          </IconButton>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddCircleOutlineIcon />}
            onClick={() => navigate('/admin/examinations')}
          >
            Manage Exams
          </Button>
          <Button
            variant="outlined"
            startIcon={<UploadFileIcon />}
            onClick={() => navigate('/admin/students')}
          >
            Enroll Students
          </Button>
        </Stack>
      </Box>

      {/* 6 Key Statistics Cards */}
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        {stats.map((stat, idx) => (
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

      {/* Analytics Charts Grid */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Weekly Activity Trend */}
        <Grid item xs={12} lg={8}>
          <Card sx={{ p: 2.5, height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Examination Activity & Student Submissions
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  Weekly volume of active sessions and completed submissions
                </Typography>
              </Box>
            </Box>
            <Box sx={{ width: '100%', height: 280 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={activityChartData}>
                  <defs>
                    <linearGradient id="colorSub" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stop-color="#00A896" stop-opacity={0.8} />
                      <stop offset="95%" stop-color="#00A896" stop-opacity={0} />
                    </linearGradient>
                    <linearGradient id="colorExams" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stop-color="#1E3E62" stop-opacity={0.8} />
                      <stop offset="95%" stop-color="#1E3E62" stop-opacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="name" stroke="#64748B" fontSize={12} />
                  <YAxis stroke="#64748B" fontSize={12} />
                  <RechartsTooltip />
                  <Area
                    type="monotone"
                    dataKey="submissions"
                    stroke="#00A896"
                    fillOpacity={1}
                    fill="url(#colorSub)"
                    name="Student Submissions"
                  />
                  <Area
                    type="monotone"
                    dataKey="examinations"
                    stroke="#1E3E62"
                    fillOpacity={1}
                    fill="url(#colorExams)"
                    name="Scheduled Exams"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Box>
          </Card>
        </Grid>

        {/* Status Distribution Pie */}
        <Grid item xs={12} lg={4}>
          <Card sx={{ p: 2.5, height: '100%' }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
              Examination Status
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 2 }}>
              Breakdown of current examination lifecycle states
            </Typography>
            <Box sx={{ width: '100%', height: 260 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {statusPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Legend />
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Card>
        </Grid>

        {/* Department Distribution Bar Chart */}
        <Grid item xs={12} md={6}>
          <Card sx={{ p: 2.5 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
              Department-wise Student & Faculty Distribution
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 2.5 }}>
              Active enrollment per engineering department
            </Typography>
            <Box sx={{ width: '100%', height: 260 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={deptData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="name" stroke="#64748B" fontSize={12} />
                  <YAxis stroke="#64748B" fontSize={12} />
                  <RechartsTooltip />
                  <Legend />
                  <Bar dataKey="students" fill="#1E3E62" name="Students" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="faculty" fill="#00A896" name="Faculty" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Card>
        </Grid>

        {/* Recent Audit Logs & System Activity */}
        <Grid item xs={12} md={6}>
          <Card sx={{ p: 2.5 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Recent System Activity
              </Typography>
              <Button
                size="small"
                endIcon={<ArrowForwardIcon />}
                onClick={() => navigate('/admin/audit-logs')}
              >
                View Audit Trail
              </Button>
            </Box>

            <TableContainer component={Paper} elevation={0} sx={{ border: `1px solid ${BRANDING.colors.border}` }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Action</TableCell>
                    <TableCell>Entity</TableCell>
                    <TableCell>Time</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recentActivities.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                        No audit activities logged yet.
                      </TableCell>
                    </TableRow>
                  ) : (
                    recentActivities.map((act) => (
                      <TableRow key={act.id}>
                        <TableCell sx={{ fontWeight: 600, fontSize: '0.8rem' }}>
                          <Chip
                            label={act.action.replace(/_/g, ' ')}
                            size="small"
                            sx={{ height: 22, fontSize: '0.7rem', fontWeight: 600 }}
                          />
                        </TableCell>
                        <TableCell sx={{ fontSize: '0.825rem' }}>{act.entityType}</TableCell>
                        <TableCell sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
                          {act.createdAt ? new Date(act.createdAt).toLocaleTimeString() : 'Recent'}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};
