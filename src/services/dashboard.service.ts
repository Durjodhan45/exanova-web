import { api } from './api';
import {
  AdminDashboardData,
  ApiResponse,
  Examination,
  FacultyDashboardData,
  Result,
  StudentDashboardData,
} from '../types';

export const dashboardService = {
  // Admin
  async getAdminOverview(): Promise<AdminDashboardData> {
    const res = await api.get<ApiResponse<any>>('/dashboard/admin/overview');
    return res.data.data;
  },

  async getAdminExaminationStats(): Promise<any> {
    const res = await api.get<ApiResponse<any>>('/dashboard/admin/examination-statistics');
    return res.data.data;
  },

  async getAdminUserStats(): Promise<any> {
    const res = await api.get<ApiResponse<any>>('/dashboard/admin/user-statistics');
    return res.data.data;
  },

  async getAdminRecentActivities(limit = 10): Promise<any[]> {
    const res = await api.get<ApiResponse<any[]>>('/dashboard/admin/recent-activities', {
      params: { limit },
    });
    return res.data.data || [];
  },

  // Faculty
  async getFacultyOverview(): Promise<FacultyDashboardData> {
    const res = await api.get<ApiResponse<any>>('/dashboard/faculty/overview');
    return res.data.data;
  },

  async getFacultyExaminations(): Promise<Examination[]> {
    const res = await api.get<ApiResponse<Examination[]>>('/dashboard/faculty/examinations');
    return res.data.data || [];
  },

  async getFacultyPendingEvaluations(): Promise<any[]> {
    const res = await api.get<ApiResponse<any[]>>('/dashboard/faculty/pending-evaluations');
    return res.data.data || [];
  },

  // Student
  async getStudentOverview(): Promise<StudentDashboardData> {
    const res = await api.get<ApiResponse<any>>('/dashboard/student/overview');
    return res.data.data;
  },

  async getStudentUpcoming(): Promise<Examination[]> {
    const res = await api.get<ApiResponse<Examination[]>>('/dashboard/student/upcoming-examinations');
    return res.data.data || [];
  },

  async getStudentRecentResults(): Promise<Result[]> {
    const res = await api.get<ApiResponse<Result[]>>('/dashboard/student/recent-results');
    return res.data.data || [];
  },
};
