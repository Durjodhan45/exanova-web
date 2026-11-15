import { api } from './api';
import { ApiResponse, User, UserRole, UserStatus } from '../types';

export const usersService = {
  async getUsers(params?: {
    page?: number;
    limit?: number;
    search?: string;
    role?: UserRole;
    status?: UserStatus;
  }): Promise<{ items: User[]; total: number }> {
    const res = await api.get<ApiResponse<User[]>>('/admin/users', { params });
    return {
      items: res.data.data || [],
      total: res.data.meta?.total || (res.data.data ? res.data.data.length : 0),
    };
  },

  async getUserById(id: string): Promise<User> {
    const res = await api.get<ApiResponse<User>>(`/admin/users/${id}`);
    return res.data.data;
  },

  async createUser(data: {
    username: string;
    email: string;
    password?: string;
    role: UserRole;
  }): Promise<User> {
    const res = await api.post<ApiResponse<User>>('/admin/users', data);
    return res.data.data;
  },

  async updateUser(id: string, data: Partial<User>): Promise<User> {
    const res = await api.patch<ApiResponse<User>>(`/admin/users/${id}`, data);
    return res.data.data;
  },

  async updateUserStatus(id: string, status: UserStatus): Promise<User> {
    const res = await api.patch<ApiResponse<User>>(`/admin/users/${id}/status`, { status });
    return res.data.data;
  },

  async resetPassword(id: string, newPassword?: string): Promise<{ temporaryPassword?: string }> {
    const res = await api.post<ApiResponse<{ temporaryPassword?: string }>>(
      `/admin/users/${id}/reset-password`,
      { newPassword },
    );
    return res.data.data;
  },

  async exportUsers(): Promise<User[]> {
    const res = await api.get<ApiResponse<User[]>>('/admin/users/export');
    return res.data.data || [];
  },
};
