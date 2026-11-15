import { api } from './api';
import { ApiResponse, DescriptiveEvaluation } from '../types';

export const evaluationsService = {
  async getPendingEvaluations(params?: {
    page?: number;
    limit?: number;
    testId?: string;
  }): Promise<{ items: DescriptiveEvaluation[]; total: number }> {
    const res = await api.get<ApiResponse<DescriptiveEvaluation[]>>('/evaluations/pending', {
      params,
    });
    return {
      items: res.data.data || [],
      total: res.data.meta?.total || (res.data.data ? res.data.data.length : 0),
    };
  },

  async getStatistics(): Promise<{
    pendingCount: number;
    completedCount: number;
    totalCount: number;
  }> {
    const res = await api.get<ApiResponse<any>>('/evaluations/statistics');
    return res.data.data;
  },

  async findByAttemptId(attemptId: string): Promise<DescriptiveEvaluation[]> {
    const res = await api.get<ApiResponse<DescriptiveEvaluation[]>>(
      `/evaluations/attempts/${attemptId}`,
    );
    return res.data.data || [];
  },

  async findById(id: string): Promise<DescriptiveEvaluation> {
    const res = await api.get<ApiResponse<DescriptiveEvaluation>>(`/evaluations/${id}`);
    return res.data.data;
  },

  async evaluateAnswer(
    answerId: string,
    data: { marksAwarded: number; feedback?: string },
  ): Promise<DescriptiveEvaluation> {
    const res = await api.post<ApiResponse<DescriptiveEvaluation>>(`/evaluations/${answerId}`, data);
    return res.data.data;
  },

  async updateEvaluation(
    evaluationId: string,
    data: { marksAwarded: number; feedback?: string },
  ): Promise<DescriptiveEvaluation> {
    const res = await api.patch<ApiResponse<DescriptiveEvaluation>>(
      `/evaluations/${evaluationId}`,
      data,
    );
    return res.data.data;
  },
};
