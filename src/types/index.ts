// Enums as const objects for runtime safety and TS compatibility
export const UserRole = {
  ADMIN: 'ADMIN',
  FACULTY: 'FACULTY',
  STUDENT: 'STUDENT',
} as const;
export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export const UserStatus = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  SUSPENDED: 'SUSPENDED',
} as const;
export type UserStatus = (typeof UserStatus)[keyof typeof UserStatus];

export const ExaminationStatus = {
  DRAFT: 'DRAFT',
  SCHEDULED: 'SCHEDULED',
  PUBLISHED: 'PUBLISHED',
  LIVE: 'LIVE',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
} as const;
export type ExaminationStatus = (typeof ExaminationStatus)[keyof typeof ExaminationStatus];

export const ExaminationType = {
  MCQ: 'MCQ',
  DESCRIPTIVE: 'DESCRIPTIVE',
  MIXED: 'MIXED',
} as const;
export type ExaminationType = (typeof ExaminationType)[keyof typeof ExaminationType];

export const QuestionType = {
  MCQ: 'MCQ',
  DESCRIPTIVE: 'DESCRIPTIVE',
} as const;
export type QuestionType = (typeof QuestionType)[keyof typeof QuestionType];

export const DifficultyLevel = {
  EASY: 'EASY',
  MEDIUM: 'MEDIUM',
  HARD: 'HARD',
} as const;
export type DifficultyLevel = (typeof DifficultyLevel)[keyof typeof DifficultyLevel];

export const NegativeMarkingType = {
  NONE: 'NONE',
  FIXED: 'FIXED',
  FRACTION: 'FRACTION',
  CUSTOM: 'CUSTOM',
} as const;
export type NegativeMarkingType = (typeof NegativeMarkingType)[keyof typeof NegativeMarkingType];

export const AttemptStatus = {
  IN_PROGRESS: 'IN_PROGRESS',
  SUBMITTED: 'SUBMITTED',
  EVALUATED: 'EVALUATED',
  EXPIRED: 'EXPIRED',
  CANCELLED: 'CANCELLED',
} as const;
export type AttemptStatus = (typeof AttemptStatus)[keyof typeof AttemptStatus];

export const QuestionAttemptStatus = {
  NOT_VISITED: 'NOT_VISITED',
  UNANSWERED: 'UNANSWERED',
  ANSWERED: 'ANSWERED',
  MARKED_FOR_REVIEW: 'MARKED_FOR_REVIEW',
  ANSWERED_AND_MARKED_FOR_REVIEW: 'ANSWERED_AND_MARKED_FOR_REVIEW',
} as const;
export type QuestionAttemptStatus = (typeof QuestionAttemptStatus)[keyof typeof QuestionAttemptStatus];

export const EvaluationStatus = {
  PENDING: 'PENDING',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
} as const;
export type EvaluationStatus = (typeof EvaluationStatus)[keyof typeof EvaluationStatus];

export const ResultStatus = {
  CALCULATED: 'CALCULATED',
  PUBLISHED: 'PUBLISHED',
  WITHHELD: 'WITHHELD',
} as const;
export type ResultStatus = (typeof ResultStatus)[keyof typeof ResultStatus];

export const PassFailStatus = {
  PASS: 'PASS',
  FAIL: 'FAIL',
} as const;
export type PassFailStatus = (typeof PassFailStatus)[keyof typeof PassFailStatus];

// Standard API Response structure from backend TransformInterceptor
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    totalPages?: number;
    timestamp: string;
    [key: string]: unknown;
  };
}

// User & Auth
export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  mustChangePassword: boolean;
  createdAt?: string;
  updatedAt?: string;
  student?: Student;
  faculty?: Faculty;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
  user: {
    id: string;
    username: string;
    email: string;
    role: UserRole;
    mustChangePassword: boolean;
    studentId?: string;
    facultyId?: string;
  };
}

// Academic Structures
export interface Department {
  id: string;
  name: string;
  code: string;
  description?: string;
  isActive: boolean;
  createdAt?: string;
}

export interface Course {
  id: string;
  name: string;
  code: string;
  durationYears: number;
  totalSemesters: number;
  departmentId: string;
  department?: Department;
  isActive: boolean;
  semesters?: Semester[];
}

export interface Semester {
  id: string;
  semesterNumber: number;
  name: string;
  courseId: string;
  course?: Course;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  credits: number;
  description?: string;
  courseId: string;
  semesterId: string;
  course?: Course;
  semester?: Semester;
  isActive: boolean;
}

export interface AcademicSession {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
}

// Profiles
export interface Faculty {
  id: string;
  userId: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  designation: string;
  phone?: string;
  departmentId: string;
  department?: Department;
  user?: User;
  assignedSubjects?: {
    id: string;
    subjectId: string;
    subject?: Subject;
    academicSessionId: string;
  }[];
}

export interface Student {
  id: string;
  userId: string;
  rollNumber: string;
  registrationNumber: string;
  firstName: string;
  lastName: string;
  phone?: string;
  departmentId: string;
  courseId: string;
  currentSemesterId: string;
  academicSessionId: string;
  department?: Department;
  course?: Course;
  currentSemester?: Semester;
  academicSession?: AcademicSession;
  user?: User;
}

// Examination
export interface Examination {
  id: string; // Authoritative Test UUID
  title: string;
  examinationCode: string;
  description?: string;
  departmentId: string;
  courseId: string;
  semesterId: string;
  subjectId: string;
  academicSessionId: string;
  createdByFacultyId: string;
  examinationType: ExaminationType;
  status: ExaminationStatus;
  startWindow: string;
  endWindow: string;
  durationMinutes: number;
  totalMarks: number;
  passingMarks: number;
  maxAttempts: number;
  randomizeQuestions: boolean;
  randomizeOptions: boolean;
  negativeMarkingType: NegativeMarkingType;
  negativeMarkingValue: number;
  allowNegativeMarksBelowZero: boolean;
  instructions?: string;
  createdAt?: string;
  department?: Department;
  course?: Course;
  semester?: Semester;
  subject?: Subject;
  academicSession?: AcademicSession;
  createdByFaculty?: Faculty;
  questionsCount?: number;
  attemptsCount?: number;
}

