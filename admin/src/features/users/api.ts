import { apiClient } from '@/lib/api-client';
import type { ApiResponse, PaginatedResponse, User } from '@/types';

export const usersApi = {
  getAll: (page = 1, limit = 20) =>
    apiClient.get<PaginatedResponse<User>>('/users', { params: { page, limit } }).then((r) => r.data),

  getById: (id: string) =>
    apiClient.get<ApiResponse<User>>(`/users/${id}`).then((r) => r.data),

  ban: (id: string) =>
    apiClient.patch<ApiResponse<User>>(`/users/${id}/ban`).then((r) => r.data),

  unban: (id: string) =>
    apiClient.patch<ApiResponse<User>>(`/users/${id}/unban`).then((r) => r.data),
};
