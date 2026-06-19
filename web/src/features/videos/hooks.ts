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

export function useContinueWatching() {
  return useQuery({
    queryKey: ['videos-continue-watching'],
    queryFn: () => videosApi.getContinueWatching(),
  });
}

export function useUploadVideo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ file, title, description }: { file: File; title: string; description?: string }) =>
      videosApi.uploadVideo(file, title, description),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['videos'] });
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

export function useLikeVideo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (videoId: string) => videosApi.likeVideo(videoId),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ['video', variables] });
    },
  });
}

export function useUnlikeVideo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (videoId: string) => videosApi.unlikeVideo(videoId),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ['video', variables] });
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
