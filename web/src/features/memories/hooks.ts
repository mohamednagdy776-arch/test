'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { memoriesApi, savedPostsApi } from './api';

export function useMemories() {
  return useQuery({
    queryKey: ['memories'],
    queryFn: () => memoriesApi.getMemories(),
  });
}

export function useSavedItems() {
  return useQuery({
    queryKey: ['saved-items'],
    queryFn: () => savedPostsApi.getSaved(),
  });
}

export function useSaveItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ entityType, entityId }: { entityType: string; entityId: string }) =>
      savedPostsApi.saveItem(entityType, entityId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['saved-items'] });
    },
  });
}

export function useRemoveSaved() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => savedPostsApi.removeSaved(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['saved-items'] });
    },
  });
}
