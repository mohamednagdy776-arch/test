import { apiClient } from '@/lib/api-client';

export const memoriesApi = {
  getMemories: () =>
    apiClient.get('/memories').then((r) => r.data),
};

export const savedPostsApi = {
  getSaved: () =>
    apiClient.get('/saved').then((r) => r.data),

  saveItem: (entityType: string, entityId: string) =>
    apiClient.post('/saved', { entityType, entityId }).then((r) => r.data),

  removeSaved: (id: string) =>
    apiClient.delete(`/saved/${id}`).then((r) => r.data),
};
