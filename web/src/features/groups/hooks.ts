'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { groupsApi } from './api';

export function useGroups() {
  return useQuery({
    queryKey: ['groups'],
    queryFn: () => groupsApi.getGroups(),
  });
}

export function useCreateGroup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ name, description, privacy }: { name: string; description: string; privacy: 'public' | 'private' }) =>
      groupsApi.createGroup(name, description, privacy),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['groups'] }),
  });
}
