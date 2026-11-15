import { api } from './api';
import { ApiResponse, Student } from '../types';

export const studentsService = {
  async getStudents(params?: {
    page?: number;
    limit?: number;
    search?: string;
    departmentId?: string;
    courseId?: string;
    semesterId?: string;
  }): Promise<{ items: Student[]; total: number }> {
    const res = await api.get<ApiResponse<Student[]>>('/students', { params });
    return {
      items: res.data.data || [],
      total: res.data.meta?.total || (res.data.data ? res.data.data.length : 0),
    };
  },

  async getStudentById(id: string): Promise<Student> {
    const res = await api.get<ApiResponse<Student>>(`/students/${id}`);
    return res.data.data;
  },

  async createStudent(data: {
    rollNumber: string;
    registrationNumber: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    departmentId: string;
    courseId: string;
    currentSemesterId: string;
    academicSessionId: string;
  }): Promise<Student> {
    const res = await api.post<ApiResponse<Student>>('/students', data);
    return res.data.data;
  },

  async updateStudent(id: string, data: Partial<Student>): Promise<Student> {
    const res = await api.patch<ApiResponse<Student>>(`/students/${id}`, data);
    return res.data.data;
  },

  async downloadImportTemplate(): Promise<Blob> {
    const res = await api.get('/admin/students/import/template', {
      responseType: 'blob',
    });
    return res.data;
  },

  async bulkImportStudents(formData: FormData): Promise<{
    imported: number;
    failed: number;
    errors?: Array<{ row: number; error: string }>;
  }> {
    const res = await api.post<
      ApiResponse<{ imported: number; failed: number; errors?: Array<{ row: number; error: string }> }>
    >('/admin/students/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data.data;
  },

  async getMyProfile(): Promise<Student> {
    const res = await api.get<ApiResponse<Student>>('/student/profile');
    return res.data.data;
  },

  async updateMyProfile(data: { phone?: string }): Promise<Student> {
    const res = await api.patch<ApiResponse<Student>>('/student/profile', data);
    return res.data.data;
  },
};
