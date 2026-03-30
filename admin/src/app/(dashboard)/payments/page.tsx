'use client';

import { Table } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Pagination } from '@/components/ui/Pagination';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { usePayments } from '@/features/payments/hooks';
import { usePagination } from '@/hooks/usePagination';
import type { Transaction } from '@/types';

const statusVariant = (status: string) => {
  if (status === 'success' || status === 'completed') return 'success';
  if (status === 'failed') return 'danger';
  return 'warning';
};

export default function PaymentsPage() {
  const { page, nextPage, prevPage, goToPage } = usePagination();
  const { data, isLoading, isError } = usePayments(page);

  const columns = [
    { header: 'User', accessor: 'userId' as keyof Transaction },
    {
      header: 'Amount',
      accessor: (t: Transaction) => (
        <span className="font-semibold">{t.amount} {t.currency}</span>
      ),
    },
    { header: 'Gateway', accessor: 'gateway' as keyof Transaction },
    {
      header: 'Status',
      accessor: (t: Transaction) => (
        <Badge label={t.status} variant={statusVariant(t.status)} />
      ),
    },
    {
      header: 'Date',
      accessor: (t: Transaction) => new Date(t.createdAt).toLocaleDateString(),
    },
  ];

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Payments</h1>

      {isError && <ErrorMessage className="mb-4" />}

      <Table
        columns={columns}
        data={data?.data ?? []}
        loading={isLoading}
        emptyMessage="No transactions found."
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
