import { apiClient } from '@/lib/api-client';

export const videosApi = {
  getVideos: (page = 1, limit = 20) =>
    apiClient.get('/videos', { params: { page, limit } }).then((r) => r.data),

  getVideo: (videoId: string) =>
    apiClient.get(`/videos/${videoId}`).then((r) => r.data),

  getRecommended: () =>
    apiClient.get('/videos/recommended').then((r) => r.data),

  getTrending: () =>
    apiClient.get('/videos/trending').then((r) => r.data),

  getContinueWatching: () =>
    apiClient.get('/videos/continue-watching').then((r) => r.data),

  uploadVideo: async (file: File, title: string, description?: string) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title);
    if (description) formData.append('description', description);
    return apiClient.post('/videos/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data);
  },

  deleteVideo: (videoId: string) =>
    apiClient.delete(`/videos/${videoId}`).then((r) => r.data),

  likeVideo: (videoId: string) =>
    apiClient.post(`/videos/${videoId}/like`).then((r) => r.data),

  unlikeVideo: (videoId: string) =>
    apiClient.delete(`/videos/${videoId}/like`).then((r) => r.data),

  getVideoComments: (videoId: string) =>
    apiClient.get(`/videos/${videoId}/comments`).then((r) => r.data),

  addVideoComment: (videoId: string, content: string) =>
    apiClient.post(`/videos/${videoId}/comments`, { content }).then((r) => r.data),

  shareVideo: (videoId: string, content?: string) =>
    apiClient.post(`/videos/${videoId}/share`, { content }).then((r) => r.data),
};
