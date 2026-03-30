'use client';

import { useState } from 'react';
import { Table } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Pagination } from '@/components/ui/Pagination';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import { useMatches } from '@/features/matching/hooks';
import { usePagination } from '@/hooks/usePagination';
import type { Match } from '@/types';

const statusVariant = (s: Match['status']) =>
  s === 'accepted' ? 'success' : s === 'rejected' ? 'danger' : 'warning';

const scoreColor = (score: number) => {
  if (score >= 80) return 'text-green-600';
  if (score >= 60) return 'text-yellow-600';
  return 'text-red-600';
};

export default function MatchingPage() {
  const { page, nextPage, prevPage, goToPage } = usePagination();
  const [statusFilter, setStatusFilter] = useState('');
  const [detail, setDetail] = useState<Match | null>(null);
  const { data, isLoading, isError } = useMatches(page);

  const filtered = (data?.data ?? []).filter((m) =>
    !statusFilter || m.status === statusFilter
  );

  const columns = [
    { header: 'User 1', accessor: (m: Match) => (
      <span className="font-mono text-xs">{m.user1Id.slice(0, 8)}…</span>
    )},
    { header: 'User 2', accessor: (m: Match) => (
      <span className="font-mono text-xs">{m.user2Id.slice(0, 8)}…</span>
    )},
    { header: 'Score', accessor: (m: Match) => (
      <span className={`font-bold text-base ${scoreColor(m.score)}`}>{m.score}%</span>
    )},
    { header: 'Status', accessor: (m: Match) => (
      <Badge label={m.status} variant={statusVariant(m.status)} />
    )},
    { header: 'Date', accessor: (m: Match) => new Date(m.createdAt).toLocaleDateString() },
    { header: 'Details', accessor: (m: Match) => (
      <button onClick={() => setDetail(m)} className="text-xs text-primary hover:underline">View</button>
    )},
  ];

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Matching</h1>
        <span className="text-sm text-gray-500">{data?.meta.total ?? 0} total matches</span>
      </div>

      <div className="mb-4 flex gap-3">
        <Select
          value={statusFilter}
          onChange={setStatusFilter}
          placeholder="All statuses"
          options={[
            { label: 'Pending', value: 'pending' },
            { label: 'Accepted', value: 'accepted' },
            { label: 'Rejected', value: 'rejected' },
          ]}
        />
      </div>

      {isError && <ErrorMessage className="mb-4" />}

      <Table columns={columns} data={filtered} loading={isLoading} emptyMessage="No matches found." />

      <Pagination page={page} totalPages={data?.meta.totalPages ?? 1} onNext={nextPage} onPrev={prevPage} onPage={goToPage} />

      <Modal open={!!detail} onClose={() => setDetail(null)} title="Match Details">
        {detail && (
          <dl className="space-y-3 text-sm">
            {[
              ['Match ID', detail.id],
              ['User 1', detail.user1Id],
              ['User 2', detail.user2Id],
              ['Score', `${detail.score}%`],
              ['Status', detail.status],
              ['Created', new Date(detail.createdAt).toLocaleString()],
            ].map(([k, v]) => (
              <div key={k} className="flex gap-4">
                <dt className="w-24 font-medium text-gray-500">{k}</dt>
                <dd className="text-gray-900 break-all">{v}</dd>
              </div>
            ))}
          </dl>
        )}
      </Modal>
    </div>
  );
}
