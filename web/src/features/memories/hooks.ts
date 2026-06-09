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
    mutationFn: ({ entityType, entityId, collectionId }: { entityType: string; entityId: string; collectionId?: string }) =>
      savedPostsApi.saveItem(entityType, entityId, collectionId),
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

// Collections
export function useSavedCollections() {
  return useQuery({
    queryKey: ['saved-collections'],
    queryFn: () => savedPostsApi.getCollections(),
  });
}

export function useCreateCollection() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ name, coverImage }: { name: string; coverImage?: string }) =>
      savedPostsApi.createCollection(name, coverImage),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['saved-collections'] });
    },
  });
}

export function useUpdateCollection() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { name?: string; coverImage?: string } }) =>
      savedPostsApi.updateCollection(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['saved-collections'] });
    },
  });
}

export function useDeleteCollection() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => savedPostsApi.deleteCollection(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['saved-collections'] });
      qc.invalidateQueries({ queryKey: ['saved-items'] });
    },
  });
}

export function useCollectionItems(collectionId: string) {
  return useQuery({
    queryKey: ['collection-items', collectionId],
    queryFn: () => savedPostsApi.getCollectionItems(collectionId),
    enabled: !!collectionId,
  });
}
