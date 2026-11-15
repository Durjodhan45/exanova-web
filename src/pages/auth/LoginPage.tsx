import React, { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  Container,
  FormControlLabel,
  IconButton,
  InputAdornment,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import LoginIcon from '@mui/icons-material/Login';
import SchoolIcon from '@mui/icons-material/School';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { Logo } from '../../components/common/Logo';
import { SEO } from '../../components/common/SEO';
import { extractErrorMessage } from '../../services/api';
import { BRANDING } from '../../config/env';

export const LoginPage: React.FC = () => {
  const [roleTab, setRoleTab] = useState<'STUDENT' | 'FACULTY' | 'ADMIN'>('STUDENT');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const { login } = useAuth();
  const { showSuccess } = useNotification();
  const navigate = useNavigate();
  const location = useLocation();

  const handleTabChange = (_: React.SyntheticEvent, newValue: 'STUDENT' | 'FACULTY' | 'ADMIN') => {
    setRoleTab(newValue);
    setErrorMessage('');
    // Auto-fill suggested placeholder
    if (newValue === 'STUDENT') {
      setIdentifier('230001');
      setPassword('Student@12345');
    } else if (newValue === 'FACULTY') {
      setIdentifier('faculty01');
      setPassword('Faculty@12345');
    } else {
      setIdentifier('admin');
      setPassword('Admin@ExaNova2026!');
    }
  };

  const handleDemoFill = (role: 'STUDENT' | 'FACULTY' | 'ADMIN') => {
    setRoleTab(role);
    if (role === 'STUDENT') {
      setIdentifier('230001');
      setPassword('Student@12345');
    } else if (role === 'FACULTY') {
      setIdentifier('faculty01');
      setPassword('Faculty@12345');
    } else {
      setIdentifier('admin');
      setPassword('Admin@ExaNova2026!');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!identifier.trim()) {
      setErrorMessage(
        roleTab === 'STUDENT'
          ? 'Please enter your College Roll Number or Email.'
          : 'Please enter your Username or Email.',
      );
      return;
    }
    if (!password) {
      setErrorMessage('Please enter your password.');
      return;
    }

    setLoading(true);
    try {
      const loggedUser = await login(identifier.trim(), password, rememberMe);
      showSuccess(`Welcome back, ${loggedUser.username}!`);

      if (loggedUser.mustChangePassword) {
        navigate('/change-password', { replace: true });
        return;
      }

      // Redirect by role
      const from = (location.state as any)?.from?.pathname;
      if (from) {
        navigate(from, { replace: true });
      } else {
        if (loggedUser.role === 'ADMIN') navigate('/admin/dashboard', { replace: true });
        else if (loggedUser.role === 'FACULTY') navigate('/faculty/dashboard', { replace: true });
        else navigate('/student/dashboard', { replace: true });
      }
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
        position: 'relative',
      }}
    >
      <SEO title="Portal Login" isPrivate />

      {/* Back to Home Button */}
      <Box sx={{ position: 'absolute', top: 24, left: 24 }}>
        <Button
          component={Link}
          to="/"
          startIcon={<ArrowBackIcon />}
          sx={{ color: BRANDING.colors.textSecondary, fontWeight: 500 }}
        >
          Back to Portal
        </Button>
      </Box>

      <Container maxWidth="sm">
        {/* Top Header */}
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Box sx={{ display: 'inline-flex', mb: 1 }}>
            <Logo variant="dark" size="medium" />
          </Box>
          <Typography variant="body2" sx={{ color: BRANDING.colors.textSecondary }}>
            {BRANDING.tagline}
          </Typography>
        </Box>

        <Card
          sx={{
            borderRadius: 3,
            boxShadow: '0 10px 25px -5px rgba(16, 27, 63, 0.08), 0 8px 10px -6px rgba(16, 27, 63, 0.04)',
            overflow: 'hidden',
          }}
        >
          {/* Role Selection Tabs */}
          <Tabs
            value={roleTab}
            onChange={handleTabChange}
            variant="fullWidth"
            textColor="primary"
            indicatorColor="primary"
            sx={{
              borderBottom: `1px solid ${BRANDING.colors.border}`,
              bgcolor: '#FAFBFD',
              '& .MuiTab-root': {
                fontWeight: 600,
                fontSize: '0.875rem',
                py: 2,
              },
            }}
          >
            <Tab
              value="STUDENT"
              label="Student"
              icon={<SchoolIcon sx={{ fontSize: 20 }} />}
              iconPosition="start"
            />
            <Tab
              value="FACULTY"
              label="Faculty"
              icon={<PersonOutlineIcon sx={{ fontSize: 20 }} />}
              iconPosition="start"
            />
            <Tab
              value="ADMIN"
              label="Admin"
              icon={<AdminPanelSettingsIcon sx={{ fontSize: 20 }} />}
              iconPosition="start"
            />
          </Tabs>

          <CardContent sx={{ p: { xs: 3, sm: 4.5 } }}>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5, color: BRANDING.colors.primary }}>
              {roleTab === 'STUDENT'
                ? 'Student Assessment Login'
                : roleTab === 'FACULTY'
                ? 'Faculty Portal Login'
                : 'Administrative Console'}
            </Typography>
            <Typography variant="body2" sx={{ color: BRANDING.colors.textSecondary, mb: 3 }}>
              {roleTab === 'STUDENT'
                ? 'Sign in using your College Roll Number and examination password.'
                : 'Sign in to access your examinations and administrative workbench.'}
            </Typography>

            {errorMessage && (
              <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                {errorMessage}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit} noValidate>
              <TextField
                margin="normal"
                required
                fullWidth
                id="identifier"
                label={roleTab === 'STUDENT' ? 'College Roll Number / Email' : 'Username / Email'}
                name="identifier"
                autoComplete="username"
                autoFocus
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder={roleTab === 'STUDENT' ? 'e.g. 230001' : 'e.g. admin or faculty01'}
                sx={{ mb: 2 }}
              />

              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type={showPassword ? 'text' : 'password'}
                id="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 1.5 }}
              />

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      color="primary"
                      size="small"
                    />
                  }
                  label={<Typography variant="body2">Remember Me</Typography>}
                />
                <Button
                  component={Link}
                  to="/forgot-password"
                  variant="text"
                  size="small"
                  sx={{ fontSize: '0.825rem', color: BRANDING.colors.secondary }}
                >
                  Forgot Password?
                </Button>
              </Box>

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading}
                startIcon={<LoginIcon />}
                sx={{
                  py: 1.4,
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  bgcolor: BRANDING.colors.primary,
                  '&:hover': { bgcolor: '#162352' },
                }}
              >
                {loading ? 'Authenticating...' : `Sign In as ${roleTab}`}
              </Button>
            </Box>

            {/* Quick Demo Credentials for Fast Testing */}
            <Box
              sx={{
                mt: 4,
                pt: 2.5,
                borderTop: `1px dashed ${BRANDING.colors.border}`,
                textAlign: 'center',
              }}
            >
              <Typography variant="caption" sx={{ color: BRANDING.colors.textSecondary, display: 'block', mb: 1.5 }}>
                Demo Accounts Quick-Fill:
              </Typography>
              <Stack direction="row" spacing={1} justifyContent="center" flexWrap="wrap">
                <Chip
                  label="Admin (admin)"
                  size="small"
                  onClick={() => handleDemoFill('ADMIN')}
                  sx={{ cursor: 'pointer', fontWeight: 600, bgcolor: '#FEE2E2', color: '#991B1B' }}
                />
                <Chip
                  label="Faculty (faculty01)"
                  size="small"
                  onClick={() => handleDemoFill('FACULTY')}
                  sx={{ cursor: 'pointer', fontWeight: 600, bgcolor: '#EDE9FE', color: '#5B21B6' }}
                />
                <Chip
                  label="Student (230001)"
                  size="small"
                  onClick={() => handleDemoFill('STUDENT')}
                  sx={{ cursor: 'pointer', fontWeight: 600, bgcolor: '#CCFBF1', color: '#0F766E' }}
                />
              </Stack>
            </Box>
          </CardContent>
        </Card>

        {/* Footer info */}
        <Box sx={{ textAlign: 'center', mt: 3 }}>
          <Typography variant="caption" sx={{ color: BRANDING.colors.textSecondary }}>
            {BRANDING.organization} • {BRANDING.email}
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};
