import { apiClient } from '@/lib/api-client';

export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const notificationsApi = {
  getAll: (page = 1, limit = 20) =>
    apiClient.get<PaginatedResponse<Notification>>('/notifications', { params: { page, limit } }).then((r) => r.data),

  markAsRead: (id: string) =>
    apiClient.patch<ApiResponse<null>>(`/notifications/${id}/read`).then((r) => r.data),

  delete: (id: string) =>
    apiClient.delete<ApiResponse<null>>(`/notifications/${id}`).then((r) => r.data),
};
