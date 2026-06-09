import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { videosApi } from './api';

export const useVideos = (page = 1) =>
  useQuery({ queryKey: ['videos', page], queryFn: () => videosApi.getAll(page) });

export const useDeleteVideo = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: videosApi.delete,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['videos'] }),
  });
};
