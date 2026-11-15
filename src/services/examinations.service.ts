import { api } from './api';
import { ApiResponse, Examination, ExaminationStatus, Student } from '../types';

export const examinationsService = {
  async createExamination(data: any): Promise<Examination> {
    const res = await api.post<ApiResponse<Examination>>('/examinations', data);
    return res.data.data;
  },

  async getExaminations(params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: ExaminationStatus;
    departmentId?: string;
    courseId?: string;
    subjectId?: string;
    facultyId?: string;
  }): Promise<{ items: Examination[]; total: number }> {
    const res = await api.get<ApiResponse<Examination[]>>('/examinations', { params });
    return {
      items: res.data.data || [],
      total: res.data.meta?.total || (res.data.data ? res.data.data.length : 0),
    };
  },

  async getExaminationById(testId: string): Promise<Examination> {
    const res = await api.get<ApiResponse<Examination>>(`/examinations/${testId}`);
    return res.data.data;
  },

  async updateExamination(testId: string, data: Partial<Examination>): Promise<Examination> {
    const res = await api.patch<ApiResponse<Examination>>(`/examinations/${testId}`, data);
    return res.data.data;
  },

  async deleteExamination(testId: string): Promise<void> {
    await api.delete(`/examinations/${testId}`);
  },

  async publishExamination(testId: string): Promise<Examination> {
    const res = await api.post<ApiResponse<Examination>>(`/examinations/${testId}/publish`);
    return res.data.data;
  },

  async scheduleExamination(testId: string): Promise<Examination> {
    const res = await api.post<ApiResponse<Examination>>(`/examinations/${testId}/schedule`);
    return res.data.data;
  },

  async cancelExamination(testId: string, reason?: string): Promise<Examination> {
    const res = await api.post<ApiResponse<Examination>>(`/examinations/${testId}/cancel`, { reason });
    return res.data.data;
  },

  async getPreview(testId: string): Promise<{
    examination: Examination;
    questions: any[];
    totalMarks: number;
    questionCount: number;
  }> {
    const res = await api.get<ApiResponse<any>>(`/examinations/${testId}/preview`);
    return res.data.data;
  },

  async getStatistics(testId: string): Promise<any> {
    const res = await api.get<ApiResponse<any>>(`/examinations/${testId}/statistics`);
    return res.data.data;
  },

  async getEligibleStudents(testId: string): Promise<Student[]> {
    const res = await api.get<ApiResponse<Student[]>>(`/examinations/${testId}/eligible-students`);
    return res.data.data || [];
  },

  async addEligibleStudents(
    testId: string,
    data: { studentIds?: string[]; courseId?: string; semesterId?: string },
  ): Promise<any> {
    const res = await api.post<ApiResponse<any>>(`/examinations/${testId}/eligible-students`, data);
    return res.data.data;
  },

  async removeEligibleStudent(testId: string, studentId: string): Promise<void> {
    await api.delete(`/examinations/${testId}/eligible-students/${studentId}`);
  },

  async assignFaculty(
    testId: string,
    data: { facultyId: string; role: 'INVIGILATOR' | 'EVALUATOR' },
  ): Promise<any> {
    const res = await api.post<ApiResponse<any>>(`/examinations/${testId}/assign-faculty`, data);
    return res.data.data;
  },
};
