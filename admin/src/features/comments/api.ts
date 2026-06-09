import { apiClient } from '@/lib/api-client';

export interface Comment {
  id: string;
  postId: string;
  userId: string;
  content: string;
  parentId?: string;
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

export const commentsApi = {
  getAll: (page = 1, limit = 20) =>
    apiClient.get<PaginatedResponse<Comment>>('/comments', { params: { page, limit } }).then((r) => r.data),

  delete: (id: string) =>
    apiClient.delete<ApiResponse<null>>(`/comments/${id}`).then((r) => r.data),
};
