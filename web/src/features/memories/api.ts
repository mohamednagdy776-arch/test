import { apiClient } from '@/lib/api-client';

export const memoriesApi = {
  getMemories: () =>
    apiClient.get('/memories').then((r) => r.data),
};

export const savedPostsApi = {
  getSaved: () =>
    apiClient.get('/saved').then((r) => r.data),

  saveItem: (entityType: string, entityId: string, collectionId?: string) =>
    apiClient.post('/saved', { entityType, entityId, collectionId }).then((r) => r.data),

  removeSaved: (id: string) =>
    apiClient.delete(`/saved/${id}`).then((r) => r.data),

  // Collections
  getCollections: () =>
    apiClient.get('/saved/collections').then((r) => r.data),

  createCollection: (name: string, coverImage?: string) =>
    apiClient.post('/saved/collections', { name, coverImage }).then((r) => r.data),

  updateCollection: (id: string, data: { name?: string; coverImage?: string }) =>
    apiClient.patch(`/saved/collections/${id}`, data).then((r) => r.data),

  deleteCollection: (id: string) =>
    apiClient.delete(`/saved/collections/${id}`).then((r) => r.data),

  getCollectionItems: (id: string) =>
    apiClient.get(`/saved/collections/${id}`).then((r) => r.data),
};
