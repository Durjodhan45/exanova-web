import { createTheme } from '@mui/material/styles';
import { BRANDING } from '../config/env';

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: BRANDING.colors.primary,
      light: '#1e295d',
      dark: '#0a1028',
      contrastText: '#ffffff',
    },
    secondary: {
      main: BRANDING.colors.secondary,
      light: '#2d5a8c',
      dark: '#142a44',
      contrastText: '#ffffff',
    },
    info: {
      main: '#2563EB',
      light: '#60A5FA',
      dark: '#1D4ED8',
    },
    success: {
      main: BRANDING.colors.success,
      light: '#34D399',
      dark: '#059669',
    },
    warning: {
      main: BRANDING.colors.warning,
      light: '#FBBF24',
      dark: '#D97706',
    },
    error: {
      main: BRANDING.colors.error,
      light: '#F87171',
      dark: '#DC2626',
    },
    background: {
      default: BRANDING.colors.background,
      paper: BRANDING.colors.surface,
    },
    text: {
      primary: BRANDING.colors.textPrimary,
      secondary: BRANDING.colors.textSecondary,
    },
    divider: BRANDING.colors.border,
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    h1: {
      fontWeight: 700,
      fontSize: '2.5rem',
      letterSpacing: '-0.02em',
      color: BRANDING.colors.textPrimary,
    },
    h2: {
      fontWeight: 700,
      fontSize: '2rem',
      letterSpacing: '-0.015em',
      color: BRANDING.colors.textPrimary,
    },
    h3: {
      fontWeight: 600,
      fontSize: '1.625rem',
      letterSpacing: '-0.01em',
      color: BRANDING.colors.textPrimary,
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.35rem',
      letterSpacing: '-0.01em',
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.15rem',
    },
    h6: {
      fontWeight: 600,
      fontSize: '1rem',
    },
    subtitle1: {
      fontSize: '0.975rem',
      color: BRANDING.colors.textSecondary,
    },
    subtitle2: {
      fontSize: '0.875rem',
      fontWeight: 500,
      color: BRANDING.colors.textSecondary,
    },
    body1: {
      fontSize: '0.925rem',
      lineHeight: 1.6,
      color: BRANDING.colors.textPrimary,
    },
    body2: {
      fontSize: '0.85rem',
      lineHeight: 1.55,
      color: BRANDING.colors.textSecondary,
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 10,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: 'none',
          padding: '8px 18px',
          fontWeight: 600,
          '&:hover': {
            boxShadow: '0 2px 8px rgba(16, 27, 63, 0.15)',
          },
        },
        containedPrimary: {
          backgroundColor: BRANDING.colors.primary,
          '&:hover': {
            backgroundColor: '#162352',
          },
        },
        containedSecondary: {
          backgroundColor: BRANDING.colors.secondary,
          '&:hover': {
            backgroundColor: '#152d49',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.06), 0 1px 2px 0 rgba(0, 0, 0, 0.04)',
          border: `1px solid ${BRANDING.colors.border}`,
          transition: 'all 0.2s ease-in-out',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
        rounded: {
          borderRadius: 12,
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          fontWeight: 600,
          backgroundColor: '#F1F5F9',
          color: BRANDING.colors.textPrimary,
          fontSize: '0.825rem',
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
        },
        body: {
          fontSize: '0.875rem',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 500,
          borderRadius: 6,
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          backgroundColor: '#FFFFFF',
          '& fieldset': {
            borderColor: BRANDING.colors.border,
          },
          '&:hover fieldset': {
            borderColor: '#94A3B8',
          },
          '&.Mui-focused fieldset': {
            borderColor: BRANDING.colors.secondary,
            borderWidth: 2,
          },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 14,
        },
      },
    },
  },
});
