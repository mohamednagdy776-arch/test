'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { subscriptionsApi } from './api';

export function useActiveSubscription() {
  return useQuery({
    queryKey: ['subscription-active'],
    queryFn: () => subscriptionsApi.getActiveSubscription(),
    retry: false,
  });
}

export function useCreateSubscription() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (planId: string) => subscriptionsApi.create(planId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['subscription-active'] }),
  });
}

export function useCancelSubscription() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => subscriptionsApi.cancel(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['subscription-active'] }),
  });
}
