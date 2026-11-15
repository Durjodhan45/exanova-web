import { api } from './api';
import { ApiResponse, QuestionImport, QuestionImportItem } from '../types';

export const questionImportsService = {
  async downloadTemplate(type: 'mcq' | 'descriptive' | 'mixed'): Promise<Blob> {
    const res = await api.get(`/question-imports/templates/${type}`, {
      responseType: 'blob',
    });
    return res.data;
  },

  async uploadQuestions(
    testId: string,
    file: File,
    onProgress?: (percent: number) => void,
  ): Promise<{
    importId: string;
    totalQuestions: number;
    validQuestions: number;
    invalidQuestions: number;
    filename: string;
  }> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('testId', testId);

    const res = await api.post<ApiResponse<any>>('/question-imports/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total && onProgress) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percentCompleted);
        }
      },
    });

    return res.data.data;
  },

  async getImport(importId: string): Promise<QuestionImport> {
    const res = await api.get<ApiResponse<QuestionImport>>(`/question-imports/${importId}`);
    return res.data.data;
  },

  async getPreview(importId: string): Promise<{
    import: QuestionImport;
    items: QuestionImportItem[];
    validCount: number;
    invalidCount: number;
  }> {
    const res = await api.get<ApiResponse<any>>(`/question-imports/${importId}/preview`);
    return res.data.data;
  },

  async getErrors(importId: string): Promise<any[]> {
    const res = await api.get<ApiResponse<any[]>>(`/question-imports/${importId}/errors`);
    return res.data.data || [];
  },

  async updateStagedQuestion(
    importId: string,
    questionId: string,
    data: any,
  ): Promise<QuestionImportItem> {
    const res = await api.patch<ApiResponse<QuestionImportItem>>(
      `/question-imports/${importId}/questions/${questionId}`,
      data,
    );
    return res.data.data;
  },

  async deleteStagedQuestion(importId: string, questionId: string): Promise<void> {
    await api.delete(`/question-imports/${importId}/questions/${questionId}`);
  },

  async confirmImport(importId: string): Promise<{
    testId: string;
    questionsImported: number;
  }> {
    const res = await api.post<ApiResponse<any>>(`/question-imports/${importId}/confirm`);
    return res.data.data;
  },

  async cancelImport(importId: string): Promise<void> {
    await api.post(`/question-imports/${importId}/cancel`);
  },
};
