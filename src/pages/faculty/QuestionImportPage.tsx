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
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  LinearProgress,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditIcon from '@mui/icons-material/Edit';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import MemoryIcon from '@mui/icons-material/Memory';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { SEO } from '../../components/common/SEO';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { questionImportsService } from '../../services/question-imports.service';
import { examinationsService } from '../../services/examinations.service';
import { useNotification } from '../../context/NotificationContext';
import { extractErrorMessage } from '../../services/api';
import { Examination, QuestionImport, QuestionImportItem } from '../../types';
import { BRANDING } from '../../config/env';

export const QuestionImportPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialTestId = searchParams.get('testId') || '';

  const navigate = useNavigate();
  const { showSuccess, showError } = useNotification();

  const [examinations, setExaminations] = useState<Examination[]>([]);
  const [selectedTestId, setSelectedTestId] = useState<string>(initialTestId);
  const [loadingExams, setLoadingExams] = useState(true);

  // File upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploading, setUploading] = useState<boolean>(false);

  // Staged Preview data from backend memory-buffer parser
  const [importBatch, setImportBatch] = useState<QuestionImport | null>(null);
  const [stagedItems, setStagedItems] = useState<QuestionImportItem[]>([]);
  const [validCount, setValidCount] = useState<number>(0);
  const [invalidCount, setInvalidCount] = useState<number>(0);
  const [confirming, setConfirming] = useState<boolean>(false);

  // Edit Staged Item Dialog
  const [editItem, setEditItem] = useState<QuestionImportItem | null>(null);
  const [editText, setEditText] = useState('');
  const [editMarks, setEditMarks] = useState(2);
  const [editNegative, setEditNegative] = useState(0.5);

  useEffect(() => {
    examinationsService
      .getExaminations({ limit: 100 })
      .then((res) => {
        setExaminations(res.items);
        if (!selectedTestId && res.items.length > 0) {
          setSelectedTestId(res.items[0].id);
        }
      })
      .catch(() => {})
      .finally(() => setLoadingExams(false));
  }, []);

  const handleDownloadTemplate = async (type: 'mcq' | 'descriptive' | 'mixed') => {
    try {
      const blob = await questionImportsService.downloadTemplate(type);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `exanova_${type}_question_template.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      showSuccess(`Sample ${type.toUpperCase()} template downloaded!`);
    } catch (err: unknown) {
      showError(extractErrorMessage(err));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const ext = file.name.split('.').pop()?.toLowerCase();
      if (ext !== 'docx' && ext !== 'xlsx') {
        showError('Only Microsoft Word (.docx) and Microsoft Excel (.xlsx) files are supported.');
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleUploadAndParse = async () => {
    if (!selectedTestId) {
      showError('Please select a target examination.');
      return;
    }
    if (!selectedFile) {
      showError('Please select a .docx or .xlsx question paper.');
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const result = await questionImportsService.uploadQuestions(
        selectedTestId,
        selectedFile,
        (percent) => setUploadProgress(percent),
      );

      // Now fetch staged preview
      const preview = await questionImportsService.getPreview(result.importId);
      setImportBatch(preview.import);
      setStagedItems(preview.items);
      setValidCount(preview.validCount);
      setInvalidCount(preview.invalidCount);

      // Prompt requirement: "The frontend must not retain the original document after the import process is completed. Do not create base64 copies or persist original file content."
      setSelectedFile(null);

      showSuccess(
        `File parsed successfully! Extracted ${result.totalQuestions} questions (${result.validQuestions} valid, ${result.invalidQuestions} invalid).`,
      );
    } catch (err: unknown) {
      showError(extractErrorMessage(err));
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteStagedItem = async (itemId: string) => {
    if (!importBatch) return;
    try {
      await questionImportsService.deleteStagedQuestion(importBatch.id, itemId);
      setStagedItems((prev) => prev.filter((i) => i.id !== itemId));
      showSuccess('Staged item removed.');
    } catch (err: unknown) {
      showError(extractErrorMessage(err));
    }
  };

  const handleEditStagedItem = (item: QuestionImportItem) => {
    setEditItem(item);
    setEditText(item.questionText);
    setEditMarks(item.marks);
    setEditNegative(item.negativeMarks);
  };

  const handleSaveEditItem = async () => {
    if (!importBatch || !editItem) return;
    try {
      const updated = await questionImportsService.updateStagedQuestion(
        importBatch.id,
        editItem.id,
        {
          questionText: editText,
          marks: editMarks,
          negativeMarks: editNegative,
        },
      );
      setStagedItems((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
      setEditItem(null);
      showSuccess('Staged question corrected!');
    } catch (err: unknown) {
      showError(extractErrorMessage(err));
    }
  };

  const handleConfirmImport = async () => {
    if (!importBatch) return;
    setConfirming(true);
    try {
      const result = await questionImportsService.confirmImport(importBatch.id);
      showSuccess(
        `Import confirmed! ${result.questionsImported} questions committed into examination paper.`,
      );
      navigate(`/faculty/examinations/${result.testId}/questions`);
    } catch (err: unknown) {
      showError(extractErrorMessage(err));
    } finally {
      setConfirming(false);
    }
  };

  const handleCancelImport = async () => {
    if (!importBatch) return;
    try {
      await questionImportsService.cancelImport(importBatch.id);
      setImportBatch(null);
      setStagedItems([]);
      showSuccess('Import session cancelled and staged memory purged.');
    } catch (err: unknown) {
      showError(extractErrorMessage(err));
    }
  };

  if (loadingExams) {
    return <LoadingSpinner message="Preparing zero-storage import workspace..." />;
  }

  return (
    <Box sx={{ pb: 6 }}>
      <SEO title="Zero-Storage Question Paper Import" isPrivate />

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
          Zero-Storage Question Paper Import
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Upload Microsoft Word (.docx) or Excel (.xlsx) papers for instant in-memory extraction and staging
        </Typography>
      </Box>

      {/* Zero Storage Architecture Banner */}
      <Alert
        icon={<MemoryIcon fontSize="inherit" />}
        severity="info"
        sx={{
          mb: 4,
          borderRadius: 2.5,
          bgcolor: '#EFF6FF',
          border: '1px solid #BFDBFE',
          '& .MuiAlert-message': { color: '#1E3A8A', fontSize: '0.875rem' },
        }}
      >
        <strong>Zero-Storage Architecture:</strong> Uploaded papers are ingested strictly through
        in-memory buffers using Mammoth (.docx) and ExcelJS (.xlsx). Original documents are never written to
        disk, cloud buckets, or persistent files, and are automatically purged after structured extraction.
      </Alert>

      {/* Step 1 & Step 2: Examination Select & Template Downloads */}
      {!importBatch && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={7}>
            <Card sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                Step 1: Select Target Examination & Upload Document
              </Typography>

              <Box sx={{ mb: 3 }}>
                <FormControl fullWidth size="small" required>
                  <InputLabel>Target Examination</InputLabel>
                  <Select
                    value={selectedTestId}
                    label="Target Examination"
                    onChange={(e) => setSelectedTestId(e.target.value)}
                  >
                    {examinations.map((ex) => (
                      <MenuItem key={ex.id} value={ex.id}>
                        {ex.title} ({ex.examinationCode})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              <Box
                sx={{
                  p: 4,
                  border: `2px dashed ${BRANDING.colors.border}`,
                  borderRadius: 3,
                  textAlign: 'center',
                  bgcolor: '#FAFBFD',
                  mb: 3,
                }}
              >
                <input
                  type="file"
                  accept=".docx, .xlsx, application/vnd.openxmlformats-officedocument.wordprocessingml.document, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                  id="question-paper-upload"
                  style={{ display: 'none' }}
                  onChange={handleFileChange}
                />
                <label htmlFor="question-paper-upload">
                  <Button
                    variant="contained"
                    component="span"
                    startIcon={<UploadFileIcon />}
                    size="large"
                    sx={{ px: 3, py: 1.2 }}
                  >
                    Choose DOCX or XLSX File
                  </Button>
                </label>

                {selectedFile ? (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body1" sx={{ fontWeight: 700, color: BRANDING.colors.primary }}>
                      {selectedFile.name}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      Size: {(selectedFile.size / 1024).toFixed(1)} KB • Memory buffer ingestion ready
                    </Typography>
                  </Box>
                ) : (
                  <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1.5 }}>
                    Drag and drop Word (.docx) or Excel (.xlsx) paper, or click to browse
                  </Typography>
                )}
              </Box>

              {uploading && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', mb: 0.5, display: 'block' }}>
                    Uploading & parsing memory buffer... {uploadProgress}%
                  </Typography>
                  <LinearProgress variant="determinate" value={uploadProgress} sx={{ height: 8, borderRadius: 4 }} />
                </Box>
              )}

              <Button
                fullWidth
                variant="contained"
                color="secondary"
                size="large"
                disabled={uploading || !selectedFile}
                onClick={handleUploadAndParse}
                sx={{ py: 1.4, fontWeight: 700 }}
              >
                {uploading ? 'Processing in Memory...' : 'Upload & Extract Questions'}
              </Button>
            </Card>
          </Grid>

          {/* Sample Templates Sidebar */}
          <Grid item xs={12} md={5}>
            <Card sx={{ p: 3, height: '100%', bgcolor: '#F8FAFC' }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1.5 }}>
                Download Standard Templates
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3, lineHeight: 1.6 }}>
                Format your questions using our pre-validated templates for instant 100% accurate ingestion:
              </Typography>

              <Stack spacing={2}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<FileDownloadIcon />}
                  onClick={() => handleDownloadTemplate('mcq')}
                  sx={{ justifyContent: 'flex-start', py: 1.2 }}
                >
                  MCQ Question Template (.xlsx)
                </Button>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<FileDownloadIcon />}
                  onClick={() => handleDownloadTemplate('descriptive')}
                  sx={{ justifyContent: 'flex-start', py: 1.2 }}
                >
                  Descriptive Question Template (.xlsx)
                </Button>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<FileDownloadIcon />}
                  onClick={() => handleDownloadTemplate('mixed')}
                  sx={{ justifyContent: 'flex-start', py: 1.2 }}
                >
                  Mixed Question Template (.xlsx)
                </Button>
              </Stack>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Staged Questions Preview Table & Actions */}
      {importBatch && (
        <Box>
          {/* Summary Chips */}
          <Card sx={{ p: 3, mb: 3 }}>
            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                justifyContent: 'space-between',
                alignItems: { xs: 'flex-start', sm: 'center' },
                gap: 2,
              }}
            >
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 800, color: BRANDING.colors.primary }}>
                  Extracted Staging Preview ({stagedItems.length} Total Questions)
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  Batch ID: {importBatch.id} • Original File: {importBatch.filename}
                </Typography>
              </Box>

              <Stack direction="row" spacing={1.5}>
                <Chip
                  icon={<CheckCircleIcon />}
                  label={`${validCount} Valid Questions`}
                  color="success"
                  sx={{ fontWeight: 700 }}
                />
                {invalidCount > 0 && (
                  <Chip
                    icon={<ErrorOutlineIcon />}
                    label={`${invalidCount} Questions with Errors`}
                    color="error"
                    sx={{ fontWeight: 700 }}
                  />
                )}
              </Stack>
            </Box>
          </Card>

          {/* Staged Table */}
          <TableContainer component={Paper} elevation={0} sx={{ border: `1px solid ${BRANDING.colors.border}`, mb: 3 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>#</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Question Prompt & Choices</TableCell>
                  <TableCell>Marks</TableCell>
                  <TableCell>Validation State</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {stagedItems.map((item, idx) => (
                  <TableRow
                    key={item.id}
                    hover
                    sx={{ bgcolor: item.isValid ? 'transparent' : 'rgba(239, 68, 68, 0.04)' }}
                  >
                    <TableCell sx={{ fontWeight: 700 }}>{idx + 1}</TableCell>
                    <TableCell>
                      <Chip label={item.questionType} size="small" />
                    </TableCell>
                    <TableCell sx={{ maxWidth: 450 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                        {item.questionText}
                      </Typography>
                      {item.optionsJson && item.optionsJson.length > 0 && (
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          Choices: {item.optionsJson.map((o) => `(${o.label}) ${o.text}`).join(' • ')} (Key: {item.correctAnswer || 'A'})
                        </Typography>
                      )}
                      {item.validationErrors && item.validationErrors.length > 0 && (
                        <Alert severity="error" sx={{ mt: 1, py: 0.2, fontSize: '0.75rem' }}>
                          {item.validationErrors.join(', ')}
                        </Alert>
                      )}
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.85rem' }}>
                      +{item.marks} / -{item.negativeMarks}
                    </TableCell>
                    <TableCell>
                      {item.isValid ? (
                        <Chip label="Valid" color="success" size="small" />
                      ) : (
                        <Chip label="Requires Correction" color="error" size="small" />
                      )}
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Edit Staged Question">
                        <IconButton size="small" color="primary" onClick={() => handleEditStagedItem(item)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Remove Invalid Question">
                        <IconButton size="small" color="error" onClick={() => handleDeleteStagedItem(item.id)}>
                          <DeleteOutlineIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Confirm or Cancel Batch Commit */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Button variant="outlined" color="inherit" onClick={handleCancelImport}>
              Discard & Purge Staging
            </Button>
            <Button
              variant="contained"
              color="primary"
              size="large"
              disabled={confirming || stagedItems.length === 0}
              onClick={handleConfirmImport}
              startIcon={<CheckCircleIcon />}
              sx={{ px: 4, py: 1.4, fontWeight: 700 }}
            >
              {confirming ? 'Committing to Database...' : `Confirm & Commit (${stagedItems.length} Questions)`}
            </Button>
          </Box>
        </Box>
      )}

      {/* Edit Staged Question Dialog */}
      <Dialog open={Boolean(editItem)} onClose={() => setEditItem(null)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Edit Staged Question</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Question Text"
              fullWidth
              multiline
              rows={3}
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
            />
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  label="Marks"
                  type="number"
                  fullWidth
                  size="small"
                  value={editMarks}
                  onChange={(e) => setEditMarks(Number(e.target.value))}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Negative Marks"
                  type="number"
                  fullWidth
                  size="small"
                  value={editNegative}
                  onChange={(e) => setEditNegative(Number(e.target.value))}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setEditItem(null)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveEditItem}>Save Changes</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
