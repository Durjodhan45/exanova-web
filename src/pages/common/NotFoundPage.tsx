import React from 'react';
import { Box, Button, Container, Typography } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Link } from 'react-router-dom';
import { SEO } from '../../components/common/SEO';
import { Logo } from '../../components/common/Logo';
import { BRANDING } from '../../config/env';

export const NotFoundPage: React.FC = () => {
  return (
    <Container maxWidth="sm" sx={{ py: 12, textAlign: 'center' }}>
      <SEO title="Page Not Found" isPrivate />
      <Box sx={{ mb: 3, display: 'inline-flex' }}>
        <Logo variant="dark" size="large" />
      </Box>
      <Typography variant="h1" sx={{ fontWeight: 900, fontSize: '5rem', color: BRANDING.colors.primary, mb: 1 }}>
        404
      </Typography>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
        Page Not Found
      </Typography>
      <Typography variant="body1" sx={{ color: 'text.secondary', mb: 4 }}>
        The requested academic resource or dashboard page does not exist or has been relocated.
      </Typography>
      <Button component={Link} to="/" variant="contained" color="primary" startIcon={<ArrowBackIcon />}>
        Return to Portal Homepage
      </Button>
    </Container>
  );
};
