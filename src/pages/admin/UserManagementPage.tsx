import React, { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import LockResetIcon from '@mui/icons-material/LockReset';
import ToggleOnIcon from '@mui/icons-material/ToggleOn';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import RefreshIcon from '@mui/icons-material/Refresh';
import { SEO } from '../../components/common/SEO';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { usersService } from '../../services/users.service';
import { useNotification } from '../../context/NotificationContext';
import { extractErrorMessage } from '../../services/api';
import { User, UserRole, UserStatus } from '../../types';
import { BRANDING } from '../../config/env';

export const UserManagementPage: React.FC = () => {
  const { showSuccess, showError } = useNotification();

  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Dialogs
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [createForm, setCreateForm] = useState<{
    username: string;
    email: string;
    password: string;
    role: UserRole;
  }>({
    username: '',
    email: '',
    password: '',
    role: UserRole.STUDENT,
  });
  const [createLoading, setCreateLoading] = useState(false);

  // Status Dialog
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newStatus, setNewStatus] = useState<UserStatus>(UserStatus.ACTIVE);

  // Reset Password Dialog
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [resetPasswordVal, setResetPasswordVal] = useState('Password@123');
  const [resetResult, setResetResult] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await usersService.getUsers({
        page: page + 1,
        limit: rowsPerPage,
        search: search.trim() || undefined,
        role: roleFilter !== 'ALL' ? (roleFilter as UserRole) : undefined,
        status: statusFilter !== 'ALL' ? (statusFilter as UserStatus) : undefined,
      });
      setUsers(res.items);
      setTotal(res.total);
    } catch (err: unknown) {
      showError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, rowsPerPage, roleFilter, statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0);
    fetchUsers();
  };

  const handleCreateUser = async () => {
    if (!createForm.username || !createForm.email) {
      showError('Please complete all required fields.');
      return;
    }
    setCreateLoading(true);
    try {
      await usersService.createUser(createForm);
      showSuccess(`User account ${createForm.username} created successfully!`);
      setCreateDialogOpen(false);
      setCreateForm({ username: '', email: '', password: '', role: UserRole.STUDENT });
      fetchUsers();
    } catch (err: unknown) {
      showError(extractErrorMessage(err));
    } finally {
      setCreateLoading(false);
    }
  };

  const handleStatusChangeSubmit = async () => {
    if (!selectedUser) return;
    try {
      await usersService.updateUserStatus(selectedUser.id, newStatus);
      showSuccess(`User status updated to ${newStatus}`);
      setStatusDialogOpen(false);
      fetchUsers();
    } catch (err: unknown) {
      showError(extractErrorMessage(err));
    }
  };

  const handleResetPasswordSubmit = async () => {
    if (!selectedUser) return;
    try {
      const res = await usersService.resetPassword(selectedUser.id, resetPasswordVal);
      setResetResult(res.temporaryPassword || resetPasswordVal);
      showSuccess(`Password for ${selectedUser.username} has been reset.`);
    } catch (err: unknown) {
      showError(extractErrorMessage(err));
    }
  };

  const handleExport = async () => {
    try {
      const data = await usersService.exportUsers();
      const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(data, null, 2))}`;
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', jsonString);
      downloadAnchor.setAttribute('download', 'exanova_users_export.json');
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      showSuccess('Users exported successfully!');
    } catch (err: unknown) {
      showError(extractErrorMessage(err));
    }
  };

  return (
    <Box sx={{ pb: 4 }}>
      <SEO title="User Account Management" isPrivate />

      {/* Header bar */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
          gap: 2,
          mb: 4,
        }}
      >
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: BRANDING.colors.primary, mb: 0.5 }}>
            User Accounts
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            System credentials, access control roles, and authentication security status
          </Typography>
        </Box>

        <Stack direction="row" spacing={1.5}>
          <Button variant="outlined" startIcon={<FileDownloadIcon />} onClick={handleExport}>
            Export Accounts
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => setCreateDialogOpen(true)}
          >
            Create User
          </Button>
        </Stack>
      </Box>

      {/* Filter and Search Bar */}
      <Card sx={{ p: 2.5, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={5}>
            <Box component="form" onSubmit={handleSearchSubmit}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search username or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>
          </Grid>

          <Grid item xs={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Role Filter</InputLabel>
              <Select
                value={roleFilter}
                label="Role Filter"
                onChange={(e) => {
                  setRoleFilter(e.target.value);
                  setPage(0);
                }}
              >
                <MenuItem value="ALL">All Roles</MenuItem>
                <MenuItem value="ADMIN">Admin</MenuItem>
                <MenuItem value="FACULTY">Faculty</MenuItem>
                <MenuItem value="STUDENT">Student</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                label="Status"
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(0);
                }}
              >
                <MenuItem value="ALL">All Statuses</MenuItem>
                <MenuItem value="ACTIVE">Active</MenuItem>
                <MenuItem value="INACTIVE">Inactive</MenuItem>
                <MenuItem value="SUSPENDED">Suspended</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={1} sx={{ textAlign: 'right' }}>
            <IconButton onClick={fetchUsers} title="Refresh">
              <RefreshIcon />
            </IconButton>
          </Grid>
        </Grid>
      </Card>

      {/* Users Table */}
      <TableContainer component={Paper} elevation={0} sx={{ border: `1px solid ${BRANDING.colors.border}`, borderRadius: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Username / Roll No.</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Password State</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6}>
                  <LoadingSpinner message="Retrieving user records..." minHeight={200} />
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6}>
                  <EmptyState
                    title="No users found"
                    description="No user accounts match the selected search and filter criteria."
                    actionText="Add New User"
                    onAction={() => setCreateDialogOpen(true)}
                  />
                </TableCell>
              </TableRow>
            ) : (
              users.map((u) => (
                <TableRow key={u.id} hover>
                  <TableCell sx={{ fontWeight: 600 }}>{u.username}</TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>
                    <Chip
                      label={u.role}
                      size="small"
                      sx={{
                        fontWeight: 700,
                        fontSize: '0.75rem',
                        bgcolor:
                          u.role === 'ADMIN' ? '#FEE2E2' : u.role === 'FACULTY' ? '#EDE9FE' : '#CCFBF1',
                        color:
                          u.role === 'ADMIN' ? '#991B1B' : u.role === 'FACULTY' ? '#5B21B6' : '#0F766E',
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={u.status} />
                  </TableCell>
                  <TableCell>
                    {u.mustChangePassword ? (
                      <Chip label="Must Change" size="small" color="warning" variant="outlined" />
                    ) : (
                      <Chip label="Configured" size="small" color="success" variant="outlined" />
                    )}
                  </TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      <Tooltip title="Toggle Status">
                        <IconButton
                          size="small"
                          onClick={() => {
                            setSelectedUser(u);
                            setNewStatus(u.status);
                            setStatusDialogOpen(true);
                          }}
                        >
                          <ToggleOnIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Reset Password">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => {
                            setSelectedUser(u);
                            setResetResult(null);
                            setResetDialogOpen(true);
                          }}
                        >
                          <LockResetIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
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

      {/* Create User Dialog */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Create New User</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Username / Roll Number"
              fullWidth
              size="small"
              value={createForm.username}
              onChange={(e) => setCreateForm({ ...createForm, username: e.target.value })}
              required
            />
            <TextField
              label="Email Address"
              fullWidth
              size="small"
              type="email"
              value={createForm.email}
              onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
              required
            />
            <TextField
              label="Initial Password (Optional)"
              fullWidth
              size="small"
              type="password"
              placeholder="Leave empty for system default"
              value={createForm.password}
              onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
            />
            <FormControl fullWidth size="small">
              <InputLabel>User Role</InputLabel>
              <Select
                value={createForm.role}
                label="User Role"
                onChange={(e) => setCreateForm({ ...createForm, role: e.target.value as UserRole })}
              >
                <MenuItem value={UserRole.STUDENT}>Student</MenuItem>
                <MenuItem value={UserRole.FACULTY}>Faculty</MenuItem>
                <MenuItem value={UserRole.ADMIN}>Admin</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreateUser} disabled={createLoading}>
            {createLoading ? 'Creating...' : 'Create Account'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Change Status Dialog */}
      <Dialog open={statusDialogOpen} onClose={() => setStatusDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Update Account Status</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Update active status for user <strong>{selectedUser?.username}</strong>:
            </Typography>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={newStatus}
                label="Status"
                onChange={(e) => setNewStatus(e.target.value as UserStatus)}
              >
                <MenuItem value={UserStatus.ACTIVE}>Active</MenuItem>
                <MenuItem value={UserStatus.INACTIVE}>Inactive</MenuItem>
                <MenuItem value={UserStatus.SUSPENDED}>Suspended</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setStatusDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" color="primary" onClick={handleStatusChangeSubmit}>
            Update Status
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reset Password Dialog */}
      <Dialog open={resetDialogOpen} onClose={() => setResetDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Reset User Password</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="body2">
              Set new temporary password for <strong>{selectedUser?.username}</strong> ({selectedUser?.email}):
            </Typography>
            <TextField
              label="New Temporary Password"
              fullWidth
              size="small"
              value={resetPasswordVal}
              onChange={(e) => setResetPasswordVal(e.target.value)}
            />
            {resetResult && (
              <Alert severity="success" sx={{ borderRadius: 1.5 }}>
                Password reset successful! Temporary credentials: <strong>{resetResult}</strong>
              </Alert>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setResetDialogOpen(false)}>Close</Button>
          {!resetResult && (
            <Button variant="contained" color="error" onClick={handleResetPasswordSubmit}>
              Reset Password
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};
