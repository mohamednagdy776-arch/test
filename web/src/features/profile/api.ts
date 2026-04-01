import { apiClient } from '@/lib/api-client';

export const profileApi = {
  getMyProfile: () =>
    apiClient.get('/users/me').then((r) => r.data),

  updateProfile: (data: Record<string, any>) =>
    apiClient.patch('/users/me', data).then((r) => r.data),

  uploadAvatar: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.post('/users/me/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data);
  },
};
