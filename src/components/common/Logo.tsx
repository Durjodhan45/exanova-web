import React from 'react';
import { Box, Typography } from '@mui/material';
import { BRANDING } from '../../config/env';

interface LogoProps {
  variant?: 'light' | 'dark';
  size?: 'small' | 'medium' | 'large';
  showTagline?: boolean;
}

export const Logo: React.FC<LogoProps> = ({
  variant = 'dark',
  size = 'medium',
  showTagline = false,
}) => {
  const isLight = variant === 'light';

  const iconSizes = {
    small: 28,
    medium: 36,
    large: 48,
  };

  const titleSizes = {
    small: '1.1rem',
    medium: '1.4rem',
    large: '1.85rem',
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, userSelect: 'none' }}>
      {/* ExaNova SVG Hex Crest */}
      <Box
        component="img"
        src="/favicon.svg"
        alt="ExaNova Logo"
        sx={{
          width: iconSizes[size],
          height: iconSizes[size],
          filter: isLight ? 'drop-shadow(0 2px 8px rgba(0,0,0,0.2))' : undefined,
        }}
      />
      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 800,
              fontSize: titleSizes[size],
              letterSpacing: '-0.02em',
              color: isLight ? '#FFFFFF' : BRANDING.colors.primary,
              lineHeight: 1.1,
            }}
          >
            Exa
          </Typography>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 800,
              fontSize: titleSizes[size],
              letterSpacing: '-0.02em',
              color: BRANDING.colors.accent,
              lineHeight: 1.1,
            }}
          >
            Nova
          </Typography>
        </Box>
        {showTagline && (
          <Typography
            variant="caption"
            sx={{
              fontSize: '0.68rem',
              color: isLight ? '#94A3B8' : BRANDING.colors.textSecondary,
              letterSpacing: '0.01em',
              mt: 0.2,
            }}
          >
            {BRANDING.fullName}
          </Typography>
        )}
      </Box>
    </Box>
  );
};
