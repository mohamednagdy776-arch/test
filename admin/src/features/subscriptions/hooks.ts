import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { subscriptionsApi } from './api';

export const useSubscriptions = (page = 1, status?: string, planType?: string) =>
  useQuery({
    queryKey: ['subscriptions', page, status, planType],
    queryFn: () => subscriptionsApi.getAll(page, 20, status, planType),
  });

export const useCancelSubscription = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => subscriptionsApi.cancel(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['subscriptions'] }),
  });
};
