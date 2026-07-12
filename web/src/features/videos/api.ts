import { apiClient } from '@/lib/api-client';

// The app has no server-side transcoding pipeline (no ffmpeg dependency), so
// video cards had no thumbnail and duration always read 0:00 (#74/#76) —
// nothing ever generated either. Grab both client-side via the browser's own
// video decoder before upload: seek to a frame, paint it to a canvas, and read
// `.duration` off the element. Best-effort — a failure here shouldn't block
// the upload, it just leaves thumbnail/duration unset like before.
function captureVideoThumbnail(file: File): Promise<{ thumbnail?: Blob; duration?: number }> {
  return new Promise((resolve) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.muted = true;
    video.src = URL.createObjectURL(file);

    const cleanup = () => URL.revokeObjectURL(video.src);
    const finish = (result: { thumbnail?: Blob; duration?: number }) => {
      cleanup();
      resolve(result);
    };

    video.onloadedmetadata = () => {
      const duration = Number.isFinite(video.duration) ? Math.round(video.duration) : undefined;
      // A couple frames in, not frame 0 (often black/blank).
      video.currentTime = Math.min(1, video.duration / 2 || 0);
      video.onseeked = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          canvas.getContext('2d')?.drawImage(video, 0, 0, canvas.width, canvas.height);
          canvas.toBlob((blob) => finish({ thumbnail: blob ?? undefined, duration }), 'image/jpeg', 0.8);
        } catch {
          finish({ duration });
        }
      };
    };
    video.onerror = () => finish({});
  });
}

export const videosApi = {
  getVideos: (page = 1, limit = 20) =>
    apiClient.get('/videos', { params: { page, limit } }).then((r) => r.data),

  getVideo: (videoId: string) =>
    apiClient.get(`/videos/${videoId}`).then((r) => r.data),

  getRecommended: () =>
    apiClient.get('/videos/recommended').then((r) => r.data),

  getTrending: () =>
    apiClient.get('/videos/trending').then((r) => r.data),

  getFollowing: () =>
    apiClient.get('/videos/following').then((r) => r.data),

  getContinueWatching: () =>
    apiClient.get('/videos/continue-watching').then((r) => r.data),

  // Videos are created in two steps, mirroring how posts/stories handle media:
  // 1) upload the raw file to the shared media endpoint to obtain a signed URL,
  // 2) create the video record referencing that URL. (The backend exposes
  // POST /upload/media and POST /videos — there is no single /videos/upload.)
  uploadVideo: async (file: File, title: string, description?: string, isReel?: boolean) => {
    const formData = new FormData();
    formData.append('file', file);
    const [uploaded, captured] = await Promise.all([
      apiClient
        .post('/upload/media', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
        .then((r) => r.data),
      captureVideoThumbnail(file),
    ]);

    const url: string | undefined = uploaded?.data?.url ?? uploaded?.url;
    if (!url) throw new Error('فشل رفع ملف الفيديو');

    let thumbnail: string | undefined;
    if (captured.thumbnail) {
      const thumbForm = new FormData();
      thumbForm.append('file', captured.thumbnail, 'thumbnail.jpg');
      const thumbUploaded = await apiClient
        .post('/upload/media', thumbForm, { headers: { 'Content-Type': 'multipart/form-data' } })
        .then((r) => r.data)
        .catch(() => null);
      thumbnail = thumbUploaded?.data?.url ?? thumbUploaded?.url ?? undefined;
    }

    return apiClient
      .post('/videos', { title, description, url, thumbnail, duration: captured.duration, isReel })
      .then((r) => r.data);
  },

  deleteVideo: (videoId: string) =>
    apiClient.delete(`/videos/${videoId}`).then((r) => r.data),

  likeVideo: (videoId: string) =>
    apiClient.post(`/videos/${videoId}/like`).then((r) => r.data),

  unlikeVideo: (videoId: string) =>
    apiClient.delete(`/videos/${videoId}/like`).then((r) => r.data),

  // The video player only ever supported a boolean Like (#151).
  reactToVideo: (videoId: string, type: string) =>
    apiClient.post(`/videos/${videoId}/reactions`, { type }).then((r) => r.data),

  getVideoReactions: (videoId: string) =>
    apiClient.get(`/videos/${videoId}/reactions`).then((r) => r.data),

  getVideoComments: (videoId: string) =>
    apiClient.get(`/videos/${videoId}/comments`).then((r) => r.data),

  addVideoComment: (videoId: string, content: string) =>
    apiClient.post(`/videos/${videoId}/comments`, { content }).then((r) => r.data),

  // No edit/delete path existed for video comments at all (#303).
  updateVideoComment: (videoId: string, commentId: string, content: string) =>
    apiClient.patch(`/videos/${videoId}/comments/${commentId}`, { content }).then((r) => r.data),

  deleteVideoComment: (videoId: string, commentId: string) =>
    apiClient.delete(`/videos/${videoId}/comments/${commentId}`).then((r) => r.data),

  shareVideo: (videoId: string, content?: string) =>
    apiClient.post(`/videos/${videoId}/share`, { content }).then((r) => r.data),
};
