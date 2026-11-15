import React from 'react';
import { Box, Button, Typography } from '@mui/material';
import FolderOpenOutlinedIcon from '@mui/icons-material/FolderOpenOutlined';
import { BRANDING } from '../../config/env';

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  actionText?: string;
  onAction?: () => void;
  minHeight?: number | string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon,
  actionText,
  onAction,
  minHeight = '280px',
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        minHeight,
        p: 4,
        borderRadius: 3,
        bgcolor: '#FAFBFD',
        border: `1px dashed ${BRANDING.colors.border}`,
      }}
    >
      <Box
        sx={{
          width: 56,
          height: 56,
          borderRadius: '50%',
          bgcolor: '#EEF2F6',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: BRANDING.colors.textSecondary,
          mb: 2,
        }}
      >
        {icon || <FolderOpenOutlinedIcon sx={{ fontSize: 32 }} />}
      </Box>
      <Typography variant="h6" sx={{ fontWeight: 600, color: BRANDING.colors.textPrimary, mb: 0.5 }}>
        {title}
      </Typography>
      {description && (
        <Typography
          variant="body2"
          sx={{ color: BRANDING.colors.textSecondary, maxWidth: 440, mb: actionText ? 2.5 : 0 }}
        >
          {description}
        </Typography>
      )}
      {actionText && onAction && (
        <Button variant="contained" color="primary" onClick={onAction} sx={{ mt: 1 }}>
          {actionText}
        </Button>
      )}
    </Box>
  );
};
