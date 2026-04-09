'use client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

export const useCreatePage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; description?: string; category?: string }) =>
      apiClient.post('/pages', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['pages'] }),
  });
};

export const useFollowPage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (pageId: string) => apiClient.post(`/pages/${pageId}/follow`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['pages'] }),
  });
};

export const useUnfollowPage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (pageId: string) => apiClient.delete(`/pages/${pageId}/follow`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['pages'] }),
  });
};