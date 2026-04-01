'use client';
import { useState } from 'react';

export function usePagination(initialPage = 1) {
  const [page, setPage] = useState(initialPage);

  const nextPage = () => setPage((p) => p + 1);
  const prevPage = () => setPage((p) => Math.max(1, p - 1));
  const goToPage = (p: number) => setPage(Math.max(1, p));

  return { page, nextPage, prevPage, goToPage, setPage };
}
