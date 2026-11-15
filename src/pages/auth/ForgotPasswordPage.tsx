import React, { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  TextField,
  Typography,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import { Link } from 'react-router-dom';
import { authService } from '../../services/auth.service';
import { extractErrorMessage } from '../../services/api';
import { Logo } from '../../components/common/Logo';
import { SEO } from '../../components/common/SEO';
import { BRANDING } from '../../config/env';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email.trim()) {
      setErrorMessage('Please enter your college email address.');
      return;
    }

    setLoading(true);
    try {
      await authService.forgotPassword(email.trim());
      setSubmitted(true);
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
      <SEO title="Reset Password" isPrivate />

      <Container maxWidth="sm">
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Box sx={{ display: 'inline-flex', mb: 1 }}>
            <Logo variant="dark" size="medium" />
          </Box>
        </Box>

        <Card sx={{ borderRadius: 3, boxShadow: '0 10px 25px -5px rgba(16, 27, 63, 0.08)' }}>
          <CardContent sx={{ p: { xs: 3, sm: 4.5 } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
              <MailOutlineIcon sx={{ color: BRANDING.colors.accent, fontSize: 32 }} />
              <Typography variant="h5" sx={{ fontWeight: 700, color: BRANDING.colors.primary }}>
                Forgot Password
              </Typography>
            </Box>

            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
              Enter your registered college email address and we'll send you a password reset token.
            </Typography>

            {submitted ? (
              <Box>
                <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
                  If an account exists with that email, a password reset instruction has been dispatched.
                  Please consult your institutional inbox or contact the examination cell administrator.
                </Alert>
                <Button component={Link} to="/login" variant="contained" fullWidth sx={{ py: 1.2 }}>
                  Return to Login
                </Button>
              </Box>
            ) : (
              <Box component="form" onSubmit={handleSubmit} noValidate>
                {errorMessage && (
                  <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2 }}>
                    {errorMessage}
                  </Alert>
                )}

                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="email"
                  label="Registered Email Address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  autoFocus
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. yourname@exanova.edu"
                  sx={{ mb: 3 }}
                />

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={loading}
                  sx={{ py: 1.4, bgcolor: BRANDING.colors.primary, fontWeight: 700 }}
                >
                  {loading ? 'Sending Request...' : 'Send Reset Link'}
                </Button>

                <Box sx={{ textAlign: 'center', mt: 2.5 }}>
                  <Button
                    component={Link}
                    to="/login"
                    startIcon={<ArrowBackIcon />}
                    sx={{ color: 'text.secondary', fontSize: '0.85rem' }}
                  >
                    Back to Login
                  </Button>
                </Box>
              </Box>
            )}
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};
