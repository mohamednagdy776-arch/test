'use client';

import { Table } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Pagination } from '@/components/ui/Pagination';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { useMatches } from '@/features/matching/hooks';
import { usePagination } from '@/hooks/usePagination';
import type { Match } from '@/types';

const statusVariant = (status: Match['status']) => {
  if (status === 'accepted') return 'success';
  if (status === 'rejected') return 'danger';
  return 'warning';
};

export default function MatchingPage() {
  const { page, nextPage, prevPage, goToPage } = usePagination();
  const { data, isLoading, isError } = useMatches(page);

  const columns = [
    { header: 'User 1', accessor: 'user1Id' as keyof Match },
    { header: 'User 2', accessor: 'user2Id' as keyof Match },
    {
      header: 'Score',
      accessor: (m: Match) => (
        <span className="font-semibold text-primary">{m.score}%</span>
      ),
    },
    {
      header: 'Status',
      accessor: (m: Match) => (
        <Badge label={m.status} variant={statusVariant(m.status)} />
      ),
    },
    {
      header: 'Date',
      accessor: (m: Match) => new Date(m.createdAt).toLocaleDateString(),
    },
  ];

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Matching</h1>

      {isError && <ErrorMessage className="mb-4" />}

      <Table
        columns={columns}
        data={data?.data ?? []}
        loading={isLoading}
        emptyMessage="No matches found."
      />

      <Pagination
        page={page}
        totalPages={data?.meta.totalPages ?? 1}
        onNext={nextPage}
        onPrev={prevPage}
        onPage={goToPage}
      />
    </div>
  );
}
