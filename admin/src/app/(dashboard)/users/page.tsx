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
import { Modal } from '@/components/ui/Modal';
import { useUsers, useBanUser, useUnbanUser } from '@/features/users/hooks';
import { usePagination } from '@/hooks/usePagination';
import { useToast } from '@/components/ui/Toast';
import type { User } from '@/types';

export default function UsersPage() {
  const { page, nextPage, prevPage, goToPage } = usePagination();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [confirmUser, setConfirmUser] = useState<User | null>(null);
  const [detailUser, setDetailUser] = useState<User | null>(null);

  const { data, isLoading, isError } = useUsers(page);
  const banUser = useBanUser();
  const unbanUser = useUnbanUser();
  const { toast } = useToast();

  const filtered = (data?.data ?? []).filter((u) => {
    const matchSearch = !search || u.email.includes(search) || u.phone.includes(search);
    const matchStatus = !statusFilter || u.status === statusFilter;
    const matchRole = !roleFilter || u.accountType === roleFilter;
    return matchSearch && matchStatus && matchRole;
  });

  const handleBanToggle = async () => {
    if (!confirmUser) return;
    try {
      if (confirmUser.status === 'banned') {
        await unbanUser.mutateAsync(confirmUser.id);
        toast(`${confirmUser.email} unbanned`);
      } else {
        await banUser.mutateAsync(confirmUser.id);
        toast(`${confirmUser.email} banned`, 'error');
      }
    } catch {
      toast('Action failed', 'error');
    } finally {
      setConfirmUser(null);
    }
  };

  const columns = [
    { header: 'Email', accessor: (u: User) => (
      <button onClick={() => setDetailUser(u)} className="text-primary hover:underline text-left">
        {u.email}
      </button>
    )},
    { header: 'Phone', accessor: 'phone' as keyof User },
    { header: 'Role', accessor: (u: User) => (
      <Badge label={u.accountType} variant={u.accountType === 'admin' ? 'danger' : 'default'} />
    )},
    { header: 'Status', accessor: (u: User) => (
      <Badge label={u.status} variant={u.status === 'active' ? 'success' : u.status === 'banned' ? 'danger' : 'warning'} />
    )},
    { header: 'Joined', accessor: (u: User) => new Date(u.createdAt).toLocaleDateString() },
    { header: 'Actions', accessor: (u: User) => (
      <Button
        variant={u.status === 'banned' ? 'ghost' : 'danger'}
        onClick={() => setConfirmUser(u)}
        className="text-xs px-2 py-1"
      >
        {u.status === 'banned' ? 'Unban' : 'Ban'}
      </Button>
    )},
  ];

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Users</h1>
        <span className="text-sm text-gray-500">{data?.meta.total ?? 0} total</span>
      </div>

      <div className="mb-4 flex flex-wrap gap-3">
        <div className="w-64">
          <SearchInput value={search} onChange={setSearch} placeholder="Search email or phone..." />
        </div>
        <Select
          value={statusFilter}
          onChange={setStatusFilter}
          placeholder="All statuses"
          options={[
            { label: 'Active', value: 'active' },
            { label: 'Pending', value: 'pending' },
            { label: 'Banned', value: 'banned' },
          ]}
        />
        <Select
          value={roleFilter}
          onChange={setRoleFilter}
          placeholder="All roles"
          options={[
            { label: 'User', value: 'user' },
            { label: 'Guardian', value: 'guardian' },
            { label: 'Agent', value: 'agent' },
            { label: 'Admin', value: 'admin' },
          ]}
        />
      </div>

      {isError && <ErrorMessage className="mb-4" />}

      <Table columns={columns} data={filtered} loading={isLoading} emptyMessage="No users found." />

      <Pagination page={page} totalPages={data?.meta.totalPages ?? 1} onNext={nextPage} onPrev={prevPage} onPage={goToPage} />

      <ConfirmDialog
        open={!!confirmUser}
        onClose={() => setConfirmUser(null)}
        onConfirm={handleBanToggle}
        title={confirmUser?.status === 'banned' ? 'Unban User' : 'Ban User'}
        message={`Are you sure you want to ${confirmUser?.status === 'banned' ? 'unban' : 'ban'} ${confirmUser?.email}?`}
        confirmLabel={confirmUser?.status === 'banned' ? 'Unban' : 'Ban'}
        loading={banUser.isPending || unbanUser.isPending}
      />

      <Modal open={!!detailUser} onClose={() => setDetailUser(null)} title="User Details">
        {detailUser && (
          <dl className="space-y-3 text-sm">
            {[
              ['ID', detailUser.id],
              ['Email', detailUser.email],
              ['Phone', detailUser.phone],
              ['Role', detailUser.accountType],
              ['Status', detailUser.status],
              ['Joined', new Date(detailUser.createdAt).toLocaleString()],
            ].map(([k, v]) => (
              <div key={k} className="flex gap-4">
                <dt className="w-20 font-medium text-gray-500">{k}</dt>
                <dd className="text-gray-900">{v}</dd>
              </div>
            ))}
          </dl>
        )}
      </Modal>
    </div>
  );
}
