import React, { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  FormControlLabel,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Step,
  StepLabel,
  Stepper,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useNavigate } from 'react-router-dom';
import { SEO } from '../../components/common/SEO';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { academicService } from '../../services/academic.service';
import { examinationsService } from '../../services/examinations.service';
import { useNotification } from '../../context/NotificationContext';
import { extractErrorMessage } from '../../services/api';
import {
  AcademicSession,
  Course,
  Department,
  ExaminationType,
  NegativeMarkingType,
  Semester,
  Subject,
} from '../../types';
import { BRANDING } from '../../config/env';

const steps = ['Basic Information', 'Schedule & Timing', 'Marking & Anti-Cheat', 'Review & Authorize'];

interface CreateExamFormState {
  title: string;
  examinationCode: string;
  description: string;
  departmentId: string;
  courseId: string;
  semesterId: string;
  subjectId: string;
  academicSessionId: string;
  examinationType: ExaminationType;
  examDate: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  totalMarks: number;
  passingMarks: number;
  maxAttempts: number;
  negativeMarkingType: NegativeMarkingType;
  negativeMarkingValue: number;
  allowNegativeMarksBelowZero: boolean;
  randomizeQuestions: boolean;
  randomizeOptions: boolean;
  instructions: string;
}

export const CreateExaminationPage: React.FC = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotification();

  const [activeStep, setActiveStep] = useState(0);
  const [loadingMetadata, setLoadingMetadata] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  // Academic metadata
  const [departments, setDepartments] = useState<Department[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [sessions, setSessions] = useState<AcademicSession[]>([]);

  // Form State
  const [form, setForm] = useState<CreateExamFormState>({
    title: '',
    examinationCode: '',
    description: '',
    departmentId: '',
    courseId: '',
    semesterId: '',
    subjectId: '',
    academicSessionId: '',
    examinationType: ExaminationType.MIXED,
    // Timing
    examDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    startTime: '10:00',
    endTime: '18:00',
    durationMinutes: 60,
    totalMarks: 50,
    passingMarks: 20,
    maxAttempts: 1,
    // Marking Engine
    negativeMarkingType: NegativeMarkingType.FIXED,
    negativeMarkingValue: 0.25,
    allowNegativeMarksBelowZero: false,
    randomizeQuestions: false,
    randomizeOptions: false,
    // Instructions
    instructions:
      '1. Distraction-free exam environment is mandatory.\n2. Tab switching and window resizing are logged by anti-cheat telemetry.\n3. The exam will automatically submit upon server timer expiry.',
  });

  useEffect(() => {
    Promise.all([
      academicService.getDepartments().catch(() => []),
      academicService.getCourses().catch(() => []),
      academicService.getSemesters().catch(() => []),
      academicService.getSubjects().catch(() => []),
      academicService.getAcademicSessions().catch(() => []),
    ]).then(([d, c, s, sub, sess]) => {
      setDepartments(d);
      setCourses(c);
      setSemesters(s);
      setSubjects(sub);
      setSessions(sess);

      setForm((prev) => ({
        ...prev,
        departmentId: d[0]?.id || '',
        courseId: c[0]?.id || '',
        semesterId: s[0]?.id || '',
        subjectId: sub[0]?.id || '',
        academicSessionId: sess.find((item) => item.isCurrent)?.id || sess[0]?.id || '',
      }));
      setLoadingMetadata(false);
    });
  }, []);

  const handleNext = () => {
    // Validation per step
    if (activeStep === 0) {
      if (!form.title.trim() || !form.examinationCode.trim() || !form.subjectId) {
        showError('Please specify title, code, and subject.');
        return;
      }
    } else if (activeStep === 1) {
      if (form.durationMinutes <= 0 || form.totalMarks <= 0 || form.passingMarks <= 0) {
        showError('Duration, total marks, and passing marks must be positive numbers.');
        return;
      }
      if (form.passingMarks > form.totalMarks) {
        showError('Passing marks cannot exceed total examination marks.');
        return;
      }
    }
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleFinalSubmit = async () => {
    setSubmitting(true);
    try {
      const startWindow = `${form.examDate}T${form.startTime}:00Z`;
      const endWindow = `${form.examDate}T${form.endTime}:00Z`;

      const payload = {
        title: form.title.trim(),
        examinationCode: form.examinationCode.trim().toUpperCase(),
        description: form.description.trim(),
        departmentId: form.departmentId,
        courseId: form.courseId,
        semesterId: form.semesterId,
        subjectId: form.subjectId,
        academicSessionId: form.academicSessionId,
        examinationType: form.examinationType,
        startWindow,
        endWindow,
        durationMinutes: Number(form.durationMinutes),
        totalMarks: Number(form.totalMarks),
        passingMarks: Number(form.passingMarks),
        maxAttempts: Number(form.maxAttempts),
        negativeMarkingType: form.negativeMarkingType,
        negativeMarkingValue: Number(form.negativeMarkingValue),
        allowNegativeMarksBelowZero: form.allowNegativeMarksBelowZero,
        randomizeQuestions: form.randomizeQuestions,
        randomizeOptions: form.randomizeOptions,
        instructions: form.instructions,
      };

      const created = await examinationsService.createExamination(payload);
      showSuccess(`Examination [${created.examinationCode}] created with Authoritative UUID!`);
      setConfirmOpen(false);
      navigate(`/faculty/examinations/${created.id}/questions`);
    } catch (err: unknown) {
      showError(extractErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingMetadata) {
    return <LoadingSpinner message="Preparing examination creation wizard..." />;
  }

  return (
    <Box sx={{ pb: 6 }}>
      <SEO title="Create Examination" isPrivate />

      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/faculty/examinations')}
          sx={{ mb: 1, color: 'text.secondary' }}
        >
          Back to Examinations
        </Button>
        <Typography variant="h4" sx={{ fontWeight: 800, color: BRANDING.colors.primary, mb: 0.5 }}>
          Create Examination
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Configure institutional exam parameters, duration, scoring rubrics, and negative penalties
        </Typography>
      </Box>

      {/* Stepper */}
      <Card sx={{ p: 3, mb: 4 }}>
        <Stepper activeStep={activeStep} alternativeLabel>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Card>

      {/* Form Content */}
      <Card sx={{ p: { xs: 2.5, sm: 4 } }}>
        <CardContent sx={{ p: 0 }}>
          {/* STEP 0: Basic Information */}
          {activeStep === 0 && (
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
                Section 1: Academic Scope & Identity
              </Typography>

              <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                  <TextField
                    label="Examination Title"
                    fullWidth
                    required
                    placeholder="e.g. Data Structures and Algorithms Midterm 2026"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <TextField
                    label="Examination Code"
                    fullWidth
                    required
                    placeholder="e.g. CS301-MID-2026"
                    value={form.examinationCode}
                    onChange={(e) => setForm({ ...form, examinationCode: e.target.value.toUpperCase() })}
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <FormControl fullWidth required>
                    <InputLabel>Department</InputLabel>
                    <Select
                      value={form.departmentId}
                      label="Department"
                      onChange={(e) => setForm({ ...form, departmentId: e.target.value })}
                    >
                      {departments.map((d) => (
                        <MenuItem key={d.id} value={d.id}>
                          {d.name} ({d.code})
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={4}>
                  <FormControl fullWidth required>
                    <InputLabel>Degree Programme</InputLabel>
                    <Select
                      value={form.courseId}
                      label="Degree Programme"
                      onChange={(e) => setForm({ ...form, courseId: e.target.value })}
                    >
                      {courses.map((c) => (
                        <MenuItem key={c.id} value={c.id}>
                          {c.name} ({c.code})
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={4}>
                  <FormControl fullWidth required>
                    <InputLabel>Semester</InputLabel>
                    <Select
                      value={form.semesterId}
                      label="Semester"
                      onChange={(e) => setForm({ ...form, semesterId: e.target.value })}
                    >
                      {semesters.map((s) => (
                        <MenuItem key={s.id} value={s.id}>
                          {s.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={6}>
                  <FormControl fullWidth required>
                    <InputLabel>Subject</InputLabel>
                    <Select
                      value={form.subjectId}
                      label="Subject"
                      onChange={(e) => setForm({ ...form, subjectId: e.target.value })}
                    >
                      {subjects.map((sub) => (
                        <MenuItem key={sub.id} value={sub.id}>
                          {sub.name} ({sub.code})
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={6}>
                  <FormControl fullWidth required>
                    <InputLabel>Academic Session</InputLabel>
                    <Select
                      value={form.academicSessionId}
                      label="Academic Session"
                      onChange={(e) => setForm({ ...form, academicSessionId: e.target.value })}
                    >
                      {sessions.map((sess) => (
                        <MenuItem key={sess.id} value={sess.id}>
                          {sess.name} {sess.isCurrent && '(Active)'}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    label="Examination Description (Optional)"
                    fullWidth
                    multiline
                    rows={2}
                    placeholder="Enter examination coverage or topics..."
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                  />
                </Grid>
              </Grid>
            </Box>
          )}

          {/* STEP 1: Schedule & Timing */}
          {activeStep === 1 && (
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
                Section 2: Examination Format, Duration & Window
              </Typography>

              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth required>
                    <InputLabel>Examination Type</InputLabel>
                    <Select
                      value={form.examinationType}
                      label="Examination Type"
                      onChange={(e) =>
                        setForm({ ...form, examinationType: e.target.value as ExaminationType })
                      }
                    >
                      <MenuItem value={ExaminationType.MCQ}>Multiple Choice Questions (MCQ Only)</MenuItem>
                      <MenuItem value={ExaminationType.DESCRIPTIVE}>Subjective / Descriptive Only</MenuItem>
                      <MenuItem value={ExaminationType.MIXED}>Mixed Assessment (MCQ & Descriptive)</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    label="Test Date"
                    type="date"
                    fullWidth
                    required
                    InputLabelProps={{ shrink: true }}
                    value={form.examDate}
                    onChange={(e) => setForm({ ...form, examDate: e.target.value })}
                  />
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    label="Start Time Window"
                    type="time"
                    fullWidth
                    required
                    InputLabelProps={{ shrink: true }}
                    value={form.startTime}
                    onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                  />
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    label="End Time Window"
                    type="time"
                    fullWidth
                    required
                    InputLabelProps={{ shrink: true }}
                    value={form.endTime}
                    onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                  />
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    label="Duration (Minutes)"
                    type="number"
                    fullWidth
                    required
                    value={form.durationMinutes}
                    onChange={(e) => setForm({ ...form, durationMinutes: Number(e.target.value) })}
                  />
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    label="Max Attempts per Student"
                    type="number"
                    fullWidth
                    required
                    value={form.maxAttempts}
                    onChange={(e) => setForm({ ...form, maxAttempts: Number(e.target.value) })}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Total Marks"
                    type="number"
                    fullWidth
                    required
                    value={form.totalMarks}
                    onChange={(e) => setForm({ ...form, totalMarks: Number(e.target.value) })}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Passing Marks"
                    type="number"
                    fullWidth
                    required
                    value={form.passingMarks}
                    onChange={(e) => setForm({ ...form, passingMarks: Number(e.target.value) })}
                  />
                </Grid>
              </Grid>
            </Box>
          )}

          {/* STEP 2: Marking Engine & Anti-Cheat */}
          {activeStep === 2 && (
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
                Section 3: Scoring Engine, Negative Marking & Proctoring
              </Typography>

              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth required>
                    <InputLabel>Negative Marking Configuration</InputLabel>
                    <Select
                      value={form.negativeMarkingType}
                      label="Negative Marking Configuration"
                      onChange={(e) =>
                        setForm({ ...form, negativeMarkingType: e.target.value as NegativeMarkingType })
                      }
                    >
                      <MenuItem value={NegativeMarkingType.NONE}>No Negative Marking (0 Deduction)</MenuItem>
                      <MenuItem value={NegativeMarkingType.FIXED}>Fixed Penalty (e.g. -0.25, -0.5)</MenuItem>
                      <MenuItem value={NegativeMarkingType.FRACTION}>Fraction of Question Marks (e.g. 1/4)</MenuItem>
                      <MenuItem value={NegativeMarkingType.CUSTOM}>Custom Per-Question Penalty</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    label="Negative Mark Value / Ratio"
                    type="number"
                    fullWidth
                    disabled={form.negativeMarkingType === NegativeMarkingType.NONE}
                    inputProps={{ step: '0.05' }}
                    value={form.negativeMarkingValue}
                    onChange={(e) => setForm({ ...form, negativeMarkingValue: Number(e.target.value) })}
                    helperText={
                      form.negativeMarkingType === NegativeMarkingType.FRACTION
                        ? 'e.g. 0.25 represents 1/4th deduction of question marks'
                        : 'Exact points deducted for every wrong response'
                    }
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={form.allowNegativeMarksBelowZero}
                        onChange={(e) => setForm({ ...form, allowNegativeMarksBelowZero: e.target.checked })}
                      />
                    }
                    label="Allow Net Score Below Zero (Negative Final Score)"
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={form.randomizeQuestions}
                        onChange={(e) => setForm({ ...form, randomizeQuestions: e.target.checked })}
                      />
                    }
                    label="Randomize Question Order for Each Student"
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={form.randomizeOptions}
                        onChange={(e) => setForm({ ...form, randomizeOptions: e.target.checked })}
                      />
                    }
                    label="Shuffle MCQ Options (A, B, C, D) Randomly"
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    label="Examination Instructions for Students"
                    fullWidth
                    multiline
                    rows={4}
                    value={form.instructions}
                    onChange={(e) => setForm({ ...form, instructions: e.target.value })}
                  />
                </Grid>
              </Grid>
            </Box>
          )}

          {/* STEP 3: Review & Authorize */}
          {activeStep === 3 && (
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
                Section 4: Summary Review
              </Typography>

              <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
                Please review examination parameters before creation. Upon creation, an authoritative Test
                UUID will be minted in PostgreSQL, and you will proceed to author or import questions.
              </Alert>

              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>Examination Title</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 700 }}>{form.title}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>Examination Code</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 700 }}>{form.examinationCode}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>Assessment Type</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>{form.examinationType}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>Duration & Window</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {form.durationMinutes} Minutes ({form.examDate} {form.startTime} - {form.endTime})
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>Total Marks / Passing</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {form.totalMarks} Marks (Passing: {form.passingMarks})
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>Negative Marking</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {form.negativeMarkingType} ({form.negativeMarkingValue})
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          )}

          {/* Bottom Actions */}
          <Divider sx={{ my: 4 }} />
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Button disabled={activeStep === 0} onClick={handleBack} startIcon={<ArrowBackIcon />}>
              Back
            </Button>
            {activeStep < steps.length - 1 ? (
              <Button variant="contained" onClick={handleNext} endIcon={<ArrowForwardIcon />}>
                Continue
              </Button>
            ) : (
              <Button
                variant="contained"
                color="primary"
                startIcon={<CheckCircleIcon />}
                onClick={() => setConfirmOpen(true)}
              >
                Create Examination Paper
              </Button>
            )}
          </Box>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Confirm Examination Creation</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            Create examination <strong>{form.title}</strong>? You can immediately add questions or import
            them from DOCX or XLSX.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setConfirmOpen(false)}>Review</Button>
          <Button variant="contained" color="primary" onClick={handleFinalSubmit} disabled={submitting}>
            {submitting ? 'Generating Authoritative UUID...' : 'Confirm Creation'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
