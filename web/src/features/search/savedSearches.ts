import { apiClient } from '@/lib/api-client';

// [Body_Sadek] #757 — saved searches.
export const savedSearchesApi = {
  list: () => apiClient.get('/saved-searches').then((r) => r.data),
  create: (name: string, filters: Record<string, any>) =>
    apiClient.post('/saved-searches', { name, filters }).then((r) => r.data),
  remove: (id: string) => apiClient.delete(`/saved-searches/${id}`).then((r) => r.data),
};
