import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  Chip,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import SecurityIcon from '@mui/icons-material/Security';
import { SEO } from '../../components/common/SEO';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { auditLogsService } from '../../services/audit-logs.service';
import { useNotification } from '../../context/NotificationContext';
import { extractErrorMessage } from '../../services/api';
import { AuditLogItem } from '../../types';
import { BRANDING } from '../../config/env';

export const AuditLogsPage: React.FC = () => {
  const { showError } = useNotification();

  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(15);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await auditLogsService.getAuditLogs({
        page: page + 1,
        limit: rowsPerPage,
      });
      setLogs(res.items);
      setTotal(res.total);
    } catch (err: unknown) {
      showError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page, rowsPerPage]);

  return (
    <Box sx={{ pb: 4 }}>
      <SEO title="System Audit Trail & Security Ledger" isPrivate />

      {/* Header bar */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
            <SecurityIcon sx={{ color: BRANDING.colors.accent, fontSize: 30 }} />
            <Typography variant="h4" sx={{ fontWeight: 800, color: BRANDING.colors.primary }}>
              System Audit Trail
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Immutable administrative and security ledger recording all critical examination and identity events
          </Typography>
        </Box>

        <IconButton onClick={fetchLogs} title="Refresh">
          <RefreshIcon />
        </IconButton>
      </Box>

      {/* Audit Log Table */}
      <TableContainer component={Paper} elevation={0} sx={{ border: `1px solid ${BRANDING.colors.border}`, borderRadius: 2 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Timestamp</TableCell>
              <TableCell>User</TableCell>
              <TableCell>Action</TableCell>
              <TableCell>Entity</TableCell>
              <TableCell>IP Address</TableCell>
              <TableCell>Details</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6}>
                  <LoadingSpinner message="Retrieving security audit ledger..." minHeight={200} />
                </TableCell>
              </TableRow>
            ) : logs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6}>
                  <EmptyState title="No audit logs recorded yet." />
                </TableCell>
              </TableRow>
            ) : (
              logs.map((log) => (
                <TableRow key={log.id} hover>
                  <TableCell sx={{ fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                    {new Date(log.createdAt).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.825rem' }}>
                      {log.user?.username || log.userId?.substring(0, 8) || 'SYSTEM'}
                    </Typography>
                    {log.user?.role && (
                      <Chip label={log.user.role} size="small" sx={{ height: 18, fontSize: '0.65rem' }} />
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={log.action.replace(/_/g, ' ')}
                      size="small"
                      sx={{
                        fontWeight: 700,
                        fontSize: '0.7rem',
                        bgcolor: '#F1F5F9',
                        color: BRANDING.colors.primary,
                      }}
                    />
                  </TableCell>
                  <TableCell sx={{ fontSize: '0.825rem' }}>
                    <strong>{log.entityType}</strong>
                    {log.entityId && (
                      <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary' }}>
                        ID: {log.entityId.substring(0, 8)}...
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell sx={{ fontSize: '0.775rem', fontFamily: 'monospace' }}>
                    {log.ipAddress || '127.0.0.1'}
                  </TableCell>
                  <TableCell sx={{ fontSize: '0.75rem', maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {log.details ? JSON.stringify(log.details) : '—'}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[10, 15, 25, 50]}
          component="div"
          count={total}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
        />
      </TableContainer>
    </Box>
  );
};
