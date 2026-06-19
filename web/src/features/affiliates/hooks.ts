'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { affiliatesApi } from './api';

export function useMyAffiliate() {
  return useQuery({
    queryKey: ['affiliate-me'],
    queryFn: () => affiliatesApi.getMyAffiliate(),
    retry: false,
  });
}

export function useCreateAffiliate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (referralCode?: string) => affiliatesApi.create(referralCode),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['affiliate-me'] }),
  });
}
