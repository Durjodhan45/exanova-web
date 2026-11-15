import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Card,
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
import MenuBookIcon from '@mui/icons-material/MenuBook';
import RefreshIcon from '@mui/icons-material/Refresh';
import { SEO } from '../../components/common/SEO';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { StatusBadge } from '../../components/common/StatusBadge';
import { facultyService } from '../../services/faculty.service';
import { academicService } from '../../services/academic.service';
import { useNotification } from '../../context/NotificationContext';
import { extractErrorMessage } from '../../services/api';
import { AcademicSession, Department, Faculty, Subject } from '../../types';
import { BRANDING } from '../../config/env';

export const FacultyManagementPage: React.FC = () => {
  const { showSuccess, showError } = useNotification();

  const [facultyList, setFacultyList] = useState<Faculty[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const [departments, setDepartments] = useState<Department[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [sessions, setSessions] = useState<AcademicSession[]>([]);

  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState<string>('ALL');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Add Faculty Dialog
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    employeeId: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    designation: 'Assistant Professor',
    departmentId: '',
  });
  const [createLoading, setCreateLoading] = useState(false);

  // Assign Subject Dialog
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedFaculty, setSelectedFaculty] = useState<Faculty | null>(null);
  const [assignSubjectId, setAssignSubjectId] = useState('');
  const [assignSessionId, setAssignSessionId] = useState('');
  const [assignLoading, setAssignLoading] = useState(false);

  useEffect(() => {
    Promise.all([
      academicService.getDepartments().catch(() => []),
      academicService.getSubjects().catch(() => []),
      academicService.getAcademicSessions().catch(() => []),
    ]).then(([d, sub, sess]) => {
      setDepartments(d);
      setSubjects(sub);
      setSessions(sess);
      if (sess.length > 0) setAssignSessionId(sess[0].id);
    });
  }, []);

  const fetchFaculty = async () => {
    setLoading(true);
    try {
      const res = await facultyService.getFacultyList({
        page: page + 1,
        limit: rowsPerPage,
        search: search.trim() || undefined,
        departmentId: selectedDept !== 'ALL' ? selectedDept : undefined,
      });
      setFacultyList(res.items);
      setTotal(res.total);
    } catch (err: unknown) {
      showError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFaculty();
  }, [page, rowsPerPage, selectedDept]);

  const handleCreateFaculty = async () => {
    if (
      !createForm.employeeId ||
      !createForm.firstName ||
      !createForm.lastName ||
      !createForm.email ||
      !createForm.departmentId
    ) {
      showError('Please complete all required fields.');
      return;
    }

    setCreateLoading(true);
    try {
      await facultyService.createFaculty(createForm);
      showSuccess(`Faculty member ${createForm.firstName} ${createForm.lastName} created!`);
      setCreateDialogOpen(false);
      setCreateForm({
        employeeId: '',
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        designation: 'Assistant Professor',
        departmentId: '',
      });
      fetchFaculty();
    } catch (err: unknown) {
      showError(extractErrorMessage(err));
    } finally {
      setCreateLoading(false);
    }
  };

  const handleAssignSubject = async () => {
    if (!selectedFaculty || !assignSubjectId || !assignSessionId) {
      showError('Please select both a subject and an academic session.');
      return;
    }

    setAssignLoading(true);
    try {
      await facultyService.assignSubject({
        facultyId: selectedFaculty.id,
        subjectId: assignSubjectId,
        academicSessionId: assignSessionId,
      });
      showSuccess(`Subject assigned to ${selectedFaculty.firstName} ${selectedFaculty.lastName}`);
      setAssignDialogOpen(false);
      fetchFaculty();
    } catch (err: unknown) {
      showError(extractErrorMessage(err));
    } finally {
      setAssignLoading(false);
    }
  };

  return (
    <Box sx={{ pb: 4 }}>
      <SEO title="Faculty Management" isPrivate />

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
            Faculty Directory
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            College faculty members, departmental designations, and subject allocations
          </Typography>
        </Box>

        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => setCreateDialogOpen(true)}
        >
          Add Faculty Member
        </Button>
      </Box>

      {/* Filter and Search Bar */}
      <Card sx={{ p: 2.5, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search faculty name or employee ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  setPage(0);
                  fetchFaculty();
                }
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" color="action" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          <Grid item xs={10} md={5}>
            <FormControl fullWidth size="small">
              <InputLabel>Department</InputLabel>
              <Select
                value={selectedDept}
                label="Department"
                onChange={(e) => {
                  setSelectedDept(e.target.value);
                  setPage(0);
                }}
              >
                <MenuItem value="ALL">All Departments</MenuItem>
                {departments.map((d) => (
                  <MenuItem key={d.id} value={d.id}>
                    {d.name} ({d.code})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={2} md={1} sx={{ textAlign: 'right' }}>
            <IconButton onClick={fetchFaculty} title="Refresh">
              <RefreshIcon />
            </IconButton>
          </Grid>
        </Grid>
      </Card>

      {/* Faculty Table */}
      <TableContainer component={Paper} elevation={0} sx={{ border: `1px solid ${BRANDING.colors.border}`, borderRadius: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Employee ID</TableCell>
              <TableCell>Full Name</TableCell>
              <TableCell>Department & Designation</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7}>
                  <LoadingSpinner message="Retrieving faculty profiles..." minHeight={200} />
                </TableCell>
              </TableRow>
            ) : facultyList.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7}>
                  <EmptyState
                    title="No faculty members found"
                    description="No faculty profiles match the selected filter. Create faculty profiles to assign examination roles."
                    actionText="Add Faculty Member"
                    onAction={() => setCreateDialogOpen(true)}
                  />
                </TableCell>
              </TableRow>
            ) : (
              facultyList.map((f) => (
                <TableRow key={f.id} hover>
                  <TableCell sx={{ fontWeight: 700, color: BRANDING.colors.primary }}>
                    {f.employeeId}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>
                    {f.firstName} {f.lastName}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {f.department?.name || 'Computer Science and Engineering'}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      {f.designation}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ fontSize: '0.85rem' }}>{f.user?.email || 'faculty@exanova.edu'}</TableCell>
                  <TableCell sx={{ fontSize: '0.85rem' }}>{f.phone || '—'}</TableCell>
                  <TableCell>
                    <StatusBadge status={f.user?.status || 'ACTIVE'} />
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Assign Subject">
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<MenuBookIcon />}
                        onClick={() => {
                          setSelectedFaculty(f);
                          setAssignDialogOpen(true);
                        }}
                      >
                        Assign Subject
                      </Button>
                    </Tooltip>
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

      {/* Create Faculty Dialog */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Add Faculty Profile</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  label="Employee ID"
                  fullWidth
                  size="small"
                  required
                  placeholder="e.g. FAC-002"
                  value={createForm.employeeId}
                  onChange={(e) => setCreateForm({ ...createForm, employeeId: e.target.value })}
                />
              </Grid>
              <Grid item xs={6}>
                <FormControl fullWidth size="small" required>
                  <InputLabel>Designation</InputLabel>
                  <Select
                    value={createForm.designation}
                    label="Designation"
                    onChange={(e) => setCreateForm({ ...createForm, designation: e.target.value })}
                  >
                    <MenuItem value="Professor">Professor</MenuItem>
                    <MenuItem value="Associate Professor">Associate Professor</MenuItem>
                    <MenuItem value="Assistant Professor">Assistant Professor</MenuItem>
                    <MenuItem value="Lecturer">Lecturer</MenuItem>
                    <MenuItem value="Visiting Faculty">Visiting Faculty</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="First Name"
                  fullWidth
                  size="small"
                  required
                  value={createForm.firstName}
                  onChange={(e) => setCreateForm({ ...createForm, firstName: e.target.value })}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Last Name"
                  fullWidth
                  size="small"
                  required
                  value={createForm.lastName}
                  onChange={(e) => setCreateForm({ ...createForm, lastName: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Institutional Email"
                  fullWidth
                  size="small"
                  type="email"
                  required
                  value={createForm.email}
                  onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Phone Number"
                  fullWidth
                  size="small"
                  value={createForm.phone}
                  onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
                />
              </Grid>
              <Grid item xs={6}>
                <FormControl fullWidth size="small" required>
                  <InputLabel>Department</InputLabel>
                  <Select
                    value={createForm.departmentId}
                    label="Department"
                    onChange={(e) => setCreateForm({ ...createForm, departmentId: e.target.value })}
                  >
                    {departments.map((d) => (
                      <MenuItem key={d.id} value={d.id}>
                        {d.name} ({d.code})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreateFaculty} disabled={createLoading}>
            {createLoading ? 'Creating...' : 'Create Faculty Profile'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Assign Subject Dialog */}
      <Dialog open={assignDialogOpen} onClose={() => setAssignDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Assign Subject Allocation</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="body2">
              Assign teaching course to <strong>{selectedFaculty?.firstName} {selectedFaculty?.lastName}</strong> ({selectedFaculty?.employeeId}):
            </Typography>

            <FormControl fullWidth size="small" required>
              <InputLabel>Subject</InputLabel>
              <Select
                value={assignSubjectId}
                label="Subject"
                onChange={(e) => setAssignSubjectId(e.target.value)}
              >
                {subjects.map((sub) => (
                  <MenuItem key={sub.id} value={sub.id}>
                    {sub.name} ({sub.code})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth size="small" required>
              <InputLabel>Academic Session</InputLabel>
              <Select
                value={assignSessionId}
                label="Academic Session"
                onChange={(e) => setAssignSessionId(e.target.value)}
              >
                {sessions.map((s) => (
                  <MenuItem key={s.id} value={s.id}>
                    {s.name} {s.isCurrent && '(Current)'}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setAssignDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAssignSubject} disabled={assignLoading}>
            {assignLoading ? 'Assigning...' : 'Assign Subject'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
