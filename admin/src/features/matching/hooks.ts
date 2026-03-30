import { useQuery } from '@tanstack/react-query';
import { matchingApi } from './api';

export const useMatches = (page = 1) =>
  useQuery({ queryKey: ['matches', page], queryFn: () => matchingApi.getAll(page) });
