'use client';

import { Table } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Pagination } from '@/components/ui/Pagination';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { useGroups, useDeleteGroup } from '@/features/groups/hooks';
import { usePagination } from '@/hooks/usePagination';
import type { Group } from '@/types';

export default function GroupsPage() {
  const { page, nextPage, prevPage, goToPage } = usePagination();
  const { data, isLoading, isError } = useGroups(page);
  const deleteGroup = useDeleteGroup();

  const columns = [
    { header: 'Name', accessor: 'name' as keyof Group },
    { header: 'Description', accessor: 'description' as keyof Group },
    {
      header: 'Privacy',
      accessor: (g: Group) => (
        <Badge label={g.privacy} variant={g.privacy === 'public' ? 'success' : 'warning'} />
      ),
    },
    {
      header: 'Created',
      accessor: (g: Group) => new Date(g.createdAt).toLocaleDateString(),
    },
    {
      header: 'Actions',
      accessor: (g: Group) => (
        <Button
          variant="danger"
          onClick={() => deleteGroup.mutate(g.id)}
          loading={deleteGroup.isPending}
          className="text-xs px-2 py-1"
        >
          Delete
        </Button>
      ),
    },
  ];

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Groups</h1>

      {isError && <ErrorMessage className="mb-4" />}

      <Table
        columns={columns}
        data={data?.data ?? []}
        loading={isLoading}
        emptyMessage="No groups found."
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
