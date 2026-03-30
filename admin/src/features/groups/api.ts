import { apiClient } from '@/lib/api-client';
import type { ApiResponse, PaginatedResponse, Group } from '@/types';

export const groupsApi = {
  getAll: (page = 1, limit = 20) =>
    apiClient.get<PaginatedResponse<Group>>('/groups', { params: { page, limit } }).then((r) => r.data),

  delete: (id: string) =>
    apiClient.delete<ApiResponse<null>>(`/groups/${id}`).then((r) => r.data),
};
