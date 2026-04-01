import { apiClient } from '@/lib/api-client';

export const groupsApi = {
  getGroups: () =>
    apiClient.get('/groups').then((r) => r.data),

  createGroup: (name: string, description: string, privacy: 'public' | 'private') =>
    apiClient.post('/groups', { name, description, privacy }).then((r) => r.data),

  deleteGroup: (id: string) =>
    apiClient.delete(`/groups/${id}`).then((r) => r.data),
};
