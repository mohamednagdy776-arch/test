'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { matchingApi } from './api';

export function useMatches(status?: string) {
  return useQuery({
    queryKey: ['matches', status],
    queryFn: () => matchingApi.getMatches(status),
  });
}

export function useMatch(id: string) {
  return useQuery({
    queryKey: ['match', id],
    queryFn: () => matchingApi.getMatch(id),
    enabled: !!id,
  });
}

export function useProfileWithMatch(userId: string) {
  return useQuery({
    queryKey: ['profile-match', userId],
    queryFn: () => matchingApi.getProfileWithMatch(userId),
    enabled: !!userId,
  });
}

export function useAcceptMatch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => matchingApi.acceptMatch(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['matches'] }),
  });
}

export function useRejectMatch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => matchingApi.rejectMatch(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['matches'] }),
  });
}
