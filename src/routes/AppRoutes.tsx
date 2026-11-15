import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

// Public & Auth Pages
import { LandingPage } from '../pages/public/LandingPage';
import { LoginPage } from '../pages/auth/LoginPage';
import { ChangePasswordPage } from '../pages/auth/ChangePasswordPage';
import { ForgotPasswordPage } from '../pages/auth/ForgotPasswordPage';
import { NotFoundPage } from '../pages/common/NotFoundPage';
import { ProfilePage } from '../pages/common/ProfilePage';

// Admin Pages
import { AdminDashboardPage } from '../pages/admin/AdminDashboardPage';
import { UserManagementPage } from '../pages/admin/UserManagementPage';
import { StudentManagementPage } from '../pages/admin/StudentManagementPage';
import { FacultyManagementPage } from '../pages/admin/FacultyManagementPage';
import { AcademicManagementPage } from '../pages/admin/AcademicManagementPage';
import { ExaminationListPage } from '../pages/admin/ExaminationListPage';
import { ResultsManagementPage } from '../pages/admin/ResultsManagementPage';
import { ReportsPage } from '../pages/admin/ReportsPage';
import { AuditLogsPage } from '../pages/admin/AuditLogsPage';

// Faculty Pages
import { FacultyDashboardPage } from '../pages/faculty/FacultyDashboardPage';
import { CreateExaminationPage } from '../pages/faculty/CreateExaminationPage';
import { MyExaminationsPage } from '../pages/faculty/MyExaminationsPage';
import { QuestionManagementPage } from '../pages/faculty/QuestionManagementPage';
import { QuestionImportPage } from '../pages/faculty/QuestionImportPage';
import { DescriptiveEvaluationPage } from '../pages/faculty/DescriptiveEvaluationPage';
import { FacultyResultsPage } from '../pages/faculty/FacultyResultsPage';

// Student Pages
import { StudentDashboardPage } from '../pages/student/StudentDashboardPage';
import { AvailableExaminationsPage } from '../pages/student/AvailableExaminationsPage';
import { OnlineExamTakingPage } from '../pages/student/OnlineExamTakingPage';
import { StudentResultsPage } from '../pages/student/StudentResultsPage';
import { StudentProfilePage } from '../pages/student/StudentProfilePage';

// Guard Component
interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  withDashboardLayout?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
  withDashboardLayout = true,
}) => {
  const { isAuthenticated, isLoading, role, mustChangePassword } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <LoadingSpinner message="Authenticating session..." minHeight="100vh" />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Mandatory password change requirement:
  if (mustChangePassword && location.pathname !== '/change-password') {
    return <Navigate to="/change-password" replace />;
  }

  // Role validation
  if (allowedRoles && role && !allowedRoles.includes(role)) {
    // Redirect to respective dashboard if trying to access unauthorized area
    if (role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />;
    if (role === 'FACULTY') return <Navigate to="/faculty/dashboard" replace />;
    return <Navigate to="/student/dashboard" replace />;
  }

  if (withDashboardLayout) {
    return <DashboardLayout>{children}</DashboardLayout>;
  }

  return <>{children}</>;
};

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Pages */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />

      {/* Mandatory / Voluntary Password Update */}
      <Route
        path="/change-password"
        element={
          <ProtectedRoute withDashboardLayout={false}>
            <ChangePasswordPage />
          </ProtectedRoute>
        }
      />

      {/* Admin Protected Routes */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminDashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <UserManagementPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/students"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <StudentManagementPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/faculty"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <FacultyManagementPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/academic"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AcademicManagementPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/examinations"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <ExaminationListPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/results"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <ResultsManagementPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/reports"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <ReportsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/audit-logs"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AuditLogsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/profile"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <ProfilePage />
          </ProtectedRoute>
        }
      />

      {/* Faculty Protected Routes */}
      <Route
        path="/faculty/dashboard"
        element={
          <ProtectedRoute allowedRoles={['FACULTY']}>
            <FacultyDashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/faculty/examinations"
        element={
          <ProtectedRoute allowedRoles={['FACULTY']}>
            <MyExaminationsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/faculty/examinations/create"
        element={
          <ProtectedRoute allowedRoles={['FACULTY', 'ADMIN']}>
            <CreateExaminationPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/faculty/examinations/:testId/questions"
        element={
          <ProtectedRoute allowedRoles={['FACULTY', 'ADMIN']}>
            <QuestionManagementPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/faculty/import"
        element={
          <ProtectedRoute allowedRoles={['FACULTY', 'ADMIN']}>
            <QuestionImportPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/faculty/evaluations"
        element={
          <ProtectedRoute allowedRoles={['FACULTY', 'ADMIN']}>
            <DescriptiveEvaluationPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/faculty/results"
        element={
          <ProtectedRoute allowedRoles={['FACULTY', 'ADMIN']}>
            <FacultyResultsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/faculty/reports"
        element={
          <ProtectedRoute allowedRoles={['FACULTY', 'ADMIN']}>
            <ReportsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/faculty/profile"
        element={
          <ProtectedRoute allowedRoles={['FACULTY']}>
            <ProfilePage />
          </ProtectedRoute>
        }
      />

      {/* Student Protected Routes */}
      <Route
        path="/student/dashboard"
        element={
          <ProtectedRoute allowedRoles={['STUDENT']}>
            <StudentDashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/examinations"
        element={
          <ProtectedRoute allowedRoles={['STUDENT']}>
            <AvailableExaminationsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/history"
        element={
          <ProtectedRoute allowedRoles={['STUDENT']}>
            <AvailableExaminationsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/results"
        element={
          <ProtectedRoute allowedRoles={['STUDENT']}>
            <StudentResultsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/profile"
        element={
          <ProtectedRoute allowedRoles={['STUDENT']}>
            <StudentProfilePage />
          </ProtectedRoute>
        }
      />

      {/* Online Examination Taking (Distraction-Free Fullscreen, without Dashboard Layout) */}
      <Route
        path="/student/exam/:testId"
        element={
          <ProtectedRoute allowedRoles={['STUDENT']} withDashboardLayout={false}>
            <OnlineExamTakingPage />
          </ProtectedRoute>
        }
      />

      {/* 404 Fallback */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};
