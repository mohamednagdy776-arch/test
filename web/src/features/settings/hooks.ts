'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { settingsApi, type PrivacySettings, type AppearanceSettings, type NotificationSettings, type NewsletterSettings } from './api';

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

export function useAppearanceSettings() {
  return useQuery({
    queryKey: ['appearance-settings'],
    queryFn: () => settingsApi.getAppearanceSettings(),
  });
}

export function useUpdateAppearanceSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<AppearanceSettings>) => settingsApi.updateAppearanceSettings(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['appearance-settings'] });
    },
  });
}

export function useNotificationSettings() {
  return useQuery({
    queryKey: ['notification-settings'],
    queryFn: () => settingsApi.getNotificationSettings(),
  });
}

export function useUpdateNotificationSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<NotificationSettings>) => settingsApi.updateNotificationSettings(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notification-settings'] });
    },
  });
}

export function useNewsletterSettings() {
  return useQuery({
    queryKey: ['newsletter-settings'],
    queryFn: () => settingsApi.getNewsletterSettings(),
  });
}

export function useUpdateNewsletterSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<NewsletterSettings>) => settingsApi.updateNewsletterSettings(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['newsletter-settings'] });
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
