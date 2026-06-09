'use client';

import { useState } from 'react';
import { Table } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Pagination } from '@/components/ui/Pagination';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { Select } from '@/components/ui/Select';
import { StatCard } from '@/components/ui/StatCard';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useSubscriptions, useCancelSubscription } from '@/features/subscriptions/hooks';
import { usePagination } from '@/hooks/usePagination';
import { useToast } from '@/components/ui/Toast';

interface Subscription {
  id: string;
  userId: string;
  planType: 'basic' | 'premium' | 'family';
  status: 'active' | 'cancelled' | 'expired';
  startDate: string;
  endDate: string;
  amount: number;
  currency?: string;
}

const planVariant = (p: string) =>
  p === 'premium' ? 'success' : p === 'family' ? 'warning' : 'default';

const statusVariant = (s: string) =>
  s === 'active' ? 'success' : s === 'cancelled' ? 'danger' : 'default';

export default function SubscriptionsPage() {
  const { page, nextPage, prevPage, goToPage } = usePagination();
  const [statusFilter, setStatusFilter] = useState('');
  const [planFilter, setPlanFilter] = useState('');
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const { data, isLoading, isError } = useSubscriptions(page, statusFilter || undefined, planFilter || undefined);
  const cancelSubscription = useCancelSubscription();
  const { toast } = useToast();

  const subs: Subscription[] = data?.data ?? [];
  const total = data?.meta?.total ?? 0;
  const totalPages = data?.meta?.totalPages ?? 1;

  const activeSubs = subs.filter((s) => s.status === 'active');
  const premiumSubs = subs.filter((s) => s.planType === 'premium');
  const familySubs = subs.filter((s) => s.planType === 'family');
  const revenue = activeSubs.reduce((sum, s) => sum + Number(s.amount || 0), 0);

  const handleCancel = async () => {
    if (!confirmId) return;
    try {
      await cancelSubscription.mutateAsync(confirmId);
      toast('Subscription cancelled', 'success');
    } catch {
      toast('Failed to cancel', 'error');
    } finally {
      setConfirmId(null);
    }
  };

  const columns = [
    {
      header: 'User ID',
      accessor: (s: Subscription) => <span className="font-mono text-xs">{s.userId?.slice(0, 8)}…</span>,
    },
    {
      header: 'Plan',
      accessor: (s: Subscription) => <Badge label={s.planType} variant={planVariant(s.planType)} />,
    },
    {
      header: 'Status',
      accessor: (s: Subscription) => <Badge label={s.status} variant={statusVariant(s.status)} />,
    },
    {
      header: 'Amount',
      accessor: (s: Subscription) => (
        <span className="font-semibold">{s.amount} {s.currency ?? 'USD'}</span>
      ),
    },
    {
      header: 'Start Date',
      accessor: (s: Subscription) => new Date(s.startDate).toLocaleDateString(),
    },
    {
      header: 'End Date',
      accessor: (s: Subscription) => new Date(s.endDate).toLocaleDateString(),
    },
    {
      header: 'Actions',
      accessor: (s: Subscription) =>
        s.status === 'active' ? (
          <Button
            size="sm"
            variant="danger"
            onClick={() => setConfirmId(s.id)}
            disabled={cancelSubscription.isPending}
          >
            Cancel
          </Button>
        ) : (
          <span className="text-xs text-slate-400">—</span>
        ),
    },
  ];

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Subscriptions</h1>
        <span className="text-sm text-slate-500">{total} total</span>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Active" value={activeSubs.length} color="green" />
        <StatCard label="Premium" value={premiumSubs.length} color="blue" />
        <StatCard label="Family" value={familySubs.length} color="yellow" />
        <StatCard label="Revenue (page)" value={`$${revenue.toFixed(0)}`} color="green" />
      </div>

      <div className="mb-4 flex gap-3">
        <Select
          value={statusFilter}
          onChange={setStatusFilter}
          placeholder="All statuses"
          options={[
            { label: 'Active', value: 'active' },
            { label: 'Cancelled', value: 'cancelled' },
            { label: 'Expired', value: 'expired' },
          ]}
        />
        <Select
          value={planFilter}
          onChange={setPlanFilter}
          placeholder="All plans"
          options={[
            { label: 'Basic', value: 'basic' },
            { label: 'Premium', value: 'premium' },
            { label: 'Family', value: 'family' },
          ]}
        />
      </div>

      {isError && <ErrorMessage message="Failed to load subscriptions" />}

      <Table columns={columns} data={subs} loading={isLoading} />

      <div className="mt-4">
        <Pagination
          page={page}
          totalPages={totalPages}
          onNext={nextPage}
          onPrev={prevPage}
          onPage={goToPage}
        />
      </div>

      <ConfirmDialog
        open={!!confirmId}
        title="Cancel Subscription"
        message="Are you sure you want to cancel this subscription? The user will lose access immediately."
        confirmLabel="Cancel Subscription"
        onConfirm={handleCancel}
        onClose={() => setConfirmId(null)}
      />
    </div>
  );
}
