'use client';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

export interface LinkPreviewData {
  url: string;
  title?: string;
  description?: string;
  image?: string;
  siteName?: string;
}

// Fetches Open Graph metadata for a URL via the shared backend endpoint.
// Results are cached by react-query (and again server-side in Redis), so the
// same link rendered in multiple messages only hits the network once.
export function useLinkPreview(url: string | null) {
  return useQuery<LinkPreviewData | null>({
    queryKey: ['link-preview', url],
    enabled: !!url,
    staleTime: 60 * 60 * 1000, // 1h — OG data is effectively static
    retry: false,
    queryFn: async () => {
      const { data } = await apiClient.get('/link-preview', { params: { url } });
      return data?.data ?? null;
    },
  });
}
