import { api } from './api';
import { ApiResponse, Faculty, Subject } from '../types';

export const facultyService = {
  async getFacultyList(params?: {
    page?: number;
    limit?: number;
    search?: string;
    departmentId?: string;
  }): Promise<{ items: Faculty[]; total: number }> {
    const res = await api.get<ApiResponse<Faculty[]>>('/faculty', { params });
    return {
      items: res.data.data || [],
      total: res.data.meta?.total || (res.data.data ? res.data.data.length : 0),
    };
  },

  async getFacultyById(id: string): Promise<Faculty> {
    const res = await api.get<ApiResponse<Faculty>>(`/faculty/${id}`);
    return res.data.data;
  },

  async createFaculty(data: {
    employeeId: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    designation: string;
    departmentId: string;
  }): Promise<Faculty> {
    const res = await api.post<ApiResponse<Faculty>>('/faculty', data);
    return res.data.data;
  },

  async updateFaculty(id: string, data: Partial<Faculty>): Promise<Faculty> {
    const res = await api.patch<ApiResponse<Faculty>>(`/faculty/${id}`, data);
    return res.data.data;
  },

  async getMySubjects(): Promise<Subject[]> {
    const res = await api.get<ApiResponse<Subject[]>>('/faculty/my-subjects');
    return res.data.data || [];
  },

  async assignSubject(data: {
    facultyId: string;
    subjectId: string;
    academicSessionId: string;
  }): Promise<any> {
    const res = await api.post<ApiResponse<any>>('/faculty/assign-subject', data);
    return res.data.data;
  },

  async unassignSubject(assignmentId: string): Promise<void> {
    await api.delete(`/faculty/unassign-subject/${assignmentId}`);
  },
};
