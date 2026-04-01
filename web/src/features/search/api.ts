import { apiClient } from '@/lib/api-client';

export interface SearchParams {
  name?: string;
  gender?: string;
  country?: string;
  city?: string;
  sect?: string;
  lifestyle?: string;
  education?: string;
  minAge?: number;
  maxAge?: number;
  page?: number;
  limit?: number;
}

export const searchApi = {
  searchUsers: (params: SearchParams) =>
    apiClient.get('/users/search', { params }).then((r) => r.data),

  getUserProfile: (id: string) =>
    apiClient.get(`/users/${id}/profile`).then((r) => r.data),
};
