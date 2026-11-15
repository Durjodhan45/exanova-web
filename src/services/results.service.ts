import { api } from './api';
import { ApiResponse, Result, ResultStatus } from '../types';

export const resultsService = {
  async getResults(params?: {
    page?: number;
    limit?: number;
    testId?: string;
    studentId?: string;
    status?: ResultStatus;
  }): Promise<{ items: Result[]; total: number }> {
    const res = await api.get<ApiResponse<Result[]>>('/results', { params });
    return {
      items: res.data.data || [],
      total: res.data.meta?.total || (res.data.data ? res.data.data.length : 0),
    };
  },

  async getByTestId(testId: string): Promise<Result[]> {
    const res = await api.get<ApiResponse<Result[]>>(`/results/examinations/${testId}`);
    return res.data.data || [];
  },

  async getStatistics(testId: string): Promise<any> {
    const res = await api.get<ApiResponse<any>>(`/results/examinations/${testId}/statistics`);
    return res.data.data;
  },

  async getRankList(testId: string): Promise<Result[]> {
    const res = await api.get<ApiResponse<Result[]>>(`/results/examinations/${testId}/rank-list`);
    return res.data.data || [];
  },

  async calculateResults(testId: string): Promise<any> {
    const res = await api.post<ApiResponse<any>>(`/results/examinations/${testId}/calculate`);
    return res.data.data;
  },

  async releaseResults(testId: string, remarks?: string): Promise<any> {
    const res = await api.post<ApiResponse<any>>(`/results/examinations/${testId}/release`, {
      remarks,
    });
    return res.data.data;
  },

  async withholdResults(testId: string): Promise<any> {
    const res = await api.post<ApiResponse<any>>(`/results/examinations/${testId}/withhold`);
    return res.data.data;
  },

  async getResultById(id: string): Promise<Result> {
    const res = await api.get<ApiResponse<Result>>(`/results/${id}`);
    return res.data.data;
  },

  async downloadScorecardPdf(resultId: string): Promise<Blob> {
    const res = await api.get(`/results/${resultId}/scorecard`, {
      responseType: 'blob',
    });
    return res.data;
  },
};
