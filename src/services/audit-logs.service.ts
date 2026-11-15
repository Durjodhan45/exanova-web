import { api } from './api';
import { ApiResponse, AuditLogItem } from '../types';

export const auditLogsService = {
  async getAuditLogs(params?: {
    page?: number;
    limit?: number;
    action?: string;
    entityType?: string;
    userId?: string;
  }): Promise<{ items: AuditLogItem[]; total: number }> {
    const res = await api.get<ApiResponse<AuditLogItem[]>>('/admin/audit-logs', { params });
    return {
      items: res.data.data || [],
      total: res.data.meta?.total || (res.data.data ? res.data.data.length : 0),
    };
  },
};
