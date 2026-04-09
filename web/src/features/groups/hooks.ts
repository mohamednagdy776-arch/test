'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { groupsApi } from './api';

export function useGroups(page = 1, limit = 20, category?: string) {
  return useQuery({
    queryKey: ['groups', page, category],
    queryFn: () => groupsApi.getGroups(page, limit, category),
  });
}

export function usePublicGroups(page = 1, limit = 20, category?: string) {
  return useQuery({
    queryKey: ['public-groups', page, category],
    queryFn: () => groupsApi.getPublicGroups(page, limit, category),
  });
}

export function usePrivateGroups(page = 1, limit = 20) {
  return useQuery({
    queryKey: ['private-groups', page],
    queryFn: () => groupsApi.getPrivateGroups(page, limit),
  });
}

export function useSearchGroups(query: string) {
  return useQuery({
    queryKey: ['groups-search', query],
    queryFn: () => groupsApi.searchGroups(query),
    enabled: query.trim().length >= 2,
  });
}

export function useGroupAutocomplete(query: string) {
  return useQuery({
    queryKey: ['groups-autocomplete', query],
    queryFn: () => groupsApi.autocomplete(query),
    enabled: query.trim().length >= 1,
  });
}

export function useGroup(id: string) {
  return useQuery({
    queryKey: ['group', id],
    queryFn: () => groupsApi.getGroup(id),
  });
}

export function useMyGroups() {
  return useQuery({
    queryKey: ['my-groups'],
    queryFn: () => groupsApi.getMyGroups(),
  });
}

export function useSuggestedGroups(limit = 5) {
  return useQuery({
    queryKey: ['suggested-groups', limit],
    queryFn: () => groupsApi.getSuggestedGroups(limit),
  });
}

export function usePendingRequests() {
  return useQuery({
    queryKey: ['pending-requests'],
    queryFn: () => groupsApi.getPendingRequests(),
  });
}

export function useJoinGroup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => groupsApi.joinGroup(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['my-groups'] });
      qc.invalidateQueries({ queryKey: ['groups'] });
      qc.invalidateQueries({ queryKey: ['groups-search'] });
      qc.invalidateQueries({ queryKey: ['public-groups'] });
      qc.invalidateQueries({ queryKey: ['private-groups'] });
      qc.invalidateQueries({ queryKey: ['suggested-groups'] });
    },
  });
}

export function useLeaveGroup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => groupsApi.leaveGroup(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['my-groups'] });
      qc.invalidateQueries({ queryKey: ['groups'] });
      qc.invalidateQueries({ queryKey: ['groups-search'] });
      qc.invalidateQueries({ queryKey: ['public-groups'] });
      qc.invalidateQueries({ queryKey: ['private-groups'] });
      qc.invalidateQueries({ queryKey: ['suggested-groups'] });
    },
  });
}

export function useCreateGroup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ name, description, privacy, category, coverPhoto }: { name: string; description: string; privacy: 'public' | 'private' | 'secret'; category?: string; coverPhoto?: File }) =>
      coverPhoto ? groupsApi.createGroupWithCover(name, description, privacy, category || '', coverPhoto) : groupsApi.createGroup(name, description, privacy, category),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['my-groups'] });
      qc.invalidateQueries({ queryKey: ['groups'] });
    },
  });
}
