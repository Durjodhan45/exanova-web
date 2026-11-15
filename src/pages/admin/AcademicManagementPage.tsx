import React, { useEffect, useState } from 'react';
import {
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
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { SEO } from '../../components/common/SEO';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { academicService } from '../../services/academic.service';
import { useNotification } from '../../context/NotificationContext';
import { extractErrorMessage } from '../../services/api';
import { AcademicSession, Course, Department, Semester, Subject } from '../../types';
import { BRANDING } from '../../config/env';

export const AcademicManagementPage: React.FC = () => {
  const { showSuccess, showError } = useNotification();
  const [currentTab, setCurrentTab] = useState(0);
  const [loading, setLoading] = useState(true);

  const [departments, setDepartments] = useState<Department[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [sessions, setSessions] = useState<AcademicSession[]>([]);

  // Dialogs
  const [deptDialogOpen, setDeptDialogOpen] = useState(false);
  const [deptForm, setDeptForm] = useState({ name: '', code: '', description: '' });

  const [courseDialogOpen, setCourseDialogOpen] = useState(false);
  const [courseForm, setCourseForm] = useState({
    name: '',
    code: '',
    durationYears: 4,
    totalSemesters: 8,
    departmentId: '',
  });

  const [subjectDialogOpen, setSubjectDialogOpen] = useState(false);
  const [subjectForm, setSubjectForm] = useState({
    name: '',
    code: '',
    credits: 4,
    description: '',
    courseId: '',
    semesterId: '',
  });

  const [sessionDialogOpen, setSessionDialogOpen] = useState(false);
  const [sessionForm, setSessionForm] = useState({
    name: '',
    startDate: '2026-08-01',
    endDate: '2027-07-31',
    isCurrent: false,
  });

  const loadAll = async () => {
    setLoading(true);
    try {
      const [d, c, s, sub, sess] = await Promise.all([
        academicService.getDepartments().catch(() => []),
        academicService.getCourses().catch(() => []),
        academicService.getSemesters().catch(() => []),
        academicService.getSubjects().catch(() => []),
        academicService.getAcademicSessions().catch(() => []),
      ]);
      setDepartments(d);
      setCourses(c);
      setSemesters(s);
      setSubjects(sub);
      setSessions(sess);
      if (d.length > 0) setCourseForm((prev) => ({ ...prev, departmentId: d[0].id }));
      if (c.length > 0) setSubjectForm((prev) => ({ ...prev, courseId: c[0].id }));
      if (s.length > 0) setSubjectForm((prev) => ({ ...prev, semesterId: s[0].id }));
    } catch (err: unknown) {
      showError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const handleCreateDept = async () => {
    if (!deptForm.name || !deptForm.code) {
      showError('Department name and code are required.');
      return;
    }
    try {
      await academicService.createDepartment(deptForm);
      showSuccess(`Department ${deptForm.code} created!`);
      setDeptDialogOpen(false);
      setDeptForm({ name: '', code: '', description: '' });
      loadAll();
    } catch (err: unknown) {
      showError(extractErrorMessage(err));
    }
  };

  const handleCreateCourse = async () => {
    if (!courseForm.name || !courseForm.code || !courseForm.departmentId) {
      showError('Please fill all required course fields.');
      return;
    }
    try {
      await academicService.createCourse(courseForm);
      showSuccess(`Course ${courseForm.code} created!`);
      setCourseDialogOpen(false);
      loadAll();
    } catch (err: unknown) {
      showError(extractErrorMessage(err));
    }
  };

  const handleCreateSubject = async () => {
    if (!subjectForm.name || !subjectForm.code || !subjectForm.courseId || !subjectForm.semesterId) {
      showError('Please fill all required subject fields.');
      return;
    }
    try {
      await academicService.createSubject(subjectForm);
      showSuccess(`Subject ${subjectForm.code} created!`);
      setSubjectDialogOpen(false);
      loadAll();
    } catch (err: unknown) {
      showError(extractErrorMessage(err));
    }
  };

  const handleCreateSession = async () => {
    if (!sessionForm.name || !sessionForm.startDate || !sessionForm.endDate) {
      showError('Please fill session details.');
      return;
    }
    try {
      await academicService.createAcademicSession(sessionForm);
      showSuccess(`Session ${sessionForm.name} created!`);
      setSessionDialogOpen(false);
      loadAll();
    } catch (err: unknown) {
      showError(extractErrorMessage(err));
    }
  };

  const handleActivateSession = async (id: string) => {
    try {
      await academicService.activateAcademicSession(id);
      showSuccess('Academic session activated!');
      loadAll();
    } catch (err: unknown) {
      showError(extractErrorMessage(err));
    }
  };

  return (
    <Box sx={{ pb: 4 }}>
      <SEO title="Academic Structure Management" isPrivate />

      {/* Header bar */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: BRANDING.colors.primary, mb: 0.5 }}>
            Academic Structure
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Manage college departments, degree programmes, semesters, subjects, and academic terms
          </Typography>
        </Box>
      </Box>

      {/* Tabs */}
      <Card sx={{ mb: 3 }}>
        <Tabs
          value={currentTab}
          onChange={(_, val) => setCurrentTab(val)}
          sx={{ borderBottom: `1px solid ${BRANDING.colors.border}`, px: 2 }}
        >
          <Tab label={`Departments (${departments.length})`} />
          <Tab label={`Courses (${courses.length})`} />
          <Tab label={`Semesters (${semesters.length})`} />
          <Tab label={`Subjects (${subjects.length})`} />
          <Tab label={`Academic Sessions (${sessions.length})`} />
        </Tabs>
      </Card>

      {loading ? (
        <LoadingSpinner message="Loading academic records..." />
      ) : (
        <>
          {/* TAB 0: Departments */}
          {currentTab === 0 && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => setDeptDialogOpen(true)}>
                  Add Department
                </Button>
              </Box>
              <TableContainer component={Paper} elevation={0} sx={{ border: `1px solid ${BRANDING.colors.border}` }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Code</TableCell>
                      <TableCell>Department Name</TableCell>
                      <TableCell>Description</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {departments.map((d) => (
                      <TableRow key={d.id} hover>
                        <TableCell sx={{ fontWeight: 700 }}>{d.code}</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>{d.name}</TableCell>
                        <TableCell>{d.description || '—'}</TableCell>
                        <TableCell>
                          <Chip label={d.isActive ? 'Active' : 'Inactive'} color="success" size="small" />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}

          {/* TAB 1: Courses */}
          {currentTab === 1 && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => setCourseDialogOpen(true)}>
                  Add Course
                </Button>
              </Box>
              <TableContainer component={Paper} elevation={0} sx={{ border: `1px solid ${BRANDING.colors.border}` }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Code</TableCell>
                      <TableCell>Course Title</TableCell>
                      <TableCell>Duration</TableCell>
                      <TableCell>Semesters</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {courses.map((c) => (
                      <TableRow key={c.id} hover>
                        <TableCell sx={{ fontWeight: 700 }}>{c.code}</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>{c.name}</TableCell>
                        <TableCell>{c.durationYears} Years</TableCell>
                        <TableCell>{c.totalSemesters} Semesters</TableCell>
                        <TableCell>
                          <Chip label={c.isActive ? 'Active' : 'Inactive'} color="success" size="small" />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}

          {/* TAB 2: Semesters */}
          {currentTab === 2 && (
            <TableContainer component={Paper} elevation={0} sx={{ border: `1px solid ${BRANDING.colors.border}` }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Semester Number</TableCell>
                    <TableCell>Semester Title</TableCell>
                    <TableCell>Course</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {semesters.map((s) => (
                    <TableRow key={s.id} hover>
                      <TableCell sx={{ fontWeight: 700 }}>{s.semesterNumber}</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>{s.name}</TableCell>
                      <TableCell>{s.course?.name || 'BTECH-CSE'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {/* TAB 3: Subjects */}
          {currentTab === 3 && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => setSubjectDialogOpen(true)}>
                  Add Subject
                </Button>
              </Box>
              <TableContainer component={Paper} elevation={0} sx={{ border: `1px solid ${BRANDING.colors.border}` }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Subject Code</TableCell>
                      <TableCell>Subject Title</TableCell>
                      <TableCell>Credits</TableCell>
                      <TableCell>Course & Semester</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {subjects.map((sub) => (
                      <TableRow key={sub.id} hover>
                        <TableCell sx={{ fontWeight: 700, color: BRANDING.colors.primary }}>
                          {sub.code}
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>{sub.name}</TableCell>
                        <TableCell>{sub.credits} Credits</TableCell>
                        <TableCell>
                          {sub.course?.code || 'BTECH-CSE'} • {sub.semester?.name || 'Semester 5'}
                        </TableCell>
                        <TableCell>
                          <Chip label={sub.isActive ? 'Active' : 'Inactive'} color="success" size="small" />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}

          {/* TAB 4: Academic Sessions */}
          {currentTab === 4 && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => setSessionDialogOpen(true)}>
                  Create Academic Session
                </Button>
              </Box>
              <TableContainer component={Paper} elevation={0} sx={{ border: `1px solid ${BRANDING.colors.border}` }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Session Term</TableCell>
                      <TableCell>Start Date</TableCell>
                      <TableCell>End Date</TableCell>
                      <TableCell>Current Status</TableCell>
                      <TableCell align="right">Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {sessions.map((sess) => (
                      <TableRow key={sess.id} hover>
                        <TableCell sx={{ fontWeight: 700 }}>{sess.name}</TableCell>
                        <TableCell>{new Date(sess.startDate).toLocaleDateString()}</TableCell>
                        <TableCell>{new Date(sess.endDate).toLocaleDateString()}</TableCell>
                        <TableCell>
                          {sess.isCurrent ? (
                            <Chip label="Current Active Term" color="success" size="small" icon={<CheckCircleIcon />} />
                          ) : (
                            <Chip label="Archived" size="small" />
                          )}
                        </TableCell>
                        <TableCell align="right">
                          {!sess.isCurrent && (
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={() => handleActivateSession(sess.id)}
                            >
                              Set as Active Term
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
        </>
      )}

      {/* Add Department Dialog */}
      <Dialog open={deptDialogOpen} onClose={() => setDeptDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Add Academic Department</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Department Name"
              fullWidth
              size="small"
              required
              placeholder="e.g. Electrical Engineering"
              value={deptForm.name}
              onChange={(e) => setDeptForm({ ...deptForm, name: e.target.value })}
            />
            <TextField
              label="Department Code"
              fullWidth
              size="small"
              required
              placeholder="e.g. EE"
              value={deptForm.code}
              onChange={(e) => setDeptForm({ ...deptForm, code: e.target.value.toUpperCase() })}
            />
            <TextField
              label="Description"
              fullWidth
              size="small"
              multiline
              rows={3}
              value={deptForm.description}
              onChange={(e) => setDeptForm({ ...deptForm, description: e.target.value })}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDeptDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreateDept}>Create Department</Button>
        </DialogActions>
      </Dialog>

      {/* Add Course Dialog */}
      <Dialog open={courseDialogOpen} onClose={() => setCourseDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Add Degree Course</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <FormControl fullWidth size="small" required>
              <InputLabel>Department</InputLabel>
              <Select
                value={courseForm.departmentId}
                label="Department"
                onChange={(e) => setCourseForm({ ...courseForm, departmentId: e.target.value })}
              >
                {departments.map((d) => (
                  <MenuItem key={d.id} value={d.id}>
                    {d.name} ({d.code})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Course Title"
              fullWidth
              size="small"
              required
              placeholder="e.g. Bachelor of Technology in EE"
              value={courseForm.name}
              onChange={(e) => setCourseForm({ ...courseForm, name: e.target.value })}
            />
            <TextField
              label="Course Code"
              fullWidth
              size="small"
              required
              placeholder="e.g. BTECH-EE"
              value={courseForm.code}
              onChange={(e) => setCourseForm({ ...courseForm, code: e.target.value.toUpperCase() })}
            />
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  label="Duration (Years)"
                  type="number"
                  fullWidth
                  size="small"
                  value={courseForm.durationYears}
                  onChange={(e) => setCourseForm({ ...courseForm, durationYears: Number(e.target.value) })}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Total Semesters"
                  type="number"
                  fullWidth
                  size="small"
                  value={courseForm.totalSemesters}
                  onChange={(e) => setCourseForm({ ...courseForm, totalSemesters: Number(e.target.value) })}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setCourseDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreateCourse}>Create Course</Button>
        </DialogActions>
      </Dialog>

      {/* Add Subject Dialog */}
      <Dialog open={subjectDialogOpen} onClose={() => setSubjectDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Add Course Subject</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <FormControl fullWidth size="small" required>
              <InputLabel>Course</InputLabel>
              <Select
                value={subjectForm.courseId}
                label="Course"
                onChange={(e) => setSubjectForm({ ...subjectForm, courseId: e.target.value })}
              >
                {courses.map((c) => (
                  <MenuItem key={c.id} value={c.id}>
                    {c.name} ({c.code})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth size="small" required>
              <InputLabel>Semester</InputLabel>
              <Select
                value={subjectForm.semesterId}
                label="Semester"
                onChange={(e) => setSubjectForm({ ...subjectForm, semesterId: e.target.value })}
              >
                {semesters.map((s) => (
                  <MenuItem key={s.id} value={s.id}>
                    {s.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Subject Title"
              fullWidth
              size="small"
              required
              placeholder="e.g. Microprocessors and Microcontrollers"
              value={subjectForm.name}
              onChange={(e) => setSubjectForm({ ...subjectForm, name: e.target.value })}
            />
            <TextField
              label="Subject Code"
              fullWidth
              size="small"
              required
              placeholder="e.g. CS502"
              value={subjectForm.code}
              onChange={(e) => setSubjectForm({ ...subjectForm, code: e.target.value.toUpperCase() })}
            />
            <TextField
              label="Credits"
              type="number"
              fullWidth
              size="small"
              value={subjectForm.credits}
              onChange={(e) => setSubjectForm({ ...subjectForm, credits: Number(e.target.value) })}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setSubjectDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreateSubject}>Create Subject</Button>
        </DialogActions>
      </Dialog>

      {/* Add Session Dialog */}
      <Dialog open={sessionDialogOpen} onClose={() => setSessionDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Create Academic Session</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Session Title"
              fullWidth
              size="small"
              required
              placeholder="e.g. 2026-2027"
              value={sessionForm.name}
              onChange={(e) => setSessionForm({ ...sessionForm, name: e.target.value })}
            />
            <TextField
              label="Start Date"
              type="date"
              fullWidth
              size="small"
              InputLabelProps={{ shrink: true }}
              value={sessionForm.startDate}
              onChange={(e) => setSessionForm({ ...sessionForm, startDate: e.target.value })}
            />
            <TextField
              label="End Date"
              type="date"
              fullWidth
              size="small"
              InputLabelProps={{ shrink: true }}
              value={sessionForm.endDate}
              onChange={(e) => setSessionForm({ ...sessionForm, endDate: e.target.value })}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setSessionDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreateSession}>Create Session</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
