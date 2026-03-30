'use client';

import { Table } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Pagination } from '@/components/ui/Pagination';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { useUsers, useBanUser, useUnbanUser } from '@/features/users/hooks';
import { usePagination } from '@/hooks/usePagination';
import type { User } from '@/types';

export default function UsersPage() {
  const { page, nextPage, prevPage, goToPage } = usePagination();
  const { data, isLoading, isError } = useUsers(page);
  const banUser = useBanUser();
  const unbanUser = useUnbanUser();

  const columns = [
    { header: 'Email', accessor: 'email' as keyof User },
    { header: 'Phone', accessor: 'phone' as keyof User },
    {
      header: 'Role',
      accessor: (u: User) => (
        <Badge
          label={u.accountType}
          variant={u.accountType === 'admin' ? 'danger' : 'default'}
        />
      ),
    },
    {
      header: 'Status',
      accessor: (u: User) => (
        <Badge
          label={u.status}
          variant={u.status === 'active' ? 'success' : u.status === 'banned' ? 'danger' : 'warning'}
        />
      ),
    },
    {
      header: 'Joined',
      accessor: (u: User) => new Date(u.createdAt).toLocaleDateString(),
    },
    {
      header: 'Actions',
      accessor: (u: User) => (
        <Button
          variant={u.status === 'banned' ? 'ghost' : 'danger'}
          onClick={() => u.status === 'banned' ? unbanUser.mutate(u.id) : banUser.mutate(u.id)}
          loading={banUser.isPending || unbanUser.isPending}
          className="text-xs px-2 py-1"
        >
          {u.status === 'banned' ? 'Unban' : 'Ban'}
        </Button>
      ),
    },
  ];

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Users</h1>

      {isError && <ErrorMessage className="mb-4" />}

      <Table
        columns={columns}
        data={data?.data ?? []}
        loading={isLoading}
        emptyMessage="No users found."
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
