'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { pagesApi } from './api';

export function usePages(page = 1, limit = 20, category?: string) {
  return useQuery({
    queryKey: ['pages', page, category],
    queryFn: () => pagesApi.getPages(page, limit, category),
  });
}

export function usePublicPages(page = 1, limit = 20, category?: string) {
  return useQuery({
    queryKey: ['public-pages', page, category],
    queryFn: () => pagesApi.getPublicPages(page, limit, category),
  });
}

export function useMyPages() {
  return useQuery({
    queryKey: ['my-pages'],
    queryFn: () => pagesApi.getMyPages(),
  });
}

export function useCreatedPages() {
  return useQuery({
    queryKey: ['created-pages'],
    queryFn: () => pagesApi.getCreatedPages(),
  });
}

export function usePage(id: string) {
  return useQuery({
    queryKey: ['page', id],
    queryFn: () => pagesApi.getPage(id),
  });
}

export function useSearchPages(query: string) {
  return useQuery({
    queryKey: ['pages-search', query],
    queryFn: () => pagesApi.searchPages(query),
    enabled: query.trim().length >= 2,
  });
}

export function useSuggestedPages(limit = 5) {
  return useQuery({
    queryKey: ['suggested-pages', limit],
    queryFn: () => pagesApi.getSuggestedPages(limit),
  });
}

export function useFollowPage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => pagesApi.followPage(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['my-pages'] });
      qc.invalidateQueries({ queryKey: ['pages'] });
      qc.invalidateQueries({ queryKey: ['page'] });
      qc.invalidateQueries({ queryKey: ['suggested-pages'] });
    },
  });
}

export function useUnfollowPage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => pagesApi.unfollowPage(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['my-pages'] });
      qc.invalidateQueries({ queryKey: ['pages'] });
      qc.invalidateQueries({ queryKey: ['page'] });
      qc.invalidateQueries({ queryKey: ['suggested-pages'] });
    },
  });
}

export function useLikePage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => pagesApi.likePage(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['pages'] });
      qc.invalidateQueries({ queryKey: ['page'] });
    },
  });
}

export function useUnlikePage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => pagesApi.unlikePage(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['pages'] });
      qc.invalidateQueries({ queryKey: ['page'] });
    },
  });
}

export function useCreatePage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ name, description, category, coverPhoto }: { name: string; description?: string; category?: string; coverPhoto?: File }) =>
      coverPhoto ? pagesApi.createPageWithCover(name, description || '', category || '', coverPhoto) : pagesApi.createPage(name, description, category),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['my-pages'] });
      qc.invalidateQueries({ queryKey: ['created-pages'] });
      qc.invalidateQueries({ queryKey: ['pages'] });
    },
  });
}
