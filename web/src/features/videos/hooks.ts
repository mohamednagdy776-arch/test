'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { videosApi } from './api';

export function useVideos(page = 1, limit = 20, enabled = true) {
  return useQuery({
    queryKey: ['videos', page],
    queryFn: () => videosApi.getVideos(page, limit),
    enabled,
  });
}

export function useVideo(videoId: string) {
  return useQuery({
    queryKey: ['video', videoId],
    queryFn: () => videosApi.getVideo(videoId),
    enabled: !!videoId,
  });
}

export function useRecommendedVideos(enabled = true) {
  return useQuery({
    queryKey: ['videos-recommended'],
    queryFn: () => videosApi.getRecommended(),
    enabled,
  });
}

export function useTrendingVideos(enabled = true) {
  return useQuery({
    queryKey: ['videos-trending'],
    queryFn: () => videosApi.getTrending(),
    enabled,
  });
}

export function useFollowingVideos(enabled = true) {
  return useQuery({
    queryKey: ['videos-following'],
    queryFn: () => videosApi.getFollowing(),
    enabled,
  });
}

export function useContinueWatching() {
  return useQuery({
    queryKey: ['videos-continue-watching'],
    queryFn: () => videosApi.getContinueWatching(),
  });
}

export function useUploadVideo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ file, title, description, isReel }: { file: File; title: string; description?: string; isReel?: boolean }) =>
      videosApi.uploadVideo(file, title, description, isReel),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['videos'] });
      qc.invalidateQueries({ queryKey: ['videos-recommended'] });
      qc.invalidateQueries({ queryKey: ['videos-trending'] });
      qc.invalidateQueries({ queryKey: ['reels-feed'] });
    },
  });
}

export function useDeleteVideo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (videoId: string) => videosApi.deleteVideo(videoId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['videos'] });
    },
  });
}

// Patch the cached video detail with the like response instead of
// invalidating (which would refetch GET /videos/:id — and that endpoint
// increments the view counter on every fetch, so liking/unliking was
// incrementing views as a side effect) (#150).
function patchVideoLikeCache(qc: ReturnType<typeof useQueryClient>, videoId: string, result: any) {
  qc.setQueryData(['video', videoId], (old: any) =>
    old?.data ? { ...old, data: { ...old.data, ...result } } : old,
  );
}

export function useLikeVideo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (videoId: string) => videosApi.likeVideo(videoId),
    onSuccess: (data, variables) => {
      patchVideoLikeCache(qc, variables, data?.data);
    },
  });
}

export function useUnlikeVideo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (videoId: string) => videosApi.unlikeVideo(videoId),
    onSuccess: (data, variables) => {
      patchVideoLikeCache(qc, variables, data?.data);
    },
  });
}

export function useVideoComments(videoId: string) {
  return useQuery({
    queryKey: ['video-comments', videoId],
    queryFn: () => videosApi.getVideoComments(videoId),
    enabled: !!videoId,
  });
}

export function useAddVideoComment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ videoId, content }: { videoId: string; content: string }) =>
      videosApi.addVideoComment(videoId, content),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ['video-comments', variables.videoId] });
    },
  });
}
