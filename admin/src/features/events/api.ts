import { apiClient } from '@/lib/api-client';

export interface Event {
  id: string;
  title: string;
  description: string;
  location: string;
  startDate: string;
  endDate: string;
  organizerId: string;
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

export const eventsApi = {
  getAll: (page = 1, limit = 20) =>
    apiClient.get<PaginatedResponse<Event>>('/events', { params: { page, limit } }).then((r) => r.data),

  delete: (id: string) =>
    apiClient.delete<ApiResponse<null>>(`/events/${id}`).then((r) => r.data),
};
