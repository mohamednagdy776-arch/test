import { useQuery } from '@tanstack/react-query';
import { paymentsApi } from './api';

export const usePayments = (page = 1) =>
  useQuery({ queryKey: ['payments', page], queryFn: () => paymentsApi.getAll(page) });
