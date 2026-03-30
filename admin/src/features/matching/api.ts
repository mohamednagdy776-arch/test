import { apiClient } from '@/lib/api-client';
import type { ApiResponse, PaginatedResponse, Match } from '@/types';

export const matchingApi = {
  getAll: (page = 1, limit = 20) =>
    apiClient.get<PaginatedResponse<Match>>('/matches', { params: { page, limit } }).then((r) => r.data),

  getById: (id: string) =>
    apiClient.get<ApiResponse<Match>>(`/matches/${id}`).then((r) => r.data),
};
