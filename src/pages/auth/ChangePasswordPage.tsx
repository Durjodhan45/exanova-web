import React, { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
} from '@mui/material';
import LockResetIcon from '@mui/icons-material/LockReset';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { authService } from '../../services/auth.service';
import { extractErrorMessage } from '../../services/api';
import { Logo } from '../../components/common/Logo';
import { SEO } from '../../components/common/SEO';
import { BRANDING } from '../../config/env';

export const ChangePasswordPage: React.FC = () => {
  const { user, mustChangePassword, refreshUser, role } = useAuth();
  const { showSuccess } = useNotification();
  const navigate = useNavigate();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!currentPassword) {
      setErrorMessage('Please enter your current password.');
      return;
    }
    if (newPassword.length < 8) {
      setErrorMessage('New password must be at least 8 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMessage('New passwords do not match.');
      return;
    }
    if (newPassword === currentPassword) {
      setErrorMessage('New password must be different from your current password.');
      return;
    }

    setLoading(true);
    try {
      await authService.changePassword(currentPassword, newPassword);
      await refreshUser();
      showSuccess('Password updated successfully!');

      if (role === 'ADMIN') navigate('/admin/dashboard', { replace: true });
      else if (role === 'FACULTY') navigate('/faculty/dashboard', { replace: true });
      else navigate('/student/dashboard', { replace: true });
    } catch (err: unknown) {
      setErrorMessage(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        bgcolor: '#F8FAFC',
        py: 6,
        px: 2,
      }}
    >
      <SEO title="Update Password" isPrivate />

      <Container maxWidth="sm">
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Box sx={{ display: 'inline-flex', mb: 1 }}>
            <Logo variant="dark" size="medium" />
          </Box>
        </Box>

        <Card sx={{ borderRadius: 3, boxShadow: '0 10px 25px -5px rgba(16, 27, 63, 0.08)' }}>
          <CardContent sx={{ p: { xs: 3, sm: 4.5 } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
              <LockResetIcon sx={{ color: BRANDING.colors.accent, fontSize: 32 }} />
              <Typography variant="h5" sx={{ fontWeight: 700, color: BRANDING.colors.primary }}>
                {mustChangePassword ? 'Mandatory Password Setup' : 'Change Password'}
              </Typography>
            </Box>

            {mustChangePassword ? (
              <Alert severity="warning" sx={{ my: 2.5, borderRadius: 2 }}>
                <strong>First Login Security Requirement:</strong> Your college account requires an
                immediate password change before accessing the examination dashboard.
              </Alert>
            ) : (
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
                Update your account password to ensure your examination records remain secure.
              </Typography>
            )}

            {errorMessage && (
              <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2 }}>
                {errorMessage}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit} noValidate>
              <TextField
                margin="normal"
                required
                fullWidth
                name="currentPassword"
                label="Current Password"
                type={showCurrent ? 'text' : 'password'}
                id="currentPassword"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowCurrent(!showCurrent)} edge="end">
                        {showCurrent ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 2 }}
              />

              <TextField
                margin="normal"
                required
                fullWidth
                name="newPassword"
                label="New Password"
                type={showNew ? 'text' : 'password'}
                id="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                helperText="Minimum 8 characters with letters, numbers, and symbols."
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowNew(!showNew)} edge="end">
                        {showNew ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 2 }}
              />

              <TextField
                margin="normal"
                required
                fullWidth
                name="confirmPassword"
                label="Confirm New Password"
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                sx={{ mb: 3 }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading}
                startIcon={<CheckCircleIcon />}
                sx={{
                  py: 1.4,
                  bgcolor: BRANDING.colors.primary,
                  fontWeight: 700,
                  '&:hover': { bgcolor: '#162352' },
                }}
              >
                {loading ? 'Updating Password...' : 'Save and Continue'}
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};
