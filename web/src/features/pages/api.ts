import { apiClient } from '@/lib/api-client';

export const pagesApi = {
  getPages: (page = 1, limit = 20, category?: string) =>
    apiClient.get('/pages', { params: { page, limit, category } }).then((r) => r.data),

  getPublicPages: (page = 1, limit = 20, category?: string) =>
    apiClient.get('/pages', { params: { page, limit, category } }).then((r) => r.data),

  getMyPages: () =>
    apiClient.get('/pages/my').then((r) => r.data),

  getCreatedPages: () =>
    apiClient.get('/pages/created').then((r) => r.data),

  getPage: (id: string) =>
    apiClient.get(`/pages/${id}`).then((r) => r.data),

  searchPages: (query: string) =>
    apiClient.get('/pages/search', { params: { q: query } }).then((r) => r.data),

  getSuggestedPages: (limit = 5) =>
    apiClient.get('/pages/suggested', { params: { limit } }).then((r) => r.data),

  createPage: (name: string, description?: string, category?: string) =>
    apiClient.post('/pages', { name, description, category }).then((r) => r.data),

  createPageWithCover: (name: string, description: string, category: string, coverPhoto: File) => {
    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', description);
    formData.append('category', category);
    formData.append('coverPhoto', coverPhoto);
    return apiClient.post('/pages', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data);
  },

  followPage: (id: string) =>
    apiClient.post(`/pages/${id}/follow`).then((r) => r.data),

  unfollowPage: (id: string) =>
    apiClient.delete(`/pages/${id}/follow`).then((r) => r.data),

  likePage: (id: string) =>
    apiClient.post(`/pages/${id}/like`).then((r) => r.data),

  unlikePage: (id: string) =>
    apiClient.delete(`/pages/${id}/like`).then((r) => r.data),
};