// Questions
export interface QuestionOption {
  id: string;
  questionId: string;
  optionLabel: string; // 'A' | 'B' | 'C' | 'D'
  optionText: string;
  isCorrect?: boolean; // Stripped in student view
  optionOrder: number;
}

export interface Question {
  id: string;
  testId: string;
  questionText: string;
  questionType: QuestionType;
  marks: number;
  negativeMarks: number;
  topic?: string;
  difficulty: DifficultyLevel;
  questionOrder: number;
  answerInstructions?: string;
  evaluationCriteria?: string;
  expectedAnswer?: string;
  options?: QuestionOption[];
}

// Zero-Storage Question Imports
export interface QuestionImport {
  id: string;
  testId: string;
  filename: string;
  fileFormat: string;
  totalQuestions: number;
  validQuestions: number;
  invalidQuestions: number;
  status: 'PENDING' | 'VALIDATED' | 'CONFIRMED' | 'REJECTED' | 'CANCELLED';
  createdAt: string;
}

export interface QuestionImportItem {
  id: string;
  importId: string;
  questionNumber: number;
  questionType: QuestionType;
  questionText: string;
  marks: number;
  negativeMarks: number;
  optionsJson?: { label: string; text: string; isCorrect: boolean }[];
  correctAnswer?: string;
  isValid: boolean;
  validationErrors?: string[];
}

// Student Attempt & Taking
export interface ExamAttempt {
  id: string;
  testId: string;
  studentId: string;
  attemptNumber: number;
  startedAt: string;
  expiresAt: string;
  submittedAt?: string;
  status: AttemptStatus;
  remainingSeconds: number;
  examination?: Examination;
  questions?: AttemptQuestion[];
}

export interface AttemptQuestion {
  id: string;
  attemptId: string;
  questionId: string;
  displayOrder: number;
  status: QuestionAttemptStatus;
  question: {
    id: string;
    questionText: string;
    questionType: QuestionType;
    marks: number;
    negativeMarks: number;
    topic?: string;
    difficulty: DifficultyLevel;
    options?: {
      id: string;
      optionLabel: string;
      optionText: string;
    }[];
  };
  studentAnswer?: {
    id?: string;
    selectedOptionId?: string;
    descriptiveAnswerText?: string;
    isAnswered: boolean;
  };
}

export interface StudentAnswer {
  id: string;
  attemptId: string;
  testId: string;
  questionId: string;
  selectedOptionId?: string;
  descriptiveAnswerText?: string;
  isAnswered: boolean;
  isCorrect?: boolean;
  marksAwarded?: number;
  negativeMarksDeducted?: number;
  evaluatedAt?: string;
  question?: Question;
}

// Descriptive Evaluations
export interface DescriptiveEvaluation {
  id: string;
  testId: string;
  studentAnswerId: string;
  assignedFacultyId: string;
  maximumMarks: number;
  marksAwarded?: number;
  feedback?: string;
  status: EvaluationStatus;
  evaluatedAt?: string;
  studentAnswer?: {
    id: string;
    descriptiveAnswerText: string;
    question: {
      id: string;
      questionText: string;
      maximumMarks: number;
      evaluationCriteria?: string;
      expectedAnswer?: string;
    };
    attempt?: {
      id: string;
      submittedAt: string;
      student: {
        id: string;
        rollNumber: string;
        firstName: string;
        lastName: string;
      };
    };
  };
}

// Results
export interface Result {
  id: string;
  testId: string;
  studentId: string;
  attemptId: string;
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  unansweredCount: number;
  mcqMarksAwarded: number;
  negativeMarksDeducted: number;
  netMcqScore: number;
  descriptiveScore: number;
  finalMarks: number;
  maximumMarks: number;
  percentage: number;
  grade: string;
  passFailStatus: PassFailStatus;
  status: ResultStatus;
  rank?: number;
  calculatedAt: string;
  releasedAt?: string;
  examination?: Examination;
  student?: Student;
}

// Dashboard statistics
export interface AdminDashboardData {
  totalStudents: number;
  totalFaculty: number;
  totalExaminations: number;
  publishedExaminations: number;
  upcomingExaminations: number;
  completedExaminations: number;
  passPercentageOverall?: number;
  examinationActivity?: { date: string; examinations: number; submissions: number }[];
  departmentStats?: { department: string; students: number; faculty: number }[];
  examinationPerformance?: { name: string; avgScore: number; passRate: number }[];
}

export interface FacultyDashboardData {
  totalCreatedExaminations: number;
  publishedExaminations: number;
  upcomingExaminations: number;
  completedExaminations: number;
  totalStudentSubmissions: number;
  pendingDescriptiveEvaluations: number;
  assignedSubjects?: Subject[];
}

export interface StudentDashboardData {
  upcomingCount: number;
  activeCount: number;
  completedCount: number;
  averageScore?: number;
  eligibleExaminations: Examination[];
  recentResults: Result[];
}

// Notifications & Audit Logs
export interface NotificationItem {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  metadata?: Record<string, unknown>;
}

export interface AuditLogItem {
  id: string;
  userId?: string;
  action: string;
  entityType: string;
  entityId?: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
  user?: {
    id: string;
    username: string;
    email: string;
    role: UserRole;
  };
}
