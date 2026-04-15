'use client';

import { useState } from 'react';
import { Table } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Pagination } from '@/components/ui/Pagination';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { SearchInput } from '@/components/ui/SearchInput';
import { Select } from '@/components/ui/Select';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useGroups, useDeleteGroup } from '@/features/groups/hooks';
import { usePagination } from '@/hooks/usePagination';
import { useToast } from '@/components/ui/Toast';
import type { Group } from '@/types';

export default function GroupsPage() {
  const { page, nextPage, prevPage, goToPage } = usePagination();
  const [search, setSearch] = useState('');
  const [privacyFilter, setPrivacyFilter] = useState('');
  const [confirmGroup, setConfirmGroup] = useState<Group | null>(null);

  const { data, isLoading, isError } = useGroups(page);
  const deleteGroup = useDeleteGroup();
  const { toast } = useToast();

  const filtered = (data?.data ?? []).filter((g) => {
    const matchSearch = !search || g.name.toLowerCase().includes(search.toLowerCase());
    const matchPrivacy = !privacyFilter || g.privacy === privacyFilter;
    return matchSearch && matchPrivacy;
  });

  const handleDelete = async () => {
    if (!confirmGroup) return;
    try {
      await deleteGroup.mutateAsync(confirmGroup.id);
      toast(`Group "${confirmGroup.name}" deleted`);
    } catch {
      toast('Delete failed', 'error');
    } finally {
      setConfirmGroup(null);
    }
  };

  const columns = [
    { header: 'Name', accessor: 'name' as keyof Group },
    { header: 'Description', accessor: (g: Group) => (
      <span className="line-clamp-1 max-w-xs text-gray-500">{g.description || '—'}</span>
    )},
    { header: 'Privacy', accessor: (g: Group) => (
      <Badge label={g.privacy} variant={g.privacy === 'public' ? 'success' : 'warning'} />
    )},
    { header: 'Created', accessor: (g: Group) => new Date(g.createdAt).toLocaleDateString() },
    { header: 'Actions', accessor: (g: Group) => (
      <Button variant="danger" onClick={() => setConfirmGroup(g)} className="text-xs px-2 py-1">
        Delete
      </Button>
    )},
  ];

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Groups</h1>
        <span className="text-sm text-slate-500">{data?.meta.total ?? 0} total</span>
      </div>

      <div className="mb-4 flex flex-wrap gap-3">
        <div className="w-64">
          <SearchInput value={search} onChange={setSearch} placeholder="Search by name..." />
        </div>
        <Select
          value={privacyFilter}
          onChange={setPrivacyFilter}
          placeholder="All privacy"
          options={[
            { label: 'Public', value: 'public' },
            { label: 'Private', value: 'private' },
          ]}
        />
      </div>

      {isError && <ErrorMessage className="mb-4" />}

      <Table columns={columns} data={filtered} loading={isLoading} emptyMessage="No groups found." />

      <Pagination page={page} totalPages={data?.meta.totalPages ?? 1} onNext={nextPage} onPrev={prevPage} onPage={goToPage} />

      <ConfirmDialog
        open={!!confirmGroup}
        onClose={() => setConfirmGroup(null)}
        onConfirm={handleDelete}
        title="Delete Group"
        message={`Delete "${confirmGroup?.name}"? This cannot be undone.`}
        confirmLabel="Delete"
        loading={deleteGroup.isPending}
      />
    </div>
  );
}
