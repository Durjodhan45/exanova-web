import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  IconButton,
  Stack,
  Typography,
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import RefreshIcon from '@mui/icons-material/Refresh';
import TimerIcon from '@mui/icons-material/Timer';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { useNavigate } from 'react-router-dom';
import { SEO } from '../../components/common/SEO';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { StatusBadge } from '../../components/common/StatusBadge';
import { dashboardService } from '../../services/dashboard.service';
import { useNotification } from '../../context/NotificationContext';
import { extractErrorMessage } from '../../services/api';
import { Examination } from '../../types';
import { BRANDING } from '../../config/env';

export const AvailableExaminationsPage: React.FC = () => {
  const navigate = useNavigate();
  const { showError } = useNotification();

  const [examinations, setExaminations] = useState<Examination[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchExams = async () => {
    setLoading(true);
    try {
      const exams = await dashboardService.getStudentUpcoming();
      setExaminations(exams);
    } catch (err: unknown) {
      showError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExams();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Checking examination eligibility..." />;
  }

  return (
    <Box sx={{ pb: 6 }}>
      <SEO title="Available Examinations" isPrivate />

      {/* Header bar */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: BRANDING.colors.primary, mb: 0.5 }}>
            Available Examinations
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Assessments configured for your academic cohort, course, and semester
          </Typography>
        </Box>

        <IconButton onClick={fetchExams} title="Refresh">
          <RefreshIcon />
        </IconButton>
      </Box>

      {examinations.length === 0 ? (
        <EmptyState
          title="No examinations available at this moment"
          description="You are currently up to date on all assigned examinations for your course semester."
        />
      ) : (
        <Grid container spacing={3}>
          {examinations.map((exam) => (
            <Grid item xs={12} md={6} key={exam.id}>
              <Card
                sx={{
                  p: 3,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  border: `1px solid ${BRANDING.colors.border}`,
                  transition: 'all 0.2s',
                  '&:hover': {
                    borderColor: BRANDING.colors.secondary,
                    boxShadow: '0 8px 24px rgba(16, 27, 63, 0.08)',
                  },
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: BRANDING.colors.primary }}>
                      {exam.title}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                      Code: {exam.examinationCode}
                    </Typography>
                  </Box>
                  <StatusBadge status={exam.status} />
                </Box>

                <Box sx={{ p: 2, bgcolor: '#F8FAFC', borderRadius: 2, mb: 3 }}>
                  <Grid container spacing={1.5}>
                    <Grid item xs={6}>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>Subject</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>
                        {exam.subject?.name || 'Data Structures'}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>Format</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>
                        {exam.examinationType}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>Duration</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>
                        {exam.durationMinutes} Minutes
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>Maximum Score</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>
                        {exam.totalMarks} Marks (Pass: {exam.passingMarks})
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>

                {exam.instructions && (
                  <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 3 }}>
                    Notice: {exam.instructions}
                  </Typography>
                )}

                <Box sx={{ mt: 'auto' }}>
                  <Button
                    fullWidth
                    variant="contained"
                    size="large"
                    color="primary"
                    startIcon={<PlayArrowIcon />}
                    onClick={() => navigate(`/student/exam/${exam.id}`)}
                    sx={{ py: 1.3, fontWeight: 700 }}
                  >
                    Enter Examination Portal
                  </Button>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};
