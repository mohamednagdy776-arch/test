'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { ThemeProvider } from '@/components/ui/ThemeProvider';
import { ToastProvider } from '@/components/ui/Toast';

export const Providers = ({ children }: { children: React.ReactNode }) => {
  const [qc] = useState(() => new QueryClient({ defaultOptions: { queries: { staleTime: 60000, retry: 1 } } }));
  return (
    <QueryClientProvider client={qc}>
      <ThemeProvider>
        <ToastProvider>{children}</ToastProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};
