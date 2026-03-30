import { apiClient } from '@/lib/api-client';
import type { PaginatedResponse, Transaction } from '@/types';

export const paymentsApi = {
  getAll: (page = 1, limit = 20) =>
    apiClient.get<PaginatedResponse<Transaction>>('/payments', { params: { page, limit } }).then((r) => r.data),
};
