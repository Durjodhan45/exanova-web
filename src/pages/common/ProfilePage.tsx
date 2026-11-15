import React, { useEffect, useState } from 'react';
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import DevicesIcon from '@mui/icons-material/Devices';
import SecurityIcon from '@mui/icons-material/Security';
import LockResetIcon from '@mui/icons-material/LockReset';
import { useNavigate } from 'react-router-dom';
import { SEO } from '../../components/common/SEO';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/auth.service';
import { useNotification } from '../../context/NotificationContext';
import { extractErrorMessage } from '../../services/api';
import { BRANDING } from '../../config/env';

export const ProfilePage: React.FC = () => {
  const { user, role } = useAuth();
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotification();

  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSessions = async () => {
    setLoading(true);
    try {
      const data = await authService.getSessions();
      setSessions(data);
    } catch {
      setSessions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleRevokeSession = async (sessionId: string) => {
    try {
      await authService.deleteSession(sessionId);
      showSuccess('Session revoked successfully.');
      fetchSessions();
    } catch (err: unknown) {
      showError(extractErrorMessage(err));
    }
  };

  return (
    <Box sx={{ pb: 6 }}>
      <SEO title="User Profile & Security" isPrivate />

      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, color: BRANDING.colors.primary, mb: 0.5 }}>
          Profile & Security Settings
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Credentials, active sessions, and access permissions for your account
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* User Card */}
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
              {user?.username?.charAt(0).toUpperCase()}
            </Avatar>
            <Typography variant="h5" sx={{ fontWeight: 800, color: BRANDING.colors.primary }}>
              {user?.username}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1.5 }}>
              {user?.email}
            </Typography>
            <Chip
              label={role}
              size="small"
              sx={{
                fontWeight: 800,
                bgcolor: role === 'ADMIN' ? '#FEE2E2' : role === 'FACULTY' ? '#EDE9FE' : '#CCFBF1',
                color: role === 'ADMIN' ? '#991B1B' : role === 'FACULTY' ? '#5B21B6' : '#0F766E',
              }}
            />

            <Divider sx={{ my: 3 }} />

            <Button
              fullWidth
              variant="outlined"
              startIcon={<LockResetIcon />}
              onClick={() => navigate('/change-password')}
            >
              Change Password
            </Button>
          </Card>
        </Grid>

        {/* Active Sessions */}
        <Grid item xs={12} md={8}>
          <Card sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
              <DevicesIcon sx={{ color: BRANDING.colors.accent }} />
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Active Devices & Sessions
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
              Manage devices currently authorized to access ExaNova with your credentials:
            </Typography>

            {loading ? (
              <LoadingSpinner message="Checking active login sessions..." minHeight={150} />
            ) : sessions.length === 0 ? (
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Current session active.
              </Typography>
            ) : (
              <TableContainer component={Paper} elevation={0} sx={{ border: `1px solid ${BRANDING.colors.border}` }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>IP Address</TableCell>
                      <TableCell>User Agent / Device</TableCell>
                      <TableCell>Logged In At</TableCell>
                      <TableCell align="right">Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {sessions.map((sess) => (
                      <TableRow key={sess.id} hover>
                        <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
                          {sess.ipAddress || '127.0.0.1'}
                        </TableCell>
                        <TableCell sx={{ fontSize: '0.8rem', maxWidth: 240, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {sess.userAgent || 'Chrome / Windows'}
                        </TableCell>
                        <TableCell sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
                          {sess.createdAt ? new Date(sess.createdAt).toLocaleString() : 'Active Now'}
                        </TableCell>
                        <TableCell align="right">
                          <Tooltip title="Revoke Session">
                            <IconButton size="small" color="error" onClick={() => handleRevokeSession(sess.id)}>
                              <DeleteOutlineIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};
