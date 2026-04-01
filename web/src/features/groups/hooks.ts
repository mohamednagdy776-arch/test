'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { groupsApi } from './api';

export function useGroups(page = 1, limit = 20) {
  return useQuery({
    queryKey: ['groups', page],
    queryFn: () => groupsApi.getGroups(page, limit),
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

export function useMyGroups() {
  return useQuery({
    queryKey: ['my-groups'],
    queryFn: () => groupsApi.getMyGroups(),
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
    },
  });
}

export function useCreateGroup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ name, description, privacy }: { name: string; description: string; privacy: 'public' | 'private' }) =>
      groupsApi.createGroup(name, description, privacy),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['my-groups'] });
      qc.invalidateQueries({ queryKey: ['groups'] });
    },
  });
}
