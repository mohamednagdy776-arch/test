import { apiClient } from '@/lib/api-client';

export interface Page {
  id: string;
  name: string;
  description: string;
  category: string;
  ownerId: string;
  isVerified: boolean;
  followersCount: number;
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

export const pagesApi = {
  getAll: (page = 1, limit = 20) =>
    apiClient.get<PaginatedResponse<Page>>('/pages', { params: { page, limit } }).then((r) => r.data),

  delete: (id: string) =>
    apiClient.delete<ApiResponse<null>>(`/pages/${id}`).then((r) => r.data),

  verify: (id: string) =>
    apiClient.patch<ApiResponse<Page>>(`/pages/${id}/verify`).then((r) => r.data),
};
