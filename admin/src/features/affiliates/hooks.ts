import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { affiliatesApi } from './api';

export const useAffiliates = (page = 1, status?: string) =>
  useQuery({
    queryKey: ['affiliates', page, status],
    queryFn: () => affiliatesApi.getAll(page, 20, status),
  });

export const useApproveAffiliate = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => affiliatesApi.approve(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['affiliates'] }),
  });
};

export const useSuspendAffiliate = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => affiliatesApi.suspend(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['affiliates'] }),
  });
};
