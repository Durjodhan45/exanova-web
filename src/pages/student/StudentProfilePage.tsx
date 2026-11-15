import React, { useEffect, useState } from 'react';
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  Grid,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import SchoolIcon from '@mui/icons-material/School';
import SaveIcon from '@mui/icons-material/Save';
import { SEO } from '../../components/common/SEO';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { studentsService } from '../../services/students.service';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { extractErrorMessage } from '../../services/api';
import { Student } from '../../types';
import { BRANDING } from '../../config/env';

export const StudentProfilePage: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const { showSuccess, showError } = useNotification();

  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [phone, setPhone] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    studentsService
      .getMyProfile()
      .then((data) => {
        setStudent(data);
        setPhone(data.phone || '');
      })
      .catch(() => {
        if (user?.student) {
          setStudent(user.student);
          setPhone(user.student.phone || '');
        }
      })
      .finally(() => setLoading(false));
  }, [user]);

  const handleUpdate = async () => {
    setSaving(true);
    try {
      await studentsService.updateMyProfile({ phone });
      await refreshUser();
      showSuccess('Profile contact information updated successfully!');
    } catch (err: unknown) {
      showError(extractErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Retrieving institutional profile..." />;
  }

  return (
    <Box sx={{ pb: 6 }}>
      <SEO title="Student Profile" isPrivate />

      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, color: BRANDING.colors.primary, mb: 0.5 }}>
          Student Profile
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Official academic enrollment information registered with {BRANDING.organization}
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Identity Card */}
        <Grid item xs={12} md={4}>
          <Card sx={{ p: 3, textAlign: 'center', height: '100%' }}>
            <Avatar
              sx={{
                width: 80,
                height: 80,
                mx: 'auto',
                mb: 2,
                bgcolor: BRANDING.colors.primary,
                fontSize: '2rem',
                fontWeight: 800,
              }}
            >
              {student?.firstName?.charAt(0) || user?.username?.charAt(0).toUpperCase()}
            </Avatar>
            <Typography variant="h5" sx={{ fontWeight: 800, color: BRANDING.colors.primary }}>
              {student ? `${student.firstName} ${student.lastName}` : user?.username}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
              Roll Number: <strong>{student?.rollNumber || user?.username}</strong>
            </Typography>

            <Divider sx={{ my: 2 }} />

            <Box sx={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Box>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>Registration Number</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>{student?.registrationNumber || 'REG-2023-0001'}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>Institutional Email</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>{student?.user?.email || user?.email}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>Account Status</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#16A34A' }}>Active & Enrolled</Typography>
              </Box>
            </Box>
          </Card>
        </Grid>

        {/* Academic Details & Contact Info */}
        <Grid item xs={12} md={8}>
          <Stack spacing={3}>
            {/* Academic Information (Read-only as controlled by admin) */}
            <Card sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                <SchoolIcon sx={{ color: BRANDING.colors.accent }} />
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Academic Program Details
                </Typography>
              </Box>

              <Grid container spacing={2.5}>
                <Grid item xs={12} sm={6}>
                  <Paper sx={{ p: 2, bgcolor: '#FAFBFD', border: `1px solid ${BRANDING.colors.border}` }} elevation={0}>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>Department</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      {student?.department?.name || 'Computer Science and Engineering'}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Paper sx={{ p: 2, bgcolor: '#FAFBFD', border: `1px solid ${BRANDING.colors.border}` }} elevation={0}>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>Degree Course</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      {student?.course?.name || 'Bachelor of Technology in CSE'}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Paper sx={{ p: 2, bgcolor: '#FAFBFD', border: `1px solid ${BRANDING.colors.border}` }} elevation={0}>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>Current Semester</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      {student?.currentSemester?.name || 'Semester 5'}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Paper sx={{ p: 2, bgcolor: '#FAFBFD', border: `1px solid ${BRANDING.colors.border}` }} elevation={0}>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>Academic Session</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      {student?.academicSession?.name || '2025-2026'}
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            </Card>

            {/* Editable Contact Info */}
            <Card sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                Contact Information
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
                Update your emergency phone number for examination broadcast notifications:
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={8}>
                  <TextField
                    label="Phone Number"
                    fullWidth
                    size="small"
                    placeholder="e.g. +91 9876543210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Button
                    variant="contained"
                    fullWidth
                    startIcon={<SaveIcon />}
                    onClick={handleUpdate}
                    disabled={saving}
                    sx={{ py: 1 }}
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </Grid>
              </Grid>
            </Card>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
};
