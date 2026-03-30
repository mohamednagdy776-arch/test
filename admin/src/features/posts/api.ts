import { apiClient } from '@/lib/api-client';
import type { ApiResponse, PaginatedResponse, Post } from '@/types';

export const postsApi = {
  getAll: (page = 1, limit = 20) =>
    apiClient.get<PaginatedResponse<Post>>('/posts', { params: { page, limit } }).then((r) => r.data),

  delete: (id: string) =>
    apiClient.delete<ApiResponse<null>>(`/posts/${id}`).then((r) => r.data),
};
