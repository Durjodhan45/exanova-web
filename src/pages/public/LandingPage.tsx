import React from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Grid,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import EditNoteOutlinedIcon from '@mui/icons-material/EditNoteOutlined';
import QuizOutlinedIcon from '@mui/icons-material/QuizOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import RateReviewOutlinedIcon from '@mui/icons-material/RateReviewOutlined';
import TimerOutlinedIcon from '@mui/icons-material/TimerOutlined';
import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined';
import PictureAsPdfOutlinedIcon from '@mui/icons-material/PictureAsPdfOutlined';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import SchoolIcon from '@mui/icons-material/School';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import MemoryIcon from '@mui/icons-material/Memory';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';
import { SEO } from '../../components/common/SEO';
import { BRANDING } from '../../config/env';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();

  const features = [
    {
      icon: <LockOutlinedIcon sx={{ fontSize: 32, color: BRANDING.colors.accent }} />,
      title: 'Secure Student Login',
      description:
        'Streamlined authentication for students via college roll number and password, with forced first-login password rotation and device session tracking.',
    },
    {
      icon: <EditNoteOutlinedIcon sx={{ fontSize: 32, color: BRANDING.colors.secondary }} />,
      title: 'Faculty Exam Management',
      description:
        'Empowers educators to draft, configure, and schedule examinations with custom duration, passing marks, and eligible student group whitelisting.',
    },
    {
      icon: <QuizOutlinedIcon sx={{ fontSize: 32, color: BRANDING.colors.accentPurple }} />,
      title: 'MCQ & Descriptive Assessments',
      description:
        'Comprehensive assessment types supporting multiple choice with randomized choices and descriptive questions with custom rubric criteria.',
    },
    {
      icon: <CheckCircleOutlineIcon sx={{ fontSize: 32, color: '#10B981' }} />,
      title: 'Automated MCQ Evaluation',
      description:
        'Instant decimal-accurate scoring engine supporting Fixed, Fraction, or Custom negative marking penalties with zero human grading delay.',
    },
    {
      icon: <RateReviewOutlinedIcon sx={{ fontSize: 32, color: '#F59E0B' }} />,
      title: 'Manual Descriptive Evaluation',
      description:
        'Dedicated faculty grading workbench with student response inspection, rubric review, direct marks allocation, and personalized feedback.',
    },
    {
      icon: <TimerOutlinedIcon sx={{ fontSize: 32, color: '#3B82F6' }} />,
      title: 'Real-Time Server Timer',
      description:
        'Authoritative server-side synchronized examination clock preventing client manipulation, with automatic submission upon deadline expiry.',
    },
    {
      icon: <AssessmentOutlinedIcon sx={{ fontSize: 32, color: '#8B5CF6' }} />,
      title: 'Dynamic Result Management',
      description:
        'Merit rank calculation, pass/fail analytics, and controlled result release workflows strictly gated until institutional clearance.',
    },
    {
      icon: <PictureAsPdfOutlinedIcon sx={{ fontSize: 32, color: '#EC4899' }} />,
      title: 'Excel & PDF Reports',
      description:
        'Zero-storage in-memory generation of official PDF scorecards and Excel master performance sheets streamed securely on demand.',
    },
  ];

  const workflowSteps = [
    {
      step: '01',
      title: 'Faculty Creates Examination',
      description: 'Defines course, semester, duration, passing criteria, and negative marking configuration.',
    },
    {
      step: '02',
      title: 'Uploads Question Paper',
      description: 'Zero-storage in-memory parsing of Word (.docx) or Excel (.xlsx) papers with instant preview.',
    },
    {
      step: '03',
      title: 'Publishes Examination',
      description: 'Validates questions, enrolls eligible student cohorts, and dispatches automated notices.',
    },
    {
      step: '04',
      title: 'Students Attend Exam',
      description: 'Distraction-free proctored interface with live server timer and seamless answer autosaving.',
    },
    {
      step: '05',
      title: 'Descriptive Evaluation',
      description: 'Automated MCQ evaluation paired with dedicated faculty review for subjective answers.',
    },
    {
      step: '06',
      title: 'Result Publication',
      description: 'Admin releases approved scorecards with merit ranking and downloadable PDF transcripts.',
    },
  ];

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: '#FFFFFF' }}>
      <SEO
        title="Smart College Examination & Assessment System"
        description="A modern digital examination platform designed to simplify examination management, question paper preparation, online assessments, evaluation, and result processing."
      />

      <Navbar />

      {/* Hero Section */}
      <Box
        id="home"
        sx={{
          background: `linear-gradient(135deg, ${BRANDING.colors.primary} 0%, #15224D 60%, ${BRANDING.colors.secondary} 100%)`,
          color: '#FFFFFF',
          pt: { xs: 8, md: 12 },
          pb: { xs: 8, md: 14 },
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={7}>
              {/* Institution Pill */}
              <Box
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 1,
                  px: 2,
                  py: 0.8,
                  borderRadius: 10,
                  bgcolor: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  mb: 3,
                }}
              >
                <SchoolIcon sx={{ fontSize: 18, color: BRANDING.colors.accent }} />
                <Typography variant="caption" sx={{ color: '#E2E8F0', fontWeight: 600, letterSpacing: '0.04em' }}>
                  {BRANDING.organization.toUpperCase()}
                </Typography>
              </Box>

              {/* Main Heading */}
              <Typography
                variant="h1"
                sx={{
                  color: '#FFFFFF',
                  fontWeight: 800,
                  fontSize: { xs: '2.4rem', sm: '3.2rem', md: '3.8rem' },
                  lineHeight: 1.15,
                  mb: 2.5,
                }}
              >
                Smart Examination for a{' '}
                <Box
                  component="span"
                  sx={{
                    background: `linear-gradient(90deg, #2DD4BF, #60A5FA)`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  Smarter Future.
                </Box>
              </Typography>

              {/* Description */}
              <Typography
                variant="body1"
                sx={{
                  color: '#CBD5E1',
                  fontSize: { xs: '1rem', md: '1.15rem' },
                  lineHeight: 1.7,
                  mb: 4,
                  maxWidth: 620,
                }}
              >
                A modern digital examination platform designed to simplify examination management, question
                paper preparation, online assessments, evaluation, and result processing for modern collegiate
                institutions.
              </Typography>

              {/* Action Buttons */}
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => navigate('/login')}
                  endIcon={<ArrowForwardIcon />}
                  sx={{
                    bgcolor: BRANDING.colors.accent,
                    color: '#FFFFFF',
                    px: 3.5,
                    py: 1.5,
                    fontSize: '1rem',
                    fontWeight: 700,
                    borderRadius: 2,
                    boxShadow: '0 8px 20px rgba(0, 168, 150, 0.35)',
                    '&:hover': {
                      bgcolor: '#008F80',
                    },
                  }}
                >
                  Login to Portal
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  href="#features"
                  sx={{
                    color: '#FFFFFF',
                    borderColor: 'rgba(255, 255, 255, 0.3)',
                    px: 3.5,
                    py: 1.5,
                    fontSize: '1rem',
                    fontWeight: 600,
                    borderRadius: 2,
                    '&:hover': {
                      borderColor: '#FFFFFF',
                      bgcolor: 'rgba(255, 255, 255, 0.08)',
                    },
                  }}
                >
                  Explore Features
                </Button>
              </Stack>
            </Grid>

            {/* Hero Visual Card */}
            <Grid item xs={12} md={5}>
              <Box
                sx={{
                  p: 3,
                  borderRadius: 4,
                  bgcolor: 'rgba(255, 255, 255, 0.06)',
                  backdropFilter: 'blur(16px)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#EF4444' }} />
                    <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#F59E0B' }} />
                    <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#10B981' }} />
                  </Box>
                  <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 600 }}>
                    ExaNova Authoritative Engine
                  </Typography>
                </Box>

                {/* Architecture Highlights */}
                <Stack spacing={2}>
                  <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'rgba(255, 255, 255, 0.05)' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
                      <MemoryIcon sx={{ color: BRANDING.colors.accent }} />
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#FFFFFF' }}>
                        Zero-Storage Staging
                      </Typography>
                    </Box>
                    <Typography variant="caption" sx={{ color: '#94A3B8' }}>
                      Word & Excel papers parsed directly in-memory with PostgreSQL staging.
                    </Typography>
                  </Box>

                  <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'rgba(255, 255, 255, 0.05)' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
                      <VerifiedUserIcon sx={{ color: '#60A5FA' }} />
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#FFFFFF' }}>
                        Authoritative Test UUID
                      </Typography>
                    </Box>
                    <Typography variant="caption" sx={{ color: '#94A3B8' }}>
                      End-to-end cryptographic and persistent relational consistency across exam attempts.
                    </Typography>
                  </Box>

                  <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'rgba(255, 255, 255, 0.05)' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
                      <TimerOutlinedIcon sx={{ color: '#FCD34D' }} />
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#FFFFFF' }}>
                        Server-Side Authoritative Timer
                      </Typography>
                    </Box>
                    <Typography variant="caption" sx={{ color: '#94A3B8' }}>
                      Strict countdown synchronization with automatic lock upon expiration.
                    </Typography>
                  </Box>
                </Stack>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* About Section */}
      <Box id="about" sx={{ py: { xs: 8, md: 10 }, bgcolor: '#FFFFFF' }}>
        <Container maxWidth="lg">
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  p: { xs: 3, md: 5 },
                  borderRadius: 4,
                  bgcolor: '#F8FAFC',
                  border: `1px solid ${BRANDING.colors.border}`,
                }}
              >
                <Typography variant="overline" sx={{ color: BRANDING.colors.accent, fontWeight: 700 }}>
                  ABOUT THE PLATFORM
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 700, mb: 2.5 }}>
                  Engineered for Academic Rigor and Operational Simplicity
                </Typography>
                <Typography variant="body1" sx={{ color: BRANDING.colors.textSecondary, mb: 2, lineHeight: 1.7 }}>
                  <strong>ExaNova</strong> is a comprehensive smart examination and assessment management
                  portal created to meet the modern operational demands of higher education institutions.
                </Typography>
                <Typography variant="body1" sx={{ color: BRANDING.colors.textSecondary, mb: 3, lineHeight: 1.7 }}>
                  From high-stakes mid-term and semester examinations to class tests, ExaNova empowers
                  administrators, professors, and students with dedicated role-specific portals, eliminating
                  paper overhead and grading bottlenecks.
                </Typography>
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    bgcolor: '#FFFFFF',
                    borderLeft: `4px solid ${BRANDING.colors.primary}`,
                  }}
                >
                  <Typography variant="body2" sx={{ fontWeight: 600, color: BRANDING.colors.primary }}>
                    Serving {BRANDING.organization}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    {BRANDING.address}
                  </Typography>
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <Grid container spacing={3}>
                {[
                  { title: 'Role-Based Access', desc: 'Custom tailored dashboards for Admin, Faculty, and Students.' },
                  { title: 'Zero File Persistence', desc: 'Strict memory-buffered ingestion ensuring security and privacy.' },
                  { title: 'Negative Marking', desc: 'Configurable penalty algorithms supporting fractional and custom deduction.' },
                  { title: 'Instant Scorecards', desc: 'Dynamic PDF scorecards generated on-the-fly and streamed securely.' },
                ].map((item, idx) => (
                  <Grid item xs={12} sm={6} key={idx}>
                    <Card sx={{ height: '100%', p: 1, '&:hover': { transform: 'translateY(-4px)' } }}>
                      <CardContent>
                        <CheckCircleOutlineIcon sx={{ color: BRANDING.colors.accent, mb: 1, fontSize: 28 }} />
                        <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                          {item.title}
                        </Typography>
                        <Typography variant="body2" sx={{ color: BRANDING.colors.textSecondary, lineHeight: 1.6 }}>
                          {item.desc}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features Grid Section */}
      <Box id="features" sx={{ py: { xs: 8, md: 12 }, bgcolor: '#F8FAFC' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography variant="overline" sx={{ color: BRANDING.colors.accent, fontWeight: 700, letterSpacing: '0.06em' }}>
              POWERFUL SYSTEM FEATURES
            </Typography>
            <Typography variant="h2" sx={{ fontWeight: 800, mb: 2 }}>
              Everything Your Institution Needs for Online Examinations
            </Typography>
            <Typography variant="body1" sx={{ color: BRANDING.colors.textSecondary, maxWidth: 650, mx: 'auto' }}>
              Engineered from the ground up for seamless faculty authoring, frictionless student test taking,
              and tamper-proof institutional governance.
            </Typography>
          </Box>

          <Grid container spacing={3.5}>
            {features.map((feature, idx) => (
              <Grid item xs={12} sm={6} md={3} key={idx}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    p: 1.5,
                    bgcolor: '#FFFFFF',
                    transition: 'all 0.25s ease',
                    '&:hover': {
                      transform: 'translateY(-6px)',
                      boxShadow: '0 12px 24px rgba(16, 27, 63, 0.08)',
                      borderColor: BRANDING.colors.secondary,
                    },
                  }}
                >
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box
                      sx={{
                        width: 52,
                        height: 52,
                        borderRadius: 2.5,
                        bgcolor: '#F1F5F9',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mb: 2,
                      }}
                    >
                      {feature.icon}
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, color: BRANDING.colors.primary }}>
                      {feature.title}
                    </Typography>
                    <Typography variant="body2" sx={{ color: BRANDING.colors.textSecondary, lineHeight: 1.6 }}>
                      {feature.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Examination Workflow Timeline */}
      <Box id="workflow" sx={{ py: { xs: 8, md: 12 }, bgcolor: '#FFFFFF' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography variant="overline" sx={{ color: BRANDING.colors.accent, fontWeight: 700, letterSpacing: '0.06em' }}>
              EXAMINATION LIFECYCLE
            </Typography>
            <Typography variant="h2" sx={{ fontWeight: 800, mb: 2 }}>
              End-to-End Digital Assessment Workflow
            </Typography>
            <Typography variant="body1" sx={{ color: BRANDING.colors.textSecondary, maxWidth: 640, mx: 'auto' }}>
              Trace every step from question creation to instant score release.
            </Typography>
          </Box>

          <Grid container spacing={3}>
            {workflowSteps.map((wf, idx) => (
              <Grid item xs={12} sm={6} md={4} key={idx}>
                <Box
                  sx={{
                    p: 3.5,
                    borderRadius: 3,
                    bgcolor: '#F8FAFC',
                    border: `1px solid ${BRANDING.colors.border}`,
                    height: '100%',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  <Typography
                    variant="h2"
                    sx={{
                      position: 'absolute',
                      right: 16,
                      top: 10,
                      fontWeight: 900,
                      color: 'rgba(16, 27, 63, 0.05)',
                      fontSize: '3.5rem',
                      userSelect: 'none',
                    }}
                  >
                    {wf.step}
                  </Typography>
                  <Box
                    sx={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 36,
                      height: 36,
                      borderRadius: '50%',
                      bgcolor: BRANDING.colors.primary,
                      color: '#FFFFFF',
                      fontWeight: 700,
                      fontSize: '0.9rem',
                      mb: 2,
                    }}
                  >
                    {wf.step}
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, color: BRANDING.colors.primary }}>
                    {wf.title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: BRANDING.colors.textSecondary, lineHeight: 1.6 }}>
                    {wf.description}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box
        id="contact"
        sx={{
          py: 8,
          bgcolor: '#0E1736',
          color: '#FFFFFF',
          textAlign: 'center',
          position: 'relative',
        }}
      >
        <Container maxWidth="md">
          <Typography variant="h3" sx={{ fontWeight: 800, mb: 2, color: '#FFFFFF' }}>
            Ready to Experience ExaNova?
          </Typography>
          <Typography variant="body1" sx={{ color: '#94A3B8', mb: 4, maxWidth: 580, mx: 'auto', lineHeight: 1.7 }}>
            Access your secure portal with your college credentials. For inquiries, student enrollments, or
            faculty onboarding, contact our examination branch.
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/login')}
              startIcon={<SchoolIcon />}
              sx={{
                bgcolor: BRANDING.colors.accent,
                color: '#FFFFFF',
                px: 4,
                py: 1.5,
                fontWeight: 700,
                fontSize: '1rem',
                borderRadius: 2,
                '&:hover': { bgcolor: '#008F80' },
              }}
            >
              Sign In to Portal
            </Button>
            <Button
              variant="outlined"
              size="large"
              component="a"
              href={`mailto:${BRANDING.email}`}
              sx={{
                color: '#FFFFFF',
                borderColor: 'rgba(255, 255, 255, 0.3)',
                px: 3.5,
                py: 1.5,
                fontWeight: 600,
                borderRadius: 2,
                '&:hover': { borderColor: '#FFFFFF', bgcolor: 'rgba(255, 255, 255, 0.08)' },
              }}
            >
              Contact Examination Cell
            </Button>
          </Stack>
        </Container>
      </Box>

      <Footer />
    </Box>
  );
};
