import { api } from './api';
import { ApiResponse } from '../types';

export const reportsService = {
  async getStudentsReport(params?: any): Promise<any> {
    const res = await api.get<ApiResponse<any>>('/reports/students', { params });
    return res.data.data;
  },

  async getFacultyReport(params?: any): Promise<any> {
    const res = await api.get<ApiResponse<any>>('/reports/faculty', { params });
    return res.data.data;
  },

  async getExaminationsReport(params?: any): Promise<any> {
    const res = await api.get<ApiResponse<any>>('/reports/examinations', { params });
    return res.data.data;
  },

  async getResultsReport(params?: any): Promise<any> {
    const res = await api.get<ApiResponse<any>>('/reports/results', { params });
    return res.data.data;
  },

  async exportExcel(testId?: string): Promise<Blob> {
    const res = await api.get('/reports/results/export/excel', {
      params: testId ? { testId } : {},
      responseType: 'blob',
    });
    return res.data;
  },

  async exportPdf(testId?: string): Promise<Blob> {
    const res = await api.get('/reports/results/export/pdf', {
      params: testId ? { testId } : {},
      responseType: 'blob',
    });
    return res.data;
  },

  async getExamPerformance(testId: string): Promise<any> {
    const res = await api.get<ApiResponse<any>>(`/reports/examinations/${testId}/performance`);
    return res.data.data;
  },

  async getExamSubmissions(testId: string): Promise<any> {
    const res = await api.get<ApiResponse<any>>(`/reports/examinations/${testId}/submissions`);
    return res.data.data;
  },
};
