import { api } from './api';
import { ApiResponse, Question, QuestionType } from '../types';

export const questionsService = {
  async createQuestion(data: any): Promise<Question> {
    const res = await api.post<ApiResponse<Question>>('/questions', data);
    return res.data.data;
  },

  async createBulk(data: { testId: string; questions: any[] }): Promise<Question[]> {
    const res = await api.post<ApiResponse<Question[]>>('/questions/bulk', data);
    return res.data.data || [];
  },

  async getQuestions(params?: {
    testId?: string;
    questionType?: QuestionType;
    page?: number;
    limit?: number;
  }): Promise<{ items: Question[]; total: number }> {
    const res = await api.get<ApiResponse<Question[]>>('/questions', { params });
    return {
      items: res.data.data || [],
      total: res.data.meta?.total || (res.data.data ? res.data.data.length : 0),
    };
  },

  async getQuestionById(id: string): Promise<Question> {
    const res = await api.get<ApiResponse<Question>>(`/questions/${id}`);
    return res.data.data;
  },

  async updateQuestion(id: string, data: any): Promise<Question> {
    const res = await api.patch<ApiResponse<Question>>(`/questions/${id}`, data);
    return res.data.data;
  },

  async deleteQuestion(id: string): Promise<void> {
    await api.delete(`/questions/${id}`);
  },

  async duplicateQuestion(id: string): Promise<Question> {
    const res = await api.post<ApiResponse<Question>>(`/questions/${id}/duplicate`);
    return res.data.data;
  },

  async reorderQuestions(testId: string, orders: Array<{ questionId: string; order: number }>): Promise<any> {
    const res = await api.patch<ApiResponse<any>>('/questions/reorder', { testId, orders });
    return res.data.data;
  },
};
