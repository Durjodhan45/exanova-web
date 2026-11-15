import React from 'react';
import { Chip, ChipProps } from '@mui/material';

interface StatusBadgeProps {
  status: string;
  size?: 'small' | 'medium';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'small' }) => {
  const normalized = (status || '').toUpperCase();

  let color: ChipProps['color'] = 'default';
  let label = status;
  let bg = '#F1F5F9';
  let text = '#475569';

  switch (normalized) {
    case 'PUBLISHED':
    case 'ACTIVE':
    case 'COMPLETED':
    case 'PASS':
    case 'ANSWERED':
      bg = '#DCFCE7';
      text = '#15803D';
      color = 'success';
      break;
    case 'LIVE':
    case 'IN_PROGRESS':
      bg = '#E0F2FE';
      text = '#0369A1';
      color = 'info';
      break;
    case 'SCHEDULED':
    case 'PENDING':
    case 'MARKED_FOR_REVIEW':
      bg = '#FEF3C7';
      text = '#B45309';
      color = 'warning';
      break;
    case 'DRAFT':
    case 'NOT_VISITED':
    case 'UNANSWERED':
      bg = '#F1F5F9';
      text = '#475569';
      break;
    case 'CANCELLED':
    case 'SUSPENDED':
    case 'INACTIVE':
    case 'EXPIRED':
    case 'FAIL':
    case 'WITHHELD':
      bg = '#FEE2E2';
      text = '#B91C1C';
      color = 'error';
      break;
    case 'EVALUATED':
    case 'CALCULATED':
      bg = '#EDE9FE';
      text = '#6D28D9';
      break;
    default:
      break;
  }

  // Format label: "IN_PROGRESS" -> "In Progress"
  label = normalized
    .split('_')
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(' ');

  return (
    <Chip
      size={size}
      label={label}
      sx={{
        bgcolor: bg,
        color: text,
        fontWeight: 600,
        fontSize: size === 'small' ? '0.75rem' : '0.85rem',
        border: 'none',
      }}
    />
  );
};
