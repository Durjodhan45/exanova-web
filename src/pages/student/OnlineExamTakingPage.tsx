import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  Alert,
  AppBar,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  Grid,
  IconButton,
  Paper,
  Radio,
  RadioGroup,
  Stack,
  TextField,
  Toolbar,
  Tooltip,
  Typography,
} from '@mui/material';
import TimerOutlinedIcon from '@mui/icons-material/TimerOutlined';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import SendIcon from '@mui/icons-material/Send';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ClearIcon from '@mui/icons-material/Clear';
import CloudDoneIcon from '@mui/icons-material/CloudDone';
import SyncIcon from '@mui/icons-material/Sync';
import { useNavigate, useParams } from 'react-router-dom';
import { SEO } from '../../components/common/SEO';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { examAttemptsService } from '../../services/exam-attempts.service';
import { useNotification } from '../../context/NotificationContext';
import { extractErrorMessage } from '../../services/api';
import { AttemptQuestion, ExamAttempt, Examination, QuestionAttemptStatus } from '../../types';
import { BRANDING } from '../../config/env';

export const OnlineExamTakingPage: React.FC = () => {
  const { testId } = useParams<{ testId: string }>();
  const navigate = useNavigate();
  const { showSuccess, showError, showWarning } = useNotification();

  // Pre-Exam State
  const [examStarted, setExamStarted] = useState(false);
  const [instructionsData, setInstructionsData] = useState<{
    examination: Examination;
    eligible: boolean;
    reason?: string;
    existingAttempt?: ExamAttempt;
  } | null>(null);
  const [agreed, setAgreed] = useState(false);
  const [loadingInstructions, setLoadingInstructions] = useState(true);

  // Active Exam Taking State
  const [attempt, setAttempt] = useState<ExamAttempt | null>(null);
  const [questions, setQuestions] = useState<AttemptQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [savingAnswer, setSavingAnswer] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState<string>('All changes saved');

  // Submit Modal
  const [submitConfirmOpen, setSubmitConfirmOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  // Proctor alert modal
  const [proctorAlertOpen, setProctorAlertOpen] = useState(false);
  const tabSwitchCountRef = useRef(0);

  // Local answer cache: { [questionId]: { selectedOptionId?: string, descriptiveText?: string, status: string } }
  const [answersCache, setAnswersCache] = useState<
    Record<string, { selectedOptionId?: string; descriptiveText?: string; status: QuestionAttemptStatus }>
  >({});

  // 1. Fetch instructions on mount
  useEffect(() => {
    if (!testId) return;
    examAttemptsService
      .getInstructions(testId)
      .then((data) => {
        setInstructionsData(data);
        // If an in-progress attempt already exists, resume it immediately!
        if (data.existingAttempt && data.existingAttempt.status === 'IN_PROGRESS') {
          resumeAttempt(data.existingAttempt);
        }
      })
      .catch((err) => {
        showError(extractErrorMessage(err));
      })
      .finally(() => setLoadingInstructions(false));
  }, [testId]);

  // 2. Start Exam Attempt
  const handleStartExam = async () => {
    if (!testId) return;
    if (!agreed) {
      showError('You must confirm that you have read and agreed to all examination instructions.');
      return;
    }

    setLoadingInstructions(true);
    try {
      const newAttempt = await examAttemptsService.startExam(testId);
      resumeAttempt(newAttempt);
    } catch (err: unknown) {
      showError(extractErrorMessage(err));
      setLoadingInstructions(false);
    }
  };

  // 3. Resume / Initialize active attempt
  const resumeAttempt = async (activeAttempt: ExamAttempt) => {
    try {
      const qList = await examAttemptsService.getAttemptQuestions(activeAttempt.id);
      setAttempt(activeAttempt);
      setQuestions(qList);
      setRemainingSeconds(activeAttempt.remainingSeconds);

      // Pre-populate answers cache from backend
      const cache: Record<string, any> = {};
      qList.forEach((q) => {
        cache[q.questionId] = {
          selectedOptionId: q.studentAnswer?.selectedOptionId || '',
          descriptiveText: q.studentAnswer?.descriptiveAnswerText || '',
          status: q.status || 'NOT_VISITED',
        };
      });
      setAnswersCache(cache);
      setExamStarted(true);
    } catch (err: unknown) {
      showError(extractErrorMessage(err));
    } finally {
      setLoadingInstructions(false);
    }
  };

  // 4. Authoritative visual countdown timer
  useEffect(() => {
    if (!examStarted || remainingSeconds <= 0 || submittedSuccess) return;

    const timer = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // Auto-submit when time expires!
          handleAutoSubmitOnExpiry();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [examStarted, remainingSeconds, submittedSuccess]);

  // 5. Periodic status synchronization with server
  useEffect(() => {
    if (!examStarted || !attempt || submittedSuccess) return;

    const syncInterval = setInterval(() => {
      examAttemptsService
        .getAttemptStatus(attempt.id)
        .then((stat) => {
          if (stat.isExpired) {
            handleAutoSubmitOnExpiry();
          } else if (stat.remainingSeconds) {
            // Keep frontend clock strictly aligned with server authoritative timer
            setRemainingSeconds(stat.remainingSeconds);
          }
        })
        .catch(() => {});
    }, 30000); // sync every 30 seconds

    return () => clearInterval(syncInterval);
  }, [examStarted, attempt, submittedSuccess]);

  // 6. Anti-cheat proctoring & navigation protection
  useEffect(() => {
    if (!examStarted || submittedSuccess) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        tabSwitchCountRef.current += 1;
        setProctorAlertOpen(true);
      }
    };

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = 'You have an active examination in progress. Are you sure you want to leave?';
      return e.returnValue;
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [examStarted, submittedSuccess]);

  // Current question helper
  const currentQ = questions[currentIndex];
  const currentAnswer = currentQ ? answersCache[currentQ.questionId] : undefined;

  // 7. Save answer function (MCQ or Descriptive)
  const saveCurrentAnswerToBackend = useCallback(
    async (
      qId: string,
      selectedOptionId?: string,
      descriptiveText?: string,
      newStatus?: QuestionAttemptStatus,
    ) => {
      if (!attempt) return;
      setSavingAnswer(true);

      const statusToSave =
        newStatus ||
        (selectedOptionId || (descriptiveText && descriptiveText.trim().length > 0)
          ? 'ANSWERED'
          : 'UNANSWERED');

      try {
        const res = await examAttemptsService.saveAnswer(attempt.id, qId, {
          selectedOptionId: selectedOptionId || undefined,
          descriptiveAnswerText: descriptiveText || undefined,
          status: statusToSave,
        });

        // Update local questions state
        setQuestions((prev) =>
          prev.map((q) =>
            q.questionId === qId
              ? {
                  ...q,
                  status: statusToSave,
                  studentAnswer: {
                    ...q.studentAnswer,
                    isAnswered: Boolean(selectedOptionId || descriptiveText),
                    selectedOptionId,
                    descriptiveAnswerText: descriptiveText,
                  },
                }
              : q,
          ),
        );

        setLastSavedTime(`Saved at ${new Date().toLocaleTimeString()}`);
        if (res && res.remainingSeconds) {
          setRemainingSeconds(res.remainingSeconds);
        }
      } catch {
        // Ignored
      } finally {
        setSavingAnswer(false);
      }
    },
    [attempt],
  );

  // Handle MCQ option selection
  const handleSelectOption = (optionId: string) => {
    if (!currentQ) return;
    const qId = currentQ.questionId;
    const isMarked = currentAnswer?.status === 'MARKED_FOR_REVIEW' || currentAnswer?.status === 'ANSWERED_AND_MARKED_FOR_REVIEW';
    const status: QuestionAttemptStatus = isMarked ? 'ANSWERED_AND_MARKED_FOR_REVIEW' : 'ANSWERED';

    setAnswersCache((prev) => ({
      ...prev,
      [qId]: {
        ...prev[qId],
        selectedOptionId: optionId,
        status,
      },
    }));

    saveCurrentAnswerToBackend(qId, optionId, currentAnswer?.descriptiveText, status);
  };

  // Handle Descriptive answer input
  const handleDescriptiveChange = (text: string) => {
    if (!currentQ) return;
    const qId = currentQ.questionId;
    const hasText = text.trim().length > 0;
    const isMarked = currentAnswer?.status === 'MARKED_FOR_REVIEW' || currentAnswer?.status === 'ANSWERED_AND_MARKED_FOR_REVIEW';
    const status: QuestionAttemptStatus = hasText
      ? isMarked
        ? 'ANSWERED_AND_MARKED_FOR_REVIEW'
        : 'ANSWERED'
      : isMarked
      ? 'MARKED_FOR_REVIEW'
      : 'UNANSWERED';

    setAnswersCache((prev) => ({
      ...prev,
      [qId]: {
        ...prev[qId],
        descriptiveText: text,
        status,
      },
    }));
  };

  // Blur on descriptive text field triggers save
  const handleDescriptiveBlur = () => {
    if (!currentQ) return;
    const qId = currentQ.questionId;
    const text = answersCache[qId]?.descriptiveText || '';
    saveCurrentAnswerToBackend(qId, undefined, text, answersCache[qId]?.status);
  };

  // Mark for review toggle
  const handleToggleMarkForReview = () => {
    if (!currentQ) return;
    const qId = currentQ.questionId;
    const isCurrentlyMarked =
      currentAnswer?.status === 'MARKED_FOR_REVIEW' ||
      currentAnswer?.status === 'ANSWERED_AND_MARKED_FOR_REVIEW';

    const hasAnswer =
      currentAnswer?.selectedOptionId || (currentAnswer?.descriptiveText && currentAnswer.descriptiveText.trim().length > 0);

    const newStatus: QuestionAttemptStatus = isCurrentlyMarked
      ? hasAnswer
        ? 'ANSWERED'
        : 'UNANSWERED'
      : hasAnswer
      ? 'ANSWERED_AND_MARKED_FOR_REVIEW'
      : 'MARKED_FOR_REVIEW';

    setAnswersCache((prev) => ({
      ...prev,
      [qId]: {
        ...prev[qId],
        status: newStatus,
      },
    }));

    saveCurrentAnswerToBackend(
      qId,
      currentAnswer?.selectedOptionId,
      currentAnswer?.descriptiveText,
      newStatus,
    );
  };

  // Clear response
  const handleClearResponse = () => {
    if (!currentQ) return;
    const qId = currentQ.questionId;
    setAnswersCache((prev) => ({
      ...prev,
      [qId]: {
        selectedOptionId: '',
        descriptiveText: '',
        status: 'UNANSWERED',
      },
    }));
    saveCurrentAnswerToBackend(qId, '', '', 'UNANSWERED');
  };

  // Question navigation
  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  // 8. Submit Examination
  const handleAutoSubmitOnExpiry = async () => {
    if (!attempt || submitting) return;
    setSubmitting(true);
    try {
      await examAttemptsService.submitExam(attempt.id);
      setSubmittedSuccess(true);
      showWarning('Examination timer expired! Your attempt has been automatically submitted.');
    } catch {
      setSubmittedSuccess(true);
    }
  };

  const handleConfirmSubmit = async () => {
    if (!attempt) return;
    setSubmitting(true);
    try {
      await examAttemptsService.submitExam(attempt.id);
      setSubmittedSuccess(true);
      setSubmitConfirmOpen(false);
      showSuccess('Examination submitted successfully!');
    } catch (err: unknown) {
      showError(extractErrorMessage(err));
      setSubmitting(false);
    }
  };

  // Compute status counts for palette and submit dialog
  const answeredCount = questions.filter(
    (q) =>
      answersCache[q.questionId]?.status === 'ANSWERED' ||
      answersCache[q.questionId]?.status === 'ANSWERED_AND_MARKED_FOR_REVIEW',
  ).length;

  const markedCount = questions.filter(
    (q) =>
      answersCache[q.questionId]?.status === 'MARKED_FOR_REVIEW' ||
      answersCache[q.questionId]?.status === 'ANSWERED_AND_MARKED_FOR_REVIEW',
  ).length;

  const unansweredCount = questions.length - answeredCount;

  // Format timer
  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  const timerDisplay = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  const isTimeLow = remainingSeconds > 0 && remainingSeconds <= 300; // < 5 mins

  // RENDER PRE-EXAM SCREEN
  if (!examStarted) {
    if (loadingInstructions) {
      return <LoadingSpinner message="Validating examination enrollment & server tokens..." />;
    }

    const exam = instructionsData?.examination;

    return (
      <Container maxWidth="md" sx={{ py: 6 }}>
        <SEO title="Examination Instructions" isPrivate />

        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/student/examinations')}
          sx={{ mb: 2, color: 'text.secondary' }}
        >
          Back to Available Examinations
        </Button>

        <Card sx={{ p: { xs: 3, md: 4 }, borderRadius: 3, border: `1px solid ${BRANDING.colors.border}` }}>
          <Box sx={{ borderBottom: `1px solid ${BRANDING.colors.border}`, pb: 3, mb: 3 }}>
            <Chip
              label={BRANDING.organization}
              size="small"
              sx={{ fontWeight: 700, bgcolor: '#F1F5F9', mb: 1.5 }}
            />
            <Typography variant="h4" sx={{ fontWeight: 800, color: BRANDING.colors.primary, mb: 1 }}>
              {exam?.title}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Examination Code: <strong>{exam?.examinationCode}</strong> • Subject: {exam?.subject?.name}
            </Typography>
          </Box>

          {/* Exam Specs */}
          <Grid container spacing={2.5} sx={{ mb: 4 }}>
            <Grid item xs={6} sm={3}>
              <Paper sx={{ p: 2, bgcolor: '#FAFBFD', border: `1px solid ${BRANDING.colors.border}` }} elevation={0}>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>Duration</Typography>
                <Typography variant="h6" sx={{ fontWeight: 800, color: BRANDING.colors.primary }}>
                  {exam?.durationMinutes} Mins
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Paper sx={{ p: 2, bgcolor: '#FAFBFD', border: `1px solid ${BRANDING.colors.border}` }} elevation={0}>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>Total Marks</Typography>
                <Typography variant="h6" sx={{ fontWeight: 800, color: BRANDING.colors.primary }}>
                  {exam?.totalMarks} Marks
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Paper sx={{ p: 2, bgcolor: '#FAFBFD', border: `1px solid ${BRANDING.colors.border}` }} elevation={0}>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>Passing Marks</Typography>
                <Typography variant="h6" sx={{ fontWeight: 800, color: BRANDING.colors.primary }}>
                  {exam?.passingMarks} Marks
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Paper sx={{ p: 2, bgcolor: '#FAFBFD', border: `1px solid ${BRANDING.colors.border}` }} elevation={0}>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>Format</Typography>
                <Typography variant="h6" sx={{ fontWeight: 800, color: BRANDING.colors.primary }}>
                  {exam?.examinationType}
                </Typography>
              </Paper>
            </Grid>
          </Grid>

          {/* Negative Marking Policy */}
          <Alert severity="warning" sx={{ mb: 3, borderRadius: 2 }}>
            <strong>Negative Marking Rule: </strong>
            {exam?.negativeMarkingType === 'NONE'
              ? 'No penalty points for incorrect answers.'
              : exam?.negativeMarkingType === 'FIXED'
              ? `Fixed deduction of ${exam?.negativeMarkingValue} marks for each incorrect response.`
              : exam?.negativeMarkingType === 'FRACTION'
              ? `Fractional deduction of ${exam?.negativeMarkingValue}x question marks for each wrong answer.`
              : 'Custom per-question penalty applied as indicated.'}
          </Alert>

          {/* Instructions Body */}
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5 }}>
            Examination Instructions & Candidate Undertaking:
          </Typography>
          <Box
            sx={{
              p: 2.5,
              bgcolor: '#F8FAFC',
              borderRadius: 2,
              border: `1px solid ${BRANDING.colors.border}`,
              mb: 3,
              fontSize: '0.9rem',
              lineHeight: 1.7,
              whiteSpace: 'pre-line',
            }}
          >
            {exam?.instructions ||
              `1. The visual timer is synchronized with the authoritative server clock.\n2. When the remaining time expires, your answers will be automatically submitted.\n3. Switching browser tabs, minimizing the browser window, or navigating away is tracked by anti-cheat telemetry.\n4. Answers are automatically saved after each selection.`}
          </Box>

          <FormControlLabel
            control={
              <Checkbox
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                color="primary"
              />
            }
            label={
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                I confirm that I have read and agree to all rules, anti-cheat conditions, and examination
                guidelines.
              </Typography>
            }
            sx={{ mb: 3 }}
          />

          <Button
            variant="contained"
            color="primary"
            size="large"
            fullWidth
            disabled={!agreed}
            onClick={handleStartExam}
            sx={{ py: 1.6, fontSize: '1.05rem', fontWeight: 800, bgcolor: BRANDING.colors.accent, '&:hover': { bgcolor: '#008F80' } }}
          >
            Start Examination Now
          </Button>
        </Card>
      </Container>
    );
  }

  // RENDER SUBMISSION COMPLETE SCREEN
  if (submittedSuccess) {
    return (
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <SEO title="Examination Submitted" isPrivate />
        <Card sx={{ p: 4, textAlign: 'center', borderRadius: 3, border: `1px solid ${BRANDING.colors.border}` }}>
          <CheckCircleIcon sx={{ fontSize: 72, color: '#16A34A', mb: 2 }} />
          <Typography variant="h4" sx={{ fontWeight: 800, color: BRANDING.colors.primary, mb: 1 }}>
            Examination Submitted!
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary', mb: 3 }}>
            Your responses for <strong>{instructionsData?.examination?.title}</strong> have been recorded
            and encrypted in the examination ledger.
          </Typography>

          <Box sx={{ p: 2, bgcolor: '#FAFBFD', borderRadius: 2, mb: 3 }}>
            <Typography variant="body2">
              Answered Questions: <strong>{answeredCount}</strong> / {questions.length}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.5 }}>
              Timestamp: {new Date().toLocaleString()}
            </Typography>
          </Box>

          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={() => navigate('/student/dashboard')}
            sx={{ py: 1.3, fontWeight: 700 }}
          >
            Return to Student Dashboard
          </Button>
        </Card>
      </Container>
    );
  }

  // RENDER ACTIVE EXAMINATION INTERFACE
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: '#F8FAFC',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1400,
        overflow: 'hidden',
      }}
    >
      <SEO title={`Active Examination | ${instructionsData?.examination?.title}`} isPrivate />

      {/* Top Authoritative Bar */}
      <AppBar
        position="static"
        elevation={0}
        sx={{
          bgcolor: '#0D152F',
          color: '#FFFFFF',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
        }}
      >
        <Toolbar sx={{ minHeight: 64, px: { xs: 2, md: 3 }, justifyContent: 'space-between' }}>
          <Box sx={{ overflow: 'hidden', mr: 2 }}>
            <Typography variant="subtitle1" noWrap sx={{ fontWeight: 800, color: '#FFFFFF' }}>
              {instructionsData?.examination?.title}
            </Typography>
            <Typography variant="caption" sx={{ color: '#94A3B8', display: 'block' }}>
              Code: {instructionsData?.examination?.examinationCode} • Total Marks: {instructionsData?.examination?.totalMarks}
            </Typography>
          </Box>

          {/* Center / Right: Countdown Timer and Autosave Status */}
          <Stack direction="row" spacing={2} alignItems="center">
            {/* Autosave Feedback */}
            <Box sx={{ display: { xs: 'none', sm: 'flex' }, alignItems: 'center', gap: 0.8, color: '#94A3B8' }}>
              {savingAnswer ? (
                <SyncIcon sx={{ fontSize: 16, animation: 'spin 1s linear infinite' }} />
              ) : (
                <CloudDoneIcon sx={{ fontSize: 16, color: '#10B981' }} />
              )}
              <Typography variant="caption" sx={{ fontSize: '0.75rem' }}>
                {savingAnswer ? 'Saving answer...' : lastSavedTime}
              </Typography>
            </Box>

            {/* Visual Timer Badge */}
            <Box
              sx={{
                px: 2,
                py: 0.8,
                borderRadius: 2,
                bgcolor: isTimeLow ? '#EF4444' : 'rgba(255,255,255,0.1)',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                border: isTimeLow ? '1px solid #F87171' : '1px solid rgba(255,255,255,0.2)',
                animation: isTimeLow ? 'pulse 1.5s infinite' : undefined,
              }}
            >
              <TimerOutlinedIcon fontSize="small" />
              <Typography variant="h6" sx={{ fontWeight: 800, fontFamily: 'monospace', letterSpacing: '0.05em' }}>
                {timerDisplay}
              </Typography>
            </Box>

            <Button
              variant="contained"
              color="error"
              size="small"
              startIcon={<SendIcon />}
              onClick={() => setSubmitConfirmOpen(true)}
              sx={{ fontWeight: 700, px: 2 }}
            >
              Finish Exam
            </Button>
          </Stack>
        </Toolbar>
      </AppBar>

      {/* Low Time Warning Bar */}
      {isTimeLow && (
        <Box sx={{ bgcolor: '#FEF3C7', color: '#B45309', py: 0.5, px: 2, textAlign: 'center', fontSize: '0.85rem', fontWeight: 600 }}>
          <WarningAmberIcon sx={{ fontSize: 16, verticalAlign: 'middle', mr: 0.5 }} />
          Warning: Less than 5 minutes remaining! Your examination will auto-submit when the timer expires.
        </Box>
      )}

      {/* Main Examination Taking Workspace */}
      <Box sx={{ flexGrow: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Left Side: Current Question & Answer Area */}
        <Box
          sx={{
            flexGrow: 1,
            p: { xs: 2, sm: 3, md: 4 },
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {currentQ && (
            <Card sx={{ p: { xs: 2.5, md: 4 }, borderRadius: 3, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
              {/* Question Header */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Chip
                    label={`Question ${currentIndex + 1} of ${questions.length}`}
                    size="small"
                    sx={{ fontWeight: 800, bgcolor: BRANDING.colors.primary, color: '#FFFFFF' }}
                  />
                  <Chip
                    label={currentQ.question.questionType}
                    size="small"
                    sx={{ fontSize: '0.7rem', fontWeight: 700 }}
                  />
                  {currentQ.question.topic && (
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      Topic: {currentQ.question.topic}
                    </Typography>
                  )}
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Chip
                    label={`+${currentQ.question.marks} Marks`}
                    size="small"
                    color="primary"
                    sx={{ fontWeight: 700 }}
                  />
                  {currentQ.question.negativeMarks > 0 && (
                    <Chip
                      label={`-${currentQ.question.negativeMarks}`}
                      size="small"
                      color="error"
                      variant="outlined"
                      sx={{ fontWeight: 700 }}
                    />
                  )}
                </Box>
              </Box>

              <Divider sx={{ mb: 3 }} />

              {/* Question Prompt */}
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 600,
                  fontSize: { xs: '1rem', md: '1.15rem' },
                  lineHeight: 1.7,
                  mb: 4,
                  whiteSpace: 'pre-wrap',
                }}
              >
                {currentQ.question.questionText}
              </Typography>

              {/* MCQ Options Radio List */}
              {currentQ.question.questionType === 'MCQ' && currentQ.question.options && (
                <RadioGroup
                  value={currentAnswer?.selectedOptionId || ''}
                  onChange={(e) => handleSelectOption(e.target.value)}
                >
                  <Stack spacing={2} sx={{ mb: 4 }}>
                    {currentQ.question.options.map((opt) => {
                      const isSelected = currentAnswer?.selectedOptionId === opt.id;
                      return (
                        <Paper
                          key={opt.id}
                          elevation={0}
                          onClick={() => handleSelectOption(opt.id)}
                          sx={{
                            p: 2,
                            borderRadius: 2,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1.5,
                            border: isSelected
                              ? `2px solid ${BRANDING.colors.accent}`
                              : `1px solid ${BRANDING.colors.border}`,
                            bgcolor: isSelected ? 'rgba(0, 168, 150, 0.08)' : '#FAFBFD',
                            transition: 'all 0.15s ease',
                            '&:hover': {
                              bgcolor: isSelected ? 'rgba(0, 168, 150, 0.12)' : '#F1F5F9',
                            },
                          }}
                        >
                          <Radio checked={isSelected} value={opt.id} size="small" />
                          <Typography variant="body1" sx={{ fontWeight: isSelected ? 700 : 500 }}>
                            <strong>{opt.optionLabel}.</strong> {opt.optionText}
                          </Typography>
                        </Paper>
                      );
                    })}
                  </Stack>
                </RadioGroup>
              )}

              {/* Descriptive Text Answer Area */}
              {currentQ.question.questionType === 'DESCRIPTIVE' && (
                <Box sx={{ mb: 4 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                    Type your descriptive response below:
                  </Typography>
                  <TextField
                    fullWidth
                    multiline
                    rows={8}
                    placeholder="Enter comprehensive answer. Auto-saves continuously..."
                    value={currentAnswer?.descriptiveText || ''}
                    onChange={(e) => handleDescriptiveChange(e.target.value)}
                    onBlur={handleDescriptiveBlur}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        bgcolor: '#FFFFFF',
                        fontFamily: 'inherit',
                        lineHeight: 1.7,
                      },
                    }}
                  />
                  <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 1 }}>
                    Characters: {currentAnswer?.descriptiveText?.length || 0}
                  </Typography>
                </Box>
              )}

              {/* Bottom Nav Action Bar */}
              <Box sx={{ mt: 'auto', pt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Stack direction="row" spacing={1.5}>
                  <Button
                    variant="outlined"
                    startIcon={
                      currentAnswer?.status === 'MARKED_FOR_REVIEW' ||
                      currentAnswer?.status === 'ANSWERED_AND_MARKED_FOR_REVIEW' ? (
                        <BookmarkIcon sx={{ color: '#8B5CF6' }} />
                      ) : (
                        <BookmarkBorderIcon />
                      )
                    }
                    onClick={handleToggleMarkForReview}
                    sx={{
                      color:
                        currentAnswer?.status === 'MARKED_FOR_REVIEW' ||
                        currentAnswer?.status === 'ANSWERED_AND_MARKED_FOR_REVIEW'
                          ? '#8B5CF6'
                          : 'text.secondary',
                    }}
                  >
                    Mark for Review
                  </Button>

                  <Button
                    variant="text"
                    color="inherit"
                    startIcon={<ClearIcon />}
                    onClick={handleClearResponse}
                    sx={{ color: 'text.secondary', display: { xs: 'none', sm: 'inline-flex' } }}
                  >
                    Clear Response
                  </Button>
                </Stack>

                <Stack direction="row" spacing={1.5}>
                  <Button
                    variant="outlined"
                    disabled={currentIndex === 0}
                    onClick={handlePrev}
                    startIcon={<ArrowBackIcon />}
                  >
                    Previous
                  </Button>
                  {currentIndex < questions.length - 1 ? (
                    <Button variant="contained" onClick={handleNext} endIcon={<ArrowForwardIcon />}>
                      Next Question
                    </Button>
                  ) : (
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => setSubmitConfirmOpen(true)}
                      endIcon={<SendIcon />}
                    >
                      Submit Exam
                    </Button>
                  )}
                </Stack>
              </Box>
            </Card>
          )}
        </Box>

        {/* Right Side: Question Navigation Palette */}
        <Box
          sx={{
            width: { xs: 0, lg: 320 },
            display: { xs: 'none', lg: 'flex' },
            flexDirection: 'column',
            bgcolor: '#FFFFFF',
            borderLeft: `1px solid ${BRANDING.colors.border}`,
            p: 3,
            overflowY: 'auto',
          }}
        >
          <Typography variant="subtitle1" sx={{ fontWeight: 800, color: BRANDING.colors.primary, mb: 2 }}>
            Question Palette
          </Typography>

          {/* Palette Status Legend */}
          <Grid container spacing={1} sx={{ mb: 3 }}>
            <Grid item xs={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 14, height: 14, borderRadius: 0.5, bgcolor: '#10B981' }} />
                <Typography variant="caption" sx={{ fontWeight: 600 }}>Answered ({answeredCount})</Typography>
              </Box>
            </Grid>
            <Grid item xs={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 14, height: 14, borderRadius: 0.5, bgcolor: '#E2E8F0' }} />
                <Typography variant="caption" sx={{ fontWeight: 600 }}>Not Visited</Typography>
              </Box>
            </Grid>
            <Grid item xs={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 14, height: 14, borderRadius: 0.5, bgcolor: '#EF4444' }} />
                <Typography variant="caption" sx={{ fontWeight: 600 }}>Unanswered ({unansweredCount})</Typography>
              </Box>
            </Grid>
            <Grid item xs={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 14, height: 14, borderRadius: 0.5, bgcolor: '#8B5CF6' }} />
                <Typography variant="caption" sx={{ fontWeight: 600 }}>Review ({markedCount})</Typography>
              </Box>
            </Grid>
          </Grid>

          <Divider sx={{ mb: 2.5 }} />

          {/* Question Grid Buttons */}
          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, mb: 1.5, display: 'block' }}>
            Jump to Question:
          </Typography>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(5, 1fr)',
              gap: 1.2,
            }}
          >
            {questions.map((q, idx) => {
              const qState = answersCache[q.questionId]?.status || 'NOT_VISITED';
              const isCurrent = currentIndex === idx;

              let btnBg = '#F1F5F9';
              let btnColor = '#475569';

              if (qState === 'ANSWERED') {
                btnBg = '#10B981';
                btnColor = '#FFFFFF';
              } else if (qState === 'ANSWERED_AND_MARKED_FOR_REVIEW') {
                btnBg = '#8B5CF6';
                btnColor = '#FFFFFF';
              } else if (qState === 'MARKED_FOR_REVIEW') {
                btnBg = '#C4B5FD';
                btnColor = '#4C1D95';
              } else if (qState === 'UNANSWERED') {
                btnBg = '#FEE2E2';
                btnColor = '#DC2626';
              }

              return (
                <Box
                  key={q.questionId}
                  onClick={() => setCurrentIndex(idx)}
                  sx={{
                    height: 38,
                    borderRadius: 1.5,
                    bgcolor: btnBg,
                    color: btnColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    outline: isCurrent ? `2px solid ${BRANDING.colors.primary}` : 'none',
                    outlineOffset: 2,
                    transition: 'all 0.15s ease',
                    '&:hover': { opacity: 0.85 },
                  }}
                >
                  {idx + 1}
                </Box>
              );
            })}
          </Box>
        </Box>
      </Box>

      {/* Confirmation Submit Dialog */}
      <Dialog open={submitConfirmOpen} onClose={() => setSubmitConfirmOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>Submit Examination?</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Are you sure you want to finish and submit your examination? Once submitted, your answers will
            be locked.
          </Typography>

          <Paper sx={{ p: 2, bgcolor: '#FAFBFD', borderRadius: 2, border: `1px solid ${BRANDING.colors.border}`, mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2">Answered Questions:</Typography>
              <Typography variant="body2" sx={{ fontWeight: 700, color: '#16A34A' }}>
                {answeredCount}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2">Unanswered Questions:</Typography>
              <Typography variant="body2" sx={{ fontWeight: 700, color: '#DC2626' }}>
                {unansweredCount}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2">Marked for Review:</Typography>
              <Typography variant="body2" sx={{ fontWeight: 700, color: '#8B5CF6' }}>
                {markedCount}
              </Typography>
            </Box>
          </Paper>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setSubmitConfirmOpen(false)}>Resume Test</Button>
          <Button variant="contained" color="primary" onClick={handleConfirmSubmit} disabled={submitting}>
            {submitting ? 'Submitting...' : 'Yes, Submit Final Answers'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Anti-Cheat Proctor Warning Dialog */}
      <Dialog open={proctorAlertOpen} onClose={() => setProctorAlertOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 800, color: '#DC2626' }}>Proctoring Alert</DialogTitle>
        <DialogContent>
          <Alert severity="error" sx={{ mb: 2 }}>
            <strong>Window Blur / Tab Switch Detected!</strong>
          </Alert>
          <Typography variant="body2">
            You switched away from the active examination window (Incident #{tabSwitchCountRef.current}). All tab
            blur events and window movements are recorded in the institutional proctoring audit log.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button variant="contained" color="error" onClick={() => setProctorAlertOpen(false)}>
            I Understand, Return to Test
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
