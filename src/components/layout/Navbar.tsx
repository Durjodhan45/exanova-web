import React, { useState } from 'react';
import {
  AppBar,
  Box,
  Button,
  Container,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Toolbar,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import LoginIcon from '@mui/icons-material/Login';
import DashboardIcon from '@mui/icons-material/Dashboard';
import { Link, useNavigate } from 'react-router-dom';
import { Logo } from '../common/Logo';
import { useAuth } from '../../context/AuthContext';
import { BRANDING } from '../../config/env';

export const Navbar: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isAuthenticated, role } = useAuth();
  const navigate = useNavigate();

  const navLinks = [
    { label: 'Home', href: '#home' },
    { label: 'About Portal', href: '#about' },
    { label: 'Features', href: '#features' },
    { label: 'Exam Workflow', href: '#workflow' },
    { label: 'Contact', href: '#contact' },
  ];

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const getDashboardPath = () => {
    if (role === 'ADMIN') return '/admin/dashboard';
    if (role === 'FACULTY') return '/faculty/dashboard';
    if (role === 'STUDENT') return '/student/dashboard';
    return '/login';
  };

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        backgroundColor: '#FFFFFF',
        borderBottom: `1px solid ${BRANDING.colors.border}`,
        color: BRANDING.colors.textPrimary,
        backdropFilter: 'blur(8px)',
      }}
    >
      <Container maxWidth="lg">
        <Toolbar disableGutters sx={{ minHeight: { xs: 68, md: 76 } }}>
          {/* Logo */}
          <Box
            component={Link}
            to="/"
            sx={{
              display: 'flex',
              alignItems: 'center',
              textDecoration: 'none',
              flexGrow: { xs: 1, md: 0 },
              mr: { md: 5 },
            }}
          >
            <Logo variant="dark" size="medium" showTagline={!isMobile} />
          </Box>

          {/* Desktop Navigation Links */}
          {!isMobile && (
            <Box sx={{ display: 'flex', gap: 3, flexGrow: 1, alignItems: 'center' }}>
              {navLinks.map((link) => (
                <Button
                  key={link.label}
                  href={link.href}
                  sx={{
                    color: BRANDING.colors.textSecondary,
                    fontWeight: 500,
                    fontSize: '0.925rem',
                    '&:hover': {
                      color: BRANDING.colors.primary,
                      backgroundColor: 'transparent',
                    },
                  }}
                >
                  {link.label}
                </Button>
              ))}
            </Box>
          )}

          {/* Action Button: Dashboard or Login */}
          {!isMobile && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              {isAuthenticated ? (
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<DashboardIcon />}
                  onClick={() => navigate(getDashboardPath())}
                  sx={{ px: 2.5 }}
                >
                  Go to Dashboard
                </Button>
              ) : (
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<LoginIcon />}
                  onClick={() => navigate('/login')}
                  sx={{ px: 2.5 }}
                >
                  Login to Portal
                </Button>
              )}
            </Box>
          )}

          {/* Mobile Menu Icon */}
          {isMobile && (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="end"
              onClick={handleDrawerToggle}
            >
              <MenuIcon />
            </IconButton>
          )}
        </Toolbar>
      </Container>

      {/* Mobile Drawer */}
      <Drawer
        anchor="right"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        PaperProps={{ sx: { width: 280, p: 2 } }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Logo variant="dark" size="small" />
          <IconButton onClick={handleDrawerToggle}>
            <CloseIcon />
          </IconButton>
        </Box>
        <List>
          {navLinks.map((link) => (
            <ListItem key={link.label} disablePadding>
              <ListItemButton
                component="a"
                href={link.href}
                onClick={handleDrawerToggle}
                sx={{ borderRadius: 1.5, mb: 0.5 }}
              >
                <ListItemText primary={link.label} primaryTypographyProps={{ fontWeight: 500 }} />
              </ListItemButton>
            </ListItem>
          ))}
          <ListItem disablePadding sx={{ mt: 2 }}>
            {isAuthenticated ? (
              <Button
                fullWidth
                variant="contained"
                color="primary"
                startIcon={<DashboardIcon />}
                onClick={() => {
                  handleDrawerToggle();
                  navigate(getDashboardPath());
                }}
              >
                Go to Dashboard
              </Button>
            ) : (
              <Button
                fullWidth
                variant="contained"
                color="primary"
                startIcon={<LoginIcon />}
                onClick={() => {
                  handleDrawerToggle();
                  navigate('/login');
                }}
              >
                Login to Portal
              </Button>
            )}
          </ListItem>
        </List>
      </Drawer>
    </AppBar>
  );
};
