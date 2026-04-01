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
