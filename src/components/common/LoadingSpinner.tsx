import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import { BRANDING } from '../../config/env';

interface LoadingSpinnerProps {
  message?: string;
  minHeight?: number | string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message = 'Loading examination records...',
  minHeight = '300px',
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight,
        gap: 2,
        width: '100%',
      }}
    >
      <CircularProgress
        size={42}
        thickness={4}
        sx={{
          color: BRANDING.colors.accent,
        }}
      />
      <Typography variant="body2" sx={{ color: BRANDING.colors.textSecondary, fontWeight: 500 }}>
        {message}
      </Typography>
    </Box>
  );
};
