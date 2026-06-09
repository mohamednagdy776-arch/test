import { apiClient } from '@/lib/api-client';

export interface Video {
  id: string;
  title: string;
  description?: string;
  url: string;
  thumbnailUrl?: string;
  duration?: number;
  userId: string;
  viewsCount: number;
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

export const videosApi = {
  getAll: (page = 1, limit = 20) =>
    apiClient.get<PaginatedResponse<Video>>('/videos', { params: { page, limit } }).then((r) => r.data),

  delete: (id: string) =>
    apiClient.delete<ApiResponse<null>>(`/videos/${id}`).then((r) => r.data),
};
