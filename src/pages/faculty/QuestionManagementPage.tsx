import React, { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Radio,
  RadioGroup,
  Select,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import { useNavigate, useParams } from 'react-router-dom';
import { SEO } from '../../components/common/SEO';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { questionsService } from '../../services/questions.service';
import { examinationsService } from '../../services/examinations.service';
import { useNotification } from '../../context/NotificationContext';
import { extractErrorMessage } from '../../services/api';
import { DifficultyLevel, Examination, Question, QuestionType } from '../../types';
import { BRANDING } from '../../config/env';

export const QuestionManagementPage: React.FC = () => {
  const { testId } = useParams<{ testId: string }>();
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotification();

  const [examination, setExamination] = useState<Examination | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  // Dialog state
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [questionType, setQuestionType] = useState<QuestionType>(QuestionType.MCQ);
  const [dialogLoading, setDialogLoading] = useState(false);

  // Form
  const [questionText, setQuestionText] = useState('');
  const [marks, setMarks] = useState(2);
  const [negativeMarks, setNegativeMarks] = useState(0.5);
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState<DifficultyLevel>(DifficultyLevel.MEDIUM);

  // Options for MCQ
  const [options, setOptions] = useState([
    { label: 'A', text: '', isCorrect: true },
    { label: 'B', text: '', isCorrect: false },
    { label: 'C', text: '', isCorrect: false },
    { label: 'D', text: '', isCorrect: false },
  ]);

  // Descriptive specifics
  const [instructions, setInstructions] = useState('');
  const [evaluationCriteria, setEvaluationCriteria] = useState('');
  const [expectedAnswer, setExpectedAnswer] = useState('');

  // Paper Preview Dialog
  const [previewOpen, setPreviewOpen] = useState(false);

  const loadData = async () => {
    if (!testId) return;
    setLoading(true);
    try {
      const [exam, qData] = await Promise.all([
        examinationsService.getExaminationById(testId),
        questionsService.getQuestions({ testId, limit: 100 }),
      ]);
      setExamination(exam);
      setQuestions(qData.items);
    } catch (err: unknown) {
      showError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [testId]);

  const handleCorrectOptionChange = (selectedLabel: string) => {
    setOptions((prev) =>
      prev.map((opt) => ({
        ...opt,
        isCorrect: opt.label === selectedLabel,
      })),
    );
  };

  const handleOptionTextChange = (label: string, text: string) => {
    setOptions((prev) =>
      prev.map((opt) => (opt.label === label ? { ...opt, text } : opt)),
    );
  };

  const handleCreateQuestion = async () => {
    if (!testId) return;
    if (!questionText.trim()) {
      showError('Question text is required.');
      return;
    }

    if (questionType === QuestionType.MCQ) {
      const emptyOpt = options.find((o) => !o.text.trim());
      if (emptyOpt) {
        showError(`Please enter text for Option ${emptyOpt.label}.`);
        return;
      }
    }

    setDialogLoading(true);
    try {
      const payload: any = {
        testId,
        questionText: questionText.trim(),
        questionType,
        marks: Number(marks),
        negativeMarks: Number(negativeMarks),
        topic: topic.trim() || undefined,
        difficulty,
        questionOrder: questions.length + 1,
      };

      if (questionType === QuestionType.MCQ) {
        payload.options = options.map((opt, idx) => ({
          label: opt.label,
          text: opt.text.trim(),
          isCorrect: opt.isCorrect,
          order: idx + 1,
        }));
      } else {
        payload.answerInstructions = instructions.trim() || undefined;
        payload.evaluationCriteria = evaluationCriteria.trim() || undefined;
        payload.expectedAnswer = expectedAnswer.trim() || undefined;
      }

      await questionsService.createQuestion(payload);
      showSuccess('Question added to examination paper successfully!');
      setAddDialogOpen(false);
      resetForm();
      loadData();
    } catch (err: unknown) {
      showError(extractErrorMessage(err));
    } finally {
      setDialogLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await questionsService.deleteQuestion(id);
      showSuccess('Question deleted.');
      loadData();
    } catch (err: unknown) {
      showError(extractErrorMessage(err));
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      await questionsService.duplicateQuestion(id);
      showSuccess('Question duplicated successfully!');
      loadData();
    } catch (err: unknown) {
      showError(extractErrorMessage(err));
    }
  };

  const resetForm = () => {
    setQuestionText('');
    setMarks(2);
    setNegativeMarks(0.5);
    setTopic('');
    setDifficulty(DifficultyLevel.MEDIUM);
    setOptions([
      { label: 'A', text: '', isCorrect: true },
      { label: 'B', text: '', isCorrect: false },
      { label: 'C', text: '', isCorrect: false },
      { label: 'D', text: '', isCorrect: false },
    ]);
    setInstructions('');
    setEvaluationCriteria('');
    setExpectedAnswer('');
  };

  const totalCalculatedMarks = questions.reduce((sum, q) => sum + Number(q.marks || 0), 0);

  if (loading) {
    return <LoadingSpinner message="Loading question bank for examination..." />;
  }

  return (
    <Box sx={{ pb: 6 }}>
      <SEO title="Question Paper Authoring & Management" isPrivate />

      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/faculty/examinations')}
          sx={{ mb: 1, color: 'text.secondary' }}
        >
          Back to Examinations
        </Button>
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', md: 'center' },
            gap: 2,
          }}
        >
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800, color: BRANDING.colors.primary, mb: 0.5 }}>
              {examination?.title}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Test Code: <strong>{examination?.examinationCode}</strong> • UUID: {examination?.id}
            </Typography>
          </Box>

          <Stack direction="row" spacing={1.5}>
            <Button
              variant="outlined"
              startIcon={<VisibilityIcon />}
              onClick={() => setPreviewOpen(true)}
              disabled={questions.length === 0}
            >
              Preview Paper
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              startIcon={<UploadFileIcon />}
              onClick={() => navigate(`/faculty/import?testId=${testId}`)}
            >
              Import DOCX / XLSX
            </Button>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => {
                resetForm();
                setAddDialogOpen(true);
              }}
            >
              Add Question
            </Button>
          </Stack>
        </Box>
      </Box>

      {/* Stats Summary Bar */}
      <Card sx={{ p: 2.5, mb: 4, bgcolor: '#FAFBFD' }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={6} sm={3}>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>Total Questions</Typography>
            <Typography variant="h5" sx={{ fontWeight: 800, color: BRANDING.colors.primary }}>
              {questions.length}
            </Typography>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>Allocated Marks</Typography>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 800,
                color:
                  totalCalculatedMarks === examination?.totalMarks ? '#16A34A' : '#D97706',
              }}
            >
              {totalCalculatedMarks} / {examination?.totalMarks} Marks
            </Typography>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>Assessment Format</Typography>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              {examination?.examinationType}
            </Typography>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>Duration</Typography>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              {examination?.durationMinutes} Mins
            </Typography>
          </Grid>
        </Grid>
      </Card>

      {/* Questions List */}
      {questions.length === 0 ? (
        <EmptyState
          title="No questions created yet"
          description="Build this examination by adding MCQ or Descriptive questions manually or importing a Word (.docx) or Excel (.xlsx) question paper."
          actionText="Add First Question"
          onAction={() => {
            resetForm();
            setAddDialogOpen(true);
          }}
        />
      ) : (
        <Stack spacing={2.5}>
          {questions.map((q, idx) => (
            <Card key={q.id} sx={{ p: 2.5, border: `1px solid ${BRANDING.colors.border}` }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Chip
                    label={`Q${idx + 1}`}
                    size="small"
                    sx={{ fontWeight: 800, bgcolor: BRANDING.colors.primary, color: '#FFFFFF' }}
                  />
                  <Chip
                    label={q.questionType}
                    size="small"
                    sx={{
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      bgcolor: q.questionType === QuestionType.MCQ ? '#E0F2FE' : '#EDE9FE',
                    }}
                  />
                  <Chip
                    label={q.difficulty}
                    size="small"
                    variant="outlined"
                    sx={{ fontSize: '0.65rem' }}
                  />
                  {q.topic && (
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                      Topic: {q.topic}
                    </Typography>
                  )}
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Chip
                    label={`+${q.marks} / -${q.negativeMarks}`}
                    size="small"
                    color="primary"
                    sx={{ fontWeight: 700 }}
                  />
                  <Tooltip title="Duplicate">
                    <IconButton size="small" onClick={() => handleDuplicate(q.id)}>
                      <ContentCopyIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton size="small" color="error" onClick={() => handleDelete(q.id)}>
                      <DeleteOutlineIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>

              {/* Question Text */}
              <Typography variant="body1" sx={{ fontWeight: 600, mb: 2, whiteSpace: 'pre-wrap' }}>
                {q.questionText}
              </Typography>

              {/* Options if MCQ */}
              {q.questionType === QuestionType.MCQ && q.options && (
                <Grid container spacing={1.5} sx={{ pl: 1 }}>
                  {q.options.map((opt) => (
                    <Grid item xs={12} sm={6} key={opt.id}>
                      <Box
                        sx={{
                          p: 1.2,
                          borderRadius: 1.5,
                          border: opt.isCorrect ? '2px solid #16A34A' : `1px solid ${BRANDING.colors.border}`,
                          bgcolor: opt.isCorrect ? '#DCFCE7' : '#FAFBFD',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}
                      >
                        <Typography variant="body2">
                          <strong>{opt.optionLabel}.</strong> {opt.optionText}
                        </Typography>
                        {opt.isCorrect && (
                          <Chip
                            label="Correct"
                            size="small"
                            sx={{ height: 20, fontSize: '0.65rem', bgcolor: '#16A34A', color: '#FFFFFF', fontWeight: 700 }}
                          />
                        )}
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              )}

              {/* Descriptive details */}
              {q.questionType === QuestionType.DESCRIPTIVE && (
                <Box sx={{ p: 2, bgcolor: '#F8FAFC', borderRadius: 2, mt: 1 }}>
                  {q.evaluationCriteria && (
                    <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary' }}>
                      <strong>Evaluation Rubric:</strong> {q.evaluationCriteria}
                    </Typography>
                  )}
                  {q.expectedAnswer && (
                    <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary', mt: 0.5 }}>
                      <strong>Key Criteria:</strong> {q.expectedAnswer}
                    </Typography>
                  )}
                </Box>
              )}
            </Card>
          ))}
        </Stack>
      )}

      {/* Add Question Dialog */}
      <Dialog open={addDialogOpen} onClose={() => setAddDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Add Question to Examination</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <FormControl fullWidth size="small">
                  <InputLabel>Question Type</InputLabel>
                  <Select
                    value={questionType}
                    label="Question Type"
                    onChange={(e) => setQuestionType(e.target.value as QuestionType)}
                  >
                    <MenuItem value={QuestionType.MCQ}>Multiple Choice Question (MCQ)</MenuItem>
                    <MenuItem value={QuestionType.DESCRIPTIVE}>Subjective / Descriptive</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <FormControl fullWidth size="small">
                  <InputLabel>Difficulty</InputLabel>
                  <Select
                    value={difficulty}
                    label="Difficulty"
                    onChange={(e) => setDifficulty(e.target.value as DifficultyLevel)}
                  >
                    <MenuItem value={DifficultyLevel.EASY}>Easy</MenuItem>
                    <MenuItem value={DifficultyLevel.MEDIUM}>Medium</MenuItem>
                    <MenuItem value={DifficultyLevel.HARD}>Hard</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={4}>
                <TextField
                  label="Marks"
                  type="number"
                  fullWidth
                  size="small"
                  value={marks}
                  onChange={(e) => setMarks(Number(e.target.value))}
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  label="Negative Marks"
                  type="number"
                  fullWidth
                  size="small"
                  value={negativeMarks}
                  onChange={(e) => setNegativeMarks(Number(e.target.value))}
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  label="Topic / Unit (Optional)"
                  fullWidth
                  size="small"
                  placeholder="e.g. Dynamic Programming"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                />
              </Grid>
            </Grid>

            {/* Question Text */}
            <TextField
              label="Question Prompt"
              fullWidth
              multiline
              rows={3}
              required
              placeholder="Enter full question text (supports Unicode, symbols, and formatting)..."
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
            />

            {/* MCQ Options with Radio Button to choose correct one */}
            {questionType === QuestionType.MCQ && (
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>
                  Answer Choices (Select the radio button next to the correct answer):
                </Typography>
                <Stack spacing={1.5}>
                  {options.map((opt) => (
                    <Box key={opt.label} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Radio
                        checked={opt.isCorrect}
                        onChange={() => handleCorrectOptionChange(opt.label)}
                        value={opt.label}
                        name="correct-option-radio"
                      />
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, minWidth: 24 }}>
                        {opt.label}.
                      </Typography>
                      <TextField
                        fullWidth
                        size="small"
                        placeholder={`Option ${opt.label} description`}
                        value={opt.text}
                        onChange={(e) => handleOptionTextChange(opt.label, e.target.value)}
                      />
                    </Box>
                  ))}
                </Stack>
              </Box>
            )}

            {/* Descriptive Extra Fields */}
            {questionType === QuestionType.DESCRIPTIVE && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  label="Evaluation Criteria / Rubric"
                  fullWidth
                  multiline
                  rows={2}
                  placeholder="Outline key concepts, derivations, or algorithms required..."
                  value={evaluationCriteria}
                  onChange={(e) => setEvaluationCriteria(e.target.value)}
                />
                <TextField
                  label="Expected Model Answer / Keywords"
                  fullWidth
                  multiline
                  rows={2}
                  placeholder="Model solution visible only to faculty evaluator during manual grading..."
                  value={expectedAnswer}
                  onChange={(e) => setExpectedAnswer(e.target.value)}
                />
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setAddDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreateQuestion} disabled={dialogLoading}>
            {dialogLoading ? 'Saving...' : 'Add to Examination'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Paper Preview Dialog */}
      <Dialog open={previewOpen} onClose={() => setPreviewOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>Formal Paper Preview</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ p: 2, bgcolor: '#FAFBFD', borderRadius: 2, mb: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: 800, color: BRANDING.colors.primary, textAlign: 'center' }}>
              {BRANDING.organization}
            </Typography>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, textAlign: 'center' }}>
              {examination?.title} ({examination?.examinationCode})
            </Typography>
            <Typography variant="body2" sx={{ textAlign: 'center', color: 'text.secondary' }}>
              Duration: {examination?.durationMinutes} Mins • Total Marks: {examination?.totalMarks} • Pass: {examination?.passingMarks}
            </Typography>
          </Box>

          <Stack spacing={3}>
            {questions.map((q, idx) => (
              <Box key={q.id}>
                <Typography variant="body1" sx={{ fontWeight: 700 }}>
                  Q{idx + 1}. {q.questionText} [{q.marks} Marks]
                </Typography>
                {q.options && (
                  <Grid container spacing={1} sx={{ mt: 0.5, pl: 2 }}>
                    {q.options.map((opt) => (
                      <Grid item xs={6} key={opt.id}>
                        <Typography variant="body2">
                          ({opt.optionLabel}) {opt.optionText}
                        </Typography>
                      </Grid>
                    ))}
                  </Grid>
                )}
                <Divider sx={{ mt: 2 }} />
              </Box>
            ))}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button variant="contained" onClick={() => setPreviewOpen(false)}>
            Close Preview
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
