import React from 'react';
import { Box, Container, Grid, Typography, Link as MuiLink, Divider } from '@mui/material';
import GitHubIcon from '@mui/icons-material/GitHub';
import EmailIcon from '@mui/icons-material/Email';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CodeIcon from '@mui/icons-material/Code';
import { Logo } from '../common/Logo';
import { BRANDING } from '../../config/env';

export const Footer: React.FC = () => {
  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: BRANDING.colors.primary,
        color: '#FFFFFF',
        pt: 8,
        pb: 4,
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4} sx={{ mb: 6 }}>
          {/* Brand & Organization */}
          <Grid item xs={12} md={4}>
            <Box sx={{ mb: 2 }}>
              <Logo variant="light" size="large" showTagline />
            </Box>
            <Typography variant="body2" sx={{ color: '#94A3B8', mb: 2.5, lineHeight: 1.7 }}>
              {BRANDING.tagline} A secure, enterprise-grade college assessment platform engineered for
              reliable MCQ and descriptive evaluation, real-time proctoring, and automated result processing.
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#CBD5E1' }}>
              <CodeIcon sx={{ fontSize: 18, color: BRANDING.colors.accent }} />
              <Typography variant="body2">
                Developed by{' '}
                <MuiLink
                  href={BRANDING.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{ color: '#FFFFFF', fontWeight: 600, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                >
                  {BRANDING.developer}
                </MuiLink>
              </Typography>
            </Box>
          </Grid>

          {/* Quick Links */}
          <Grid item xs={6} sm={3} md={2}>
            <Typography variant="subtitle1" sx={{ color: '#FFFFFF', fontWeight: 700, mb: 2 }}>
              Navigation
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.2 }}>
              {['Home', 'About Portal', 'Features', 'Exam Workflow', 'Portal Login'].map((item) => (
                <MuiLink
                  key={item}
                  href={`#${item.toLowerCase().replace(/\s+/g, '')}`}
                  sx={{
                    color: '#94A3B8',
                    textDecoration: 'none',
                    fontSize: '0.875rem',
                    transition: 'color 0.2s',
                    '&:hover': { color: '#FFFFFF' },
                  }}
                >
                  {item}
                </MuiLink>
              ))}
            </Box>
          </Grid>

          {/* Exam Capabilities */}
          <Grid item xs={6} sm={3} md={3}>
            <Typography variant="subtitle1" sx={{ color: '#FFFFFF', fontWeight: 700, mb: 2 }}>
              System Capabilities
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.2 }}>
              {[
                'Zero-Storage File Imports',
                'Authoritative Server Timer',
                'Configurable Negative Marking',
                'Descriptive Manual Grading',
                'Dynamic PDF Scorecards',
                'Anti-Cheat Telemetry Logging',
              ].map((cap) => (
                <Typography key={cap} variant="body2" sx={{ color: '#94A3B8', fontSize: '0.85rem' }}>
                  • {cap}
                </Typography>
              ))}
            </Box>
          </Grid>

          {/* Institution Contact Information */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="subtitle1" sx={{ color: '#FFFFFF', fontWeight: 700, mb: 2 }}>
              Institution & Contact
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
                <LocationOnIcon sx={{ color: BRANDING.colors.accent, fontSize: 20, mt: 0.3 }} />
                <Typography variant="body2" sx={{ color: '#94A3B8', fontSize: '0.85rem', lineHeight: 1.6 }}>
                  <strong>{BRANDING.organization}</strong>
                  <br />
                  {BRANDING.address}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                <EmailIcon sx={{ color: BRANDING.colors.accent, fontSize: 18 }} />
                <MuiLink
                  href={`mailto:${BRANDING.email}`}
                  sx={{ color: '#94A3B8', textDecoration: 'none', fontSize: '0.85rem', '&:hover': { color: '#FFFFFF' } }}
                >
                  {BRANDING.email}
                </MuiLink>
              </Box>

              <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                <GitHubIcon sx={{ color: BRANDING.colors.accent, fontSize: 18 }} />
                <MuiLink
                  href={BRANDING.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{ color: '#94A3B8', textDecoration: 'none', fontSize: '0.85rem', '&:hover': { color: '#FFFFFF' } }}
                >
                  github.com/Durjodhan45
                </MuiLink>
              </Box>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.1)', mb: 3 }} />

        {/* Bottom Credits & Copyright */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 1.5,
          }}
        >
          <Typography variant="caption" sx={{ color: '#64748B' }}>
            © {new Date().getFullYear()} {BRANDING.appName} – {BRANDING.fullName}. All rights reserved.
          </Typography>
          <Typography variant="caption" sx={{ color: '#64748B' }}>
            Built for <strong>{BRANDING.organization}</strong> • Confidential academic system
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};
