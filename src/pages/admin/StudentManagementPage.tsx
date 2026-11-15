import React, { useEffect, useState } from 'react';
import {
  Alert,
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
  Typography,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import RefreshIcon from '@mui/icons-material/Refresh';
import { SEO } from '../../components/common/SEO';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { StatusBadge } from '../../components/common/StatusBadge';
import { studentsService } from '../../services/students.service';
import { academicService } from '../../services/academic.service';
import { useNotification } from '../../context/NotificationContext';
import { extractErrorMessage } from '../../services/api';
import { AcademicSession, Course, Department, Semester, Student } from '../../types';
import { BRANDING } from '../../config/env';

export const StudentManagementPage: React.FC = () => {
  const { showSuccess, showError } = useNotification();

  const [students, setStudents] = useState<Student[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  // Filter lists
  const [departments, setDepartments] = useState<Department[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [sessions, setSessions] = useState<AcademicSession[]>([]);

  // Search and filters
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState<string>('ALL');
  const [selectedCourse, setSelectedCourse] = useState<string>('ALL');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Create Student Dialog
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    rollNumber: '',
    registrationNumber: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    departmentId: '',
    courseId: '',
    currentSemesterId: '',
    academicSessionId: '',
  });
  const [createLoading, setCreateLoading] = useState(false);

  // Bulk Import Dialog
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importDept, setImportDept] = useState('');
  const [importCourse, setImportCourse] = useState('');
  const [importSemester, setImportSemester] = useState('');
  const [importSession, setImportSession] = useState('');
  const [importLoading, setImportLoading] = useState(false);
  const [importResult, setImportResult] = useState<any | null>(null);

  // Load academic metadata
  useEffect(() => {
    Promise.all([
      academicService.getDepartments().catch(() => []),
      academicService.getCourses().catch(() => []),
      academicService.getSemesters().catch(() => []),
      academicService.getAcademicSessions().catch(() => []),
    ]).then(([d, c, s, a]) => {
      setDepartments(d);
      setCourses(c);
      setSemesters(s);
      setSessions(a);
      if (d.length > 0) setImportDept(d[0].id);
      if (c.length > 0) setImportCourse(c[0].id);
      if (s.length > 0) setImportSemester(s[0].id);
      if (a.length > 0) setImportSession(a[0].id);
    });
  }, []);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const res = await studentsService.getStudents({
        page: page + 1,
        limit: rowsPerPage,
        search: search.trim() || undefined,
        departmentId: selectedDept !== 'ALL' ? selectedDept : undefined,
        courseId: selectedCourse !== 'ALL' ? selectedCourse : undefined,
      });
      setStudents(res.items);
      setTotal(res.total);
    } catch (err: unknown) {
      showError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [page, rowsPerPage, selectedDept, selectedCourse]);

  const handleCreateStudent = async () => {
    if (
      !createForm.rollNumber ||
      !createForm.registrationNumber ||
      !createForm.firstName ||
      !createForm.lastName ||
      !createForm.departmentId ||
      !createForm.courseId ||
      !createForm.currentSemesterId ||
      !createForm.academicSessionId
    ) {
      showError('Please complete all required fields.');
      return;
    }

    setCreateLoading(true);
    try {
      await studentsService.createStudent(createForm);
      showSuccess(`Student ${createForm.rollNumber} enrolled successfully!`);
      setCreateDialogOpen(false);
      setCreateForm({
        rollNumber: '',
        registrationNumber: '',
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        departmentId: '',
        courseId: '',
        currentSemesterId: '',
        academicSessionId: '',
      });
      fetchStudents();
    } catch (err: unknown) {
      showError(extractErrorMessage(err));
    } finally {
      setCreateLoading(false);
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const blob = await studentsService.downloadImportTemplate();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'exanova_students_import_template.xlsx';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      showSuccess('Template downloaded successfully!');
    } catch (err: unknown) {
      showError(extractErrorMessage(err));
    }
  };

  const handleBulkImport = async () => {
    if (!importFile) {
      showError('Please select an Excel (.xlsx) file to upload.');
      return;
    }
    if (!importDept || !importCourse || !importSemester || !importSession) {
      showError('Please select Department, Course, Semester, and Academic Session.');
      return;
    }

    setImportLoading(true);
    setImportResult(null);

    const formData = new FormData();
    formData.append('file', importFile);
    formData.append('departmentId', importDept);
    formData.append('courseId', importCourse);
    formData.append('semesterId', importSemester);
    formData.append('academicSessionId', importSession);

    try {
      const res = await studentsService.bulkImportStudents(formData);
      setImportResult(res);
      showSuccess(`Import completed! Successfully imported: ${res.imported} students.`);
      fetchStudents();
    } catch (err: unknown) {
      showError(extractErrorMessage(err));
    } finally {
      setImportLoading(false);
    }
  };

  return (
    <Box sx={{ pb: 4 }}>
      <SEO title="Student Enrollment Directory" isPrivate />

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
            Student Directory
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            College enrolled students, roll registration, semester allocations, and credential status
          </Typography>
        </Box>

        <Stack direction="row" spacing={1.5}>
          <Button variant="outlined" startIcon={<FileDownloadIcon />} onClick={handleDownloadTemplate}>
            Download Template
          </Button>
          <Button
            variant="outlined"
            color="secondary"
            startIcon={<UploadFileIcon />}
            onClick={() => {
              setImportResult(null);
              setImportDialogOpen(true);
            }}
          >
            Bulk Excel Import
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => setCreateDialogOpen(true)}
          >
            Enroll Student
          </Button>
        </Stack>
      </Box>

      {/* Filter and Search Bar */}
      <Card sx={{ p: 2.5, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={5}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search roll number, registration, or name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  setPage(0);
                  fetchStudents();
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

          <Grid item xs={6} md={3}>
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

          <Grid item xs={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Course</InputLabel>
              <Select
                value={selectedCourse}
                label="Course"
                onChange={(e) => {
                  setSelectedCourse(e.target.value);
                  setPage(0);
                }}
              >
                <MenuItem value="ALL">All Courses</MenuItem>
                {courses.map((c) => (
                  <MenuItem key={c.id} value={c.id}>
                    {c.code}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={1} sx={{ textAlign: 'right' }}>
            <IconButton onClick={fetchStudents} title="Refresh">
              <RefreshIcon />
            </IconButton>
          </Grid>
        </Grid>
      </Card>

      {/* Students Table */}
      <TableContainer component={Paper} elevation={0} sx={{ border: `1px solid ${BRANDING.colors.border}`, borderRadius: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Roll Number</TableCell>
              <TableCell>Reg. Number</TableCell>
              <TableCell>Full Name</TableCell>
              <TableCell>Department & Course</TableCell>
              <TableCell>Semester</TableCell>
              <TableCell>Contact</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7}>
                  <LoadingSpinner message="Loading student records..." minHeight={200} />
                </TableCell>
              </TableRow>
            ) : students.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7}>
                  <EmptyState
                    title="No students found"
                    description="No student records match the active criteria. Enroll individual students or upload an Excel batch."
                    actionText="Enroll Student"
                    onAction={() => setCreateDialogOpen(true)}
                  />
                </TableCell>
              </TableRow>
            ) : (
              students.map((s) => (
                <TableRow key={s.id} hover>
                  <TableCell sx={{ fontWeight: 700, color: BRANDING.colors.primary }}>
                    {s.rollNumber}
                  </TableCell>
                  <TableCell sx={{ fontSize: '0.825rem' }}>{s.registrationNumber}</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>
                    {s.firstName} {s.lastName}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {s.department?.code || 'CSE'}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      {s.course?.code || 'BTECH-CSE'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {s.currentSemester?.name || 'Semester 5'}
                  </TableCell>
                  <TableCell sx={{ fontSize: '0.825rem' }}>
                    {s.user?.email || 'student@exanova.edu'}
                    {s.phone && (
                      <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary' }}>
                        {s.phone}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={s.user?.status || 'ACTIVE'} />
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

      {/* Enroll Single Student Dialog */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Enroll New Student</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  label="Roll Number"
                  fullWidth
                  size="small"
                  required
                  placeholder="e.g. 230002"
                  value={createForm.rollNumber}
                  onChange={(e) => setCreateForm({ ...createForm, rollNumber: e.target.value })}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Registration Number"
                  fullWidth
                  size="small"
                  required
                  placeholder="e.g. REG-2023-0002"
                  value={createForm.registrationNumber}
                  onChange={(e) => setCreateForm({ ...createForm, registrationNumber: e.target.value })}
                />
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
                  label="Email Address"
                  fullWidth
                  size="small"
                  type="email"
                  required
                  value={createForm.email}
                  onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Phone Number (Optional)"
                  fullWidth
                  size="small"
                  value={createForm.phone}
                  onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
                />
              </Grid>

              {/* Academic dropdowns */}
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
              <Grid item xs={6}>
                <FormControl fullWidth size="small" required>
                  <InputLabel>Course</InputLabel>
                  <Select
                    value={createForm.courseId}
                    label="Course"
                    onChange={(e) => setCreateForm({ ...createForm, courseId: e.target.value })}
                  >
                    {courses.map((c) => (
                      <MenuItem key={c.id} value={c.id}>
                        {c.name} ({c.code})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <FormControl fullWidth size="small" required>
                  <InputLabel>Current Semester</InputLabel>
                  <Select
                    value={createForm.currentSemesterId}
                    label="Current Semester"
                    onChange={(e) => setCreateForm({ ...createForm, currentSemesterId: e.target.value })}
                  >
                    {semesters.map((s) => (
                      <MenuItem key={s.id} value={s.id}>
                        {s.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <FormControl fullWidth size="small" required>
                  <InputLabel>Academic Session</InputLabel>
                  <Select
                    value={createForm.academicSessionId}
                    label="Academic Session"
                    onChange={(e) => setCreateForm({ ...createForm, academicSessionId: e.target.value })}
                  >
                    {sessions.map((a) => (
                      <MenuItem key={a.id} value={a.id}>
                        {a.name} {a.isCurrent && '(Current)'}
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
          <Button variant="contained" onClick={handleCreateStudent} disabled={createLoading}>
            {createLoading ? 'Enrolling...' : 'Enroll Student'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Bulk Excel Import Dialog */}
      <Dialog open={importDialogOpen} onClose={() => setImportDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Bulk Student Import (Excel .xlsx)</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Alert severity="info" sx={{ borderRadius: 1.5 }}>
              Strict memory-buffered ingestion: Student rows in the uploaded Excel spreadsheet are
              validated in-memory and committed directly to the database. No files are stored to disk.
            </Alert>

            <Grid container spacing={2}>
              <Grid item xs={6}>
                <FormControl fullWidth size="small" required>
                  <InputLabel>Department</InputLabel>
                  <Select
                    value={importDept}
                    label="Department"
                    onChange={(e) => setImportDept(e.target.value)}
                  >
                    {departments.map((d) => (
                      <MenuItem key={d.id} value={d.id}>
                        {d.name} ({d.code})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <FormControl fullWidth size="small" required>
                  <InputLabel>Course</InputLabel>
                  <Select
                    value={importCourse}
                    label="Course"
                    onChange={(e) => setImportCourse(e.target.value)}
                  >
                    {courses.map((c) => (
                      <MenuItem key={c.id} value={c.id}>
                        {c.code}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <FormControl fullWidth size="small" required>
                  <InputLabel>Semester</InputLabel>
                  <Select
                    value={importSemester}
                    label="Semester"
                    onChange={(e) => setImportSemester(e.target.value)}
                  >
                    {semesters.map((s) => (
                      <MenuItem key={s.id} value={s.id}>
                        {s.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <FormControl fullWidth size="small" required>
                  <InputLabel>Academic Session</InputLabel>
                  <Select
                    value={importSession}
                    label="Academic Session"
                    onChange={(e) => setImportSession(e.target.value)}
                  >
                    {sessions.map((a) => (
                      <MenuItem key={a.id} value={a.id}>
                        {a.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            <Box
              sx={{
                p: 3,
                border: `2px dashed ${BRANDING.colors.border}`,
                borderRadius: 2,
                textAlign: 'center',
                bgcolor: '#FAFBFD',
              }}
            >
              <input
                type="file"
                accept=".xlsx, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                id="excel-file-input"
                style={{ display: 'none' }}
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setImportFile(e.target.files[0]);
                  }
                }}
              />
              <label htmlFor="excel-file-input">
                <Button variant="outlined" component="span" startIcon={<UploadFileIcon />}>
                  Choose Excel (.xlsx) File
                </Button>
              </label>
              {importFile && (
                <Typography variant="body2" sx={{ mt: 1.5, fontWeight: 600, color: BRANDING.colors.primary }}>
                  Selected: {importFile.name} ({(importFile.size / 1024).toFixed(1)} KB)
                </Typography>
              )}
            </Box>

            {importResult && (
              <Box sx={{ mt: 1 }}>
                <Alert severity={importResult.failed > 0 ? 'warning' : 'success'} sx={{ borderRadius: 1.5 }}>
                  Successfully imported: <strong>{importResult.imported}</strong> student accounts.
                  {importResult.failed > 0 && ` (${importResult.failed} failed validation).`}
                </Alert>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setImportDialogOpen(false)}>Close</Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleBulkImport}
            disabled={importLoading || !importFile}
          >
            {importLoading ? 'Processing In-Memory...' : 'Import Students'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
