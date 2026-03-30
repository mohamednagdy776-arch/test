import { apiClient } from '@/lib/api-client';
import type { PaginatedResponse } from '@/types';

export interface Report {
  id: string;
  reportedBy: string;
  targetType: 'user' | 'post' | 'group';
  targetId: string;
  reason: string;
  status: 'pending' | 'resolved' | 'dismissed';
  createdAt: string;
}

export const reportsApi = {
  getAll: (page = 1, limit = 20) =>
    apiClient.get<PaginatedResponse<Report>>('/reports', { params: { page, limit } }).then((r) => r.data),

  resolve: (id: string) =>
    apiClient.patch(`/reports/${id}/resolve`).then((r) => r.data),

  dismiss: (id: string) =>
    apiClient.patch(`/reports/${id}/dismiss`).then((r) => r.data),
};
