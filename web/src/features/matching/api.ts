import { apiClient } from '@/lib/api-client';

export const matchingApi = {
  getMatches: (status?: string) =>
    apiClient.get('/matches', { params: status ? { status } : undefined }).then((r) => r.data),

  getMatch: (id: string) =>
    apiClient.get(`/matches/${id}`).then((r) => r.data),

  getProfileWithMatch: (userId: string) =>
    apiClient.get(`/matches/profile/${userId}`).then((r) => r.data),

  acceptMatch: (id: string) =>
    apiClient.patch(`/matches/${id}/accept`).then((r) => r.data),

  rejectMatch: (id: string) =>
    apiClient.patch(`/matches/${id}/reject`).then((r) => r.data),
};
