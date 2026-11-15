import { api } from './api';
import { ApiResponse, AuthResponse, User } from '../types';

export const authService = {
  async login(identifier: string, password: string):Promise<AuthResponse> {
    const res = await api.post<ApiResponse<AuthResponse>>('/auth/login', {
      identifier,
      password,
    });
    return res.data.data;
  },

  async getMe(): Promise<User> {
    const res = await api.get<ApiResponse<User>>('/auth/me');
    return res.data.data;
  },

  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } catch {
      // Ignored if session already expired
    }
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await api.post('/auth/change-password', {
      currentPassword,
      newPassword,
    });
  },

  async forgotPassword(email: string): Promise<{ message: string }> {
    const res = await api.post<ApiResponse<{ message: string }>>('/auth/forgot-password', { email });
    return res.data.data;
  },

  async resetPassword(token: string, newPassword: string): Promise<void> {
    await api.post('/auth/reset-password', { token, newPassword });
  },

  async getSessions(): Promise<any[]> {
    const res = await api.get<ApiResponse<any[]>>('/auth/sessions');
    return res.data.data || [];
  },

  async deleteSession(sessionId: string): Promise<void> {
    await api.delete(`/auth/sessions/${sessionId}`);
  },
};
