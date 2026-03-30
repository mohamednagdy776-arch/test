'use client';

import { useState } from 'react';
import { Table } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Pagination } from '@/components/ui/Pagination';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import { useReports, useResolveReport, useDismissReport } from '@/features/reports/hooks';
import { usePagination } from '@/hooks/usePagination';
import { useToast } from '@/components/ui/Toast';
import type { Report } from '@/features/reports/api';

const statusVariant = (s: Report['status']) =>
  s === 'resolved' ? 'success' : s === 'dismissed' ? 'default' : 'warning';

export default function ReportsPage() {
  const { page, nextPage, prevPage, goToPage } = usePagination();
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [detail, setDetail] = useState<Report | null>(null);
  const { data, isLoading, isError } = useReports(page);
  const resolve = useResolveReport();
  const dismiss = useDismissReport();
  const { toast } = useToast();

  const filtered = (data?.data ?? []).filter((r) => {
    const matchStatus = !statusFilter || r.status === statusFilter;
    const matchType = !typeFilter || r.targetType === typeFilter;
    return matchStatus && matchType;
  });

  const handleResolve = async (id: string) => {
    try { await resolve.mutateAsync(id); toast('Report resolved'); }
    catch { toast('Failed', 'error'); }
  };

  const handleDismiss = async (id: string) => {
    try { await dismiss.mutateAsync(id); toast('Report dismissed', 'info'); }
    catch { toast('Failed', 'error'); }
  };

  const columns = [
    { header: 'Reported By', accessor: (r: Report) => <span className="font-mono text-xs">{r.reportedBy?.slice(0, 8)}…</span> },
    { header: 'Target', accessor: (r: Report) => (
      <span className="capitalize">{r.targetType} <span className="font-mono text-xs text-gray-400">{r.targetId?.slice(0, 8)}…</span></span>
    )},
    { header: 'Reason', accessor: (r: Report) => <span className="line-clamp-1 max-w-xs">{r.reason}</span> },
    { header: 'Status', accessor: (r: Report) => <Badge label={r.status} variant={statusVariant(r.status)} /> },
    { header: 'Date', accessor: (r: Report) => new Date(r.createdAt).toLocaleDateString() },
    { header: 'Actions', accessor: (r: Report) => r.status === 'pending' ? (
      <div className="flex gap-1">
        <Button variant="primary" onClick={() => handleResolve(r.id)} loading={resolve.isPending} className="text-xs px-2 py-1">Resolve</Button>
        <Button variant="ghost" onClick={() => handleDismiss(r.id)} loading={dismiss.isPending} className="text-xs px-2 py-1">Dismiss</Button>
      </div>
    ) : (
      <button onClick={() => setDetail(r)} className="text-xs text-primary hover:underline">Details</button>
    )},
  ];

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
        <span className="text-sm text-gray-500">{data?.meta.total ?? 0} total</span>
      </div>

      <div className="mb-4 flex gap-3">
        <Select value={statusFilter} onChange={setStatusFilter} placeholder="All statuses"
          options={[{ label: 'Pending', value: 'pending' }, { label: 'Resolved', value: 'resolved' }, { label: 'Dismissed', value: 'dismissed' }]} />
        <Select value={typeFilter} onChange={setTypeFilter} placeholder="All types"
          options={[{ label: 'User', value: 'user' }, { label: 'Post', value: 'post' }, { label: 'Group', value: 'group' }]} />
      </div>

      {isError && <ErrorMessage className="mb-4" />}
      <Table columns={columns} data={filtered} loading={isLoading} emptyMessage="No reports found." />
      <Pagination page={page} totalPages={data?.meta.totalPages ?? 1} onNext={nextPage} onPrev={prevPage} onPage={goToPage} />

      <Modal open={!!detail} onClose={() => setDetail(null)} title="Report Details">
        {detail && (
          <dl className="space-y-3 text-sm">
            {[
              ['ID', detail.id], ['Reported By', detail.reportedBy],
              ['Target Type', detail.targetType], ['Target ID', detail.targetId],
              ['Reason', detail.reason], ['Status', detail.status],
              ['Date', new Date(detail.createdAt).toLocaleString()],
            ].map(([k, v]) => (
              <div key={k} className="flex gap-4">
                <dt className="w-28 font-medium text-gray-500">{k}</dt>
                <dd className="text-gray-900 break-all">{v}</dd>
              </div>
            ))}
          </dl>
        )}
      </Modal>
    </div>
  );
}
