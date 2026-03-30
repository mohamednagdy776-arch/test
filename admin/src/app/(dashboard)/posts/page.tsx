'use client';

import { Table } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Pagination } from '@/components/ui/Pagination';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { usePosts, useDeletePost } from '@/features/posts/hooks';
import { usePagination } from '@/hooks/usePagination';
import type { Post } from '@/types';

export default function PostsPage() {
  const { page, nextPage, prevPage, goToPage } = usePagination();
  const { data, isLoading, isError } = usePosts(page);
  const deletePost = useDeletePost();

  const columns = [
    {
      header: 'Content',
      accessor: (p: Post) => (
        <span className="line-clamp-2 max-w-xs">{p.content}</span>
      ),
    },
    { header: 'Group', accessor: 'groupId' as keyof Post },
    { header: 'Author', accessor: 'userId' as keyof Post },
    {
      header: 'Media',
      accessor: (p: Post) =>
        p.mediaUrl ? (
          <a href={p.mediaUrl} target="_blank" rel="noreferrer" className="text-primary underline text-xs">
            View
          </a>
        ) : (
          <span className="text-gray-400 text-xs">None</span>
        ),
    },
    {
      header: 'Date',
      accessor: (p: Post) => new Date(p.createdAt).toLocaleDateString(),
    },
    {
      header: 'Actions',
      accessor: (p: Post) => (
        <Button
          variant="danger"
          onClick={() => deletePost.mutate(p.id)}
          loading={deletePost.isPending}
          className="text-xs px-2 py-1"
        >
          Delete
        </Button>
      ),
    },
  ];

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Posts</h1>

      {isError && <ErrorMessage className="mb-4" />}

      <Table
        columns={columns}
        data={data?.data ?? []}
        loading={isLoading}
        emptyMessage="No posts found."
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
