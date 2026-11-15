import { api } from './api';
import { ApiResponse, NotificationItem } from '../types';

export const notificationsService = {
  async getNotifications(): Promise<NotificationItem[]> {
    const res = await api.get<ApiResponse<NotificationItem[]>>('/notifications');
    return res.data.data || [];
  },

  async markAsRead(id: string): Promise<void> {
    await api.patch(`/notifications/${id}/read`);
  },

  async markAllAsRead(): Promise<void> {
    await api.patch('/notifications/read-all');
  },
};
