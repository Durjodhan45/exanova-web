import React from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmColor?: 'primary' | 'secondary' | 'error' | 'warning' | 'info';
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmColor = 'primary',
  onConfirm,
  onCancel,
  isLoading = false,
}) => {
  return (
    <Dialog open={open} onClose={onCancel} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ color: 'text.secondary', fontSize: '0.925rem' }}>
          {message}
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ p: 2, pt: 1 }}>
        <Button onClick={onCancel} disabled={isLoading} variant="outlined" color="inherit">
          {cancelText}
        </Button>
        <Button
          onClick={onConfirm}
          disabled={isLoading}
          variant="contained"
          color={confirmColor}
          autoFocus
        >
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
