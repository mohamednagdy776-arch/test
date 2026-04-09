'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { profileApi } from './api';

export function useMyProfile() {
  return useQuery({
    queryKey: ['my-profile'],
    queryFn: () => profileApi.getMyProfile(),
  });
}

export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, any>) => profileApi.updateProfile(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['my-profile'] }),
  });
}

export function useUploadAvatar() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => profileApi.uploadAvatar(file),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['my-profile'] }),
  });
}

export function useUploadCover() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => profileApi.uploadCover(file),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['my-profile'] }),
  });
}

export function useUserProfile(userId: string) {
  return useQuery({
    queryKey: ['user-profile', userId],
    queryFn: () => profileApi.getUserProfile(userId),
    enabled: !!userId,
  });
}

export function useFriends(userId: string) {
  return useQuery({
    queryKey: ['friends', userId],
    queryFn: () => profileApi.getFriends(userId),
    enabled: !!userId,
  });
}

export function usePhotos(userId: string) {
  return useQuery({
    queryKey: ['photos', userId],
    queryFn: () => profileApi.getPhotos(userId),
    enabled: !!userId,
  });
}

export function useVideos(userId: string) {
  return useQuery({
    queryKey: ['videos', userId],
    queryFn: () => profileApi.getVideos(userId),
    enabled: !!userId,
  });
}

export function useActivityLog(userId: string, params: Record<string, any> = {}) {
  return useQuery({
    queryKey: ['activity-log', userId, params],
    queryFn: () => profileApi.getActivityLog(userId, params),
    enabled: !!userId,
  });
}
