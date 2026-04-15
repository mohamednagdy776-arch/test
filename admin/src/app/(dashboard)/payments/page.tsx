'use client';

import { useState } from 'react';
import { Table } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Pagination } from '@/components/ui/Pagination';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { Select } from '@/components/ui/Select';
import { StatCard } from '@/components/ui/StatCard';
import { usePayments } from '@/features/payments/hooks';
import { usePagination } from '@/hooks/usePagination';
import type { Transaction } from '@/types';

const statusVariant = (s: string) =>
  s === 'success' || s === 'completed' ? 'success' : s === 'failed' ? 'danger' : 'warning';

export default function PaymentsPage() {
  const { page, nextPage, prevPage, goToPage } = usePagination();
  const [statusFilter, setStatusFilter] = useState('');
  const [gatewayFilter, setGatewayFilter] = useState('');
  const { data, isLoading, isError } = usePayments(page);

  const filtered = (data?.data ?? []).filter((t) => {
    const matchStatus = !statusFilter || t.status === statusFilter;
    const matchGateway = !gatewayFilter || t.gateway === gatewayFilter;
    return matchStatus && matchGateway;
  });

  const totalRevenue = filtered.reduce((sum, t) =>
    t.status === 'success' || t.status === 'completed' ? sum + Number(t.amount) : sum, 0
  );

  const columns = [
    { header: 'User', accessor: (t: Transaction) => <span className="font-mono text-xs">{t.userId?.slice(0, 8)}…</span> },
    { header: 'Amount', accessor: (t: Transaction) => <span className="font-semibold">{t.amount} {t.currency}</span> },
    { header: 'Gateway', accessor: (t: Transaction) => (
      <Badge label={t.gateway} variant="default" />
    )},
    { header: 'Status', accessor: (t: Transaction) => (
      <Badge label={t.status} variant={statusVariant(t.status)} />
    )},
    { header: 'Date', accessor: (t: Transaction) => new Date(t.createdAt).toLocaleDateString() },
  ];

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Payments</h1>
        <span className="text-sm text-slate-500">{data?.meta.total ?? 0} total transactions</span>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
        <StatCard label="Total Transactions" value={data?.meta.total ?? 0} color="blue" />
        <StatCard label="Revenue (filtered)" value={`${totalRevenue.toFixed(2)}`} sub="Successful only" color="green" />
        <StatCard label="This Page" value={filtered.length} color="yellow" />
      </div>

      <div className="mb-4 flex gap-3">
        <Select value={statusFilter} onChange={setStatusFilter} placeholder="All statuses"
          options={[{ label: 'Success', value: 'success' }, { label: 'Pending', value: 'pending' }, { label: 'Failed', value: 'failed' }]} />
        <Select value={gatewayFilter} onChange={setGatewayFilter} placeholder="All gateways"
          options={[{ label: 'Paymob', value: 'paymob' }, { label: 'Stripe', value: 'stripe' }]} />
      </div>

      {isError && <ErrorMessage className="mb-4" />}
      <Table columns={columns} data={filtered} loading={isLoading} emptyMessage="No transactions found." />
      <Pagination page={page} totalPages={data?.meta.totalPages ?? 1} onNext={nextPage} onPrev={prevPage} onPage={goToPage} />
    </div>
  );
}
