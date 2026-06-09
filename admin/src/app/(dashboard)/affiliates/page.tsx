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
import { useAffiliates, useApproveAffiliate, useSuspendAffiliate } from '@/features/affiliates/hooks';
import { usePagination } from '@/hooks/usePagination';
import { useToast } from '@/components/ui/Toast';

interface Affiliate {
  id: string;
  userId: string;
  code: string;
  referrals: number;
  earnings: number;
  status: 'active' | 'pending' | 'suspended';
  createdAt: string;
}

const statusVariant = (s: string) =>
  s === 'active' ? 'success' : s === 'suspended' ? 'danger' : 'warning';

export default function AffiliatesPage() {
  const { page, nextPage, prevPage, goToPage } = usePagination();
  const [statusFilter, setStatusFilter] = useState('');
  const [confirmAction, setConfirmAction] = useState<{ id: string; action: 'approve' | 'suspend' } | null>(null);

  const { data, isLoading, isError } = useAffiliates(page, statusFilter || undefined);
  const approveAffiliate = useApproveAffiliate();
  const suspendAffiliate = useSuspendAffiliate();
  const { toast } = useToast();

  const affiliates: Affiliate[] = data?.data ?? [];
  const total = data?.meta?.total ?? 0;
  const totalPages = data?.meta?.totalPages ?? 1;

  const active = affiliates.filter((a) => a.status === 'active');
  const pending = affiliates.filter((a) => a.status === 'pending');
  const totalReferrals = affiliates.reduce((sum, a) => sum + (a.referrals || 0), 0);
  const totalEarnings = affiliates.reduce((sum, a) => sum + Number(a.earnings || 0), 0);

  const handleConfirm = async () => {
    if (!confirmAction) return;
    try {
      if (confirmAction.action === 'approve') {
        await approveAffiliate.mutateAsync(confirmAction.id);
        toast('Affiliate approved', 'success');
      } else {
        await suspendAffiliate.mutateAsync(confirmAction.id);
        toast('Affiliate suspended', 'success');
      }
    } catch {
      toast('Action failed', 'error');
    } finally {
      setConfirmAction(null);
    }
  };

  const columns = [
    {
      header: 'User ID',
      accessor: (a: Affiliate) => <span className="font-mono text-xs">{a.userId?.slice(0, 8)}…</span>,
    },
    {
      header: 'Code',
      accessor: (a: Affiliate) => (
        <span className="font-mono text-sm font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
          {a.code}
        </span>
      ),
    },
    {
      header: 'Referrals',
      accessor: (a: Affiliate) => <span className="font-semibold">{a.referrals ?? 0}</span>,
    },
    {
      header: 'Earnings',
      accessor: (a: Affiliate) => <span className="font-semibold">${Number(a.earnings ?? 0).toFixed(2)}</span>,
    },
    {
      header: 'Status',
      accessor: (a: Affiliate) => <Badge label={a.status} variant={statusVariant(a.status)} />,
    },
    {
      header: 'Joined',
      accessor: (a: Affiliate) => new Date(a.createdAt).toLocaleDateString(),
    },
    {
      header: 'Actions',
      accessor: (a: Affiliate) => (
        <div className="flex gap-2">
          {a.status === 'pending' && (
            <Button
              size="sm"
              variant="primary"
              onClick={() => setConfirmAction({ id: a.id, action: 'approve' })}
            >
              Approve
            </Button>
          )}
          {a.status === 'active' && (
            <Button
              size="sm"
              variant="danger"
              onClick={() => setConfirmAction({ id: a.id, action: 'suspend' })}
            >
              Suspend
            </Button>
          )}
          {a.status === 'suspended' && (
            <Button
              size="sm"
              variant="primary"
              onClick={() => setConfirmAction({ id: a.id, action: 'approve' })}
            >
              Reinstate
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Affiliates</h1>
        <span className="text-sm text-slate-500">{total} total</span>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Active" value={active.length} color="green" />
        <StatCard label="Pending" value={pending.length} color="yellow" />
        <StatCard label="Total Referrals" value={totalReferrals} color="blue" />
        <StatCard label="Total Earnings (page)" value={`$${totalEarnings.toFixed(0)}`} color="green" />
      </div>

      <div className="mb-4">
        <Select
          value={statusFilter}
          onChange={setStatusFilter}
          placeholder="All statuses"
          options={[
            { label: 'Active', value: 'active' },
            { label: 'Pending', value: 'pending' },
            { label: 'Suspended', value: 'suspended' },
          ]}
        />
      </div>

      {isError && <ErrorMessage message="Failed to load affiliates" />}

      <Table columns={columns} data={affiliates} loading={isLoading} />

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
        open={!!confirmAction}
        title={confirmAction?.action === 'approve' ? 'Approve Affiliate' : 'Suspend Affiliate'}
        message={
          confirmAction?.action === 'approve'
            ? 'Approve this affiliate? They will be able to earn referral commissions.'
            : 'Suspend this affiliate? They will no longer earn commissions.'
        }
        confirmLabel={confirmAction?.action === 'approve' ? 'Approve' : 'Suspend'}
        onConfirm={handleConfirm}
        onClose={() => setConfirmAction(null)}
      />
    </div>
  );
}
