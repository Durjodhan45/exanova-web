import { api } from './api';
import {
  AcademicSession,
  ApiResponse,
  Course,
  Department,
  Semester,
  Subject,
} from '../types';

export const academicService = {
  // Departments
  async getDepartments(): Promise<Department[]> {
    const res = await api.get<ApiResponse<Department[]>>('/departments');
    return res.data.data || [];
  },

  async createDepartment(data: { name: string; code: string; description?: string }): Promise<Department> {
    const res = await api.post<ApiResponse<Department>>('/departments', data);
    return res.data.data;
  },

  async updateDepartment(id: string, data: Partial<Department>): Promise<Department> {
    const res = await api.patch<ApiResponse<Department>>(`/departments/${id}`, data);
    return res.data.data;
  },

  async deleteDepartment(id: string): Promise<void> {
    await api.delete(`/departments/${id}`);
  },

  // Courses
  async getCourses(departmentId?: string): Promise<Course[]> {
    const res = await api.get<ApiResponse<Course[]>>('/courses', {
      params: departmentId ? { departmentId } : {},
    });
    return res.data.data || [];
  },

  async createCourse(data: {
    name: string;
    code: string;
    durationYears: number;
    totalSemesters: number;
    departmentId: string;
  }): Promise<Course> {
    const res = await api.post<ApiResponse<Course>>('/courses', data);
    return res.data.data;
  },

  async updateCourse(id: string, data: Partial<Course>): Promise<Course> {
    const res = await api.patch<ApiResponse<Course>>(`/courses/${id}`, data);
    return res.data.data;
  },

  async deleteCourse(id: string): Promise<void> {
    await api.delete(`/courses/${id}`);
  },

  // Semesters
  async getSemesters(courseId?: string): Promise<Semester[]> {
    const res = await api.get<ApiResponse<Semester[]>>('/semesters', {
      params: courseId ? { courseId } : {},
    });
    return res.data.data || [];
  },

  // Subjects
  async getSubjects(params?: {
    courseId?: string;
    semesterId?: string;
    departmentId?: string;
  }): Promise<Subject[]> {
    const res = await api.get<ApiResponse<Subject[]>>('/subjects', { params });
    return res.data.data || [];
  },

  async createSubject(data: {
    name: string;
    code: string;
    credits: number;
    description?: string;
    courseId: string;
    semesterId: string;
  }): Promise<Subject> {
    const res = await api.post<ApiResponse<Subject>>('/subjects', data);
    return res.data.data;
  },

  async updateSubject(id: string, data: Partial<Subject>): Promise<Subject> {
    const res = await api.patch<ApiResponse<Subject>>(`/subjects/${id}`, data);
    return res.data.data;
  },

  async deleteSubject(id: string): Promise<void> {
    await api.delete(`/subjects/${id}`);
  },

  // Academic Sessions
  async getAcademicSessions(): Promise<AcademicSession[]> {
    const res = await api.get<ApiResponse<AcademicSession[]>>('/academic-sessions');
    return res.data.data || [];
  },

  async createAcademicSession(data: {
    name: string;
    startDate: string;
    endDate: string;
    isCurrent?: boolean;
  }): Promise<AcademicSession> {
    const res = await api.post<ApiResponse<AcademicSession>>('/academic-sessions', data);
    return res.data.data;
  },

  async activateAcademicSession(id: string): Promise<AcademicSession> {
    const res = await api.patch<ApiResponse<AcademicSession>>(`/academic-sessions/${id}/activate`);
    return res.data.data;
  },

  async updateAcademicSession(id: string, data: Partial<AcademicSession>): Promise<AcademicSession> {
    const res = await api.patch<ApiResponse<AcademicSession>>(`/academic-sessions/${id}`, data);
    return res.data.data;
  },
};
