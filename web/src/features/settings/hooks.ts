'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { settingsApi, type PrivacySettings } from './api';

export function usePrivacySettings() {
  return useQuery({
    queryKey: ['privacy-settings'],
    queryFn: () => settingsApi.getPrivacySettings(),
  });
}

export function useUpdatePrivacySettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<PrivacySettings>) => settingsApi.updatePrivacySettings(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['privacy-settings'] });
    },
  });
}

export function useBlocks() {
  return useQuery({
    queryKey: ['blocks'],
    queryFn: () => settingsApi.getBlocks(),
  });
}

export function useBlockUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (blockedUserId: string) => settingsApi.blockUser(blockedUserId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['blocks'] });
    },
  });
}

export function useUnblockUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (blockId: string) => settingsApi.unblockUser(blockId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['blocks'] });
    },
  });
}
