import { api } from './api';
import { ApiResponse, AttemptQuestion, ExamAttempt, Examination } from '../types';

export const examAttemptsService = {
  async getInstructions(testId: string): Promise<{
    examination: Examination;
    eligible: boolean;
    reason?: string;
    existingAttempt?: ExamAttempt;
  }> {
    const res = await api.get<ApiResponse<any>>(`/student/examinations/${testId}/instructions`);
    return res.data.data;
  },

  async startExam(testId: string): Promise<ExamAttempt> {
    const res = await api.post<ApiResponse<ExamAttempt>>(`/student/examinations/${testId}/start`);
    return res.data.data;
  },

  async getAttemptQuestions(attemptId: string): Promise<AttemptQuestion[]> {
    const res = await api.get<ApiResponse<AttemptQuestion[]>>(
      `/student/attempts/${attemptId}/questions`,
    );
    return res.data.data || [];
  },

  async getAttemptStatus(attemptId: string): Promise<{
    attemptId: string;
    status: string;
    remainingSeconds: number;
    isExpired: boolean;
  }> {
    const res = await api.get<ApiResponse<any>>(`/student/attempts/${attemptId}/status`);
    return res.data.data;
  },

  async saveAnswer(
    attemptId: string,
    questionId: string,
    data: {
      selectedOptionId?: string;
      descriptiveAnswerText?: string;
      status?: string;
    },
  ): Promise<any> {
    const res = await api.put<ApiResponse<any>>(
      `/student/attempts/${attemptId}/answers/${questionId}`,
      data,
    );
    return res.data.data;
  },

  async saveBulkAnswers(
    attemptId: string,
    answers: Array<{
      questionId: string;
      selectedOptionId?: string;
      descriptiveAnswerText?: string;
      status?: string;
    }>,
  ): Promise<any> {
    const res = await api.post<ApiResponse<any>>(`/student/attempts/${attemptId}/answers/bulk`, {
      answers,
    });
    return res.data.data;
  },

  async submitExam(attemptId: string): Promise<any> {
    const res = await api.post<ApiResponse<any>>(`/student/attempts/${attemptId}/submit`);
    return res.data.data;
  },

  async getStudentHistory(): Promise<ExamAttempt[]> {
    const res = await api.get<ApiResponse<ExamAttempt[]>>('/student/examination-history');
    return res.data.data || [];
  },
};
