'use client';

import { Table } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Pagination } from '@/components/ui/Pagination';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { useReports, useResolveReport } from '@/features/reports/hooks';
import { usePagination } from '@/hooks/usePagination';
import type { Report } from '@/features/reports/api';

const statusVariant = (status: Report['status']) => {
  if (status === 'resolved') return 'success';
  if (status === 'dismissed') return 'default';
  return 'warning';
};

export default function ReportsPage() {
  const { page, nextPage, prevPage, goToPage } = usePagination();
  const { data, isLoading, isError } = useReports(page);
  const resolve = useResolveReport();

  const columns = [
    { header: 'Reported By', accessor: 'reportedBy' as keyof Report },
    {
      header: 'Target',
      accessor: (r: Report) => (
        <span className="capitalize">{r.targetType} — {r.targetId.slice(0, 8)}…</span>
      ),
    },
    { header: 'Reason', accessor: 'reason' as keyof Report },
    {
      header: 'Status',
      accessor: (r: Report) => (
        <Badge label={r.status} variant={statusVariant(r.status)} />
      ),
    },
    {
      header: 'Date',
      accessor: (r: Report) => new Date(r.createdAt).toLocaleDateString(),
    },
    {
      header: 'Actions',
      accessor: (r: Report) =>
        r.status === 'pending' ? (
          <Button
            variant="primary"
            onClick={() => resolve.mutate(r.id)}
            loading={resolve.isPending}
            className="text-xs px-2 py-1"
          >
            Resolve
          </Button>
        ) : (
          <span className="text-xs text-gray-400 capitalize">{r.status}</span>
        ),
    },
  ];

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Reports</h1>

      {isError && <ErrorMessage className="mb-4" />}

      <Table
        columns={columns}
        data={data?.data ?? []}
        loading={isLoading}
        emptyMessage="No reports found."
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
