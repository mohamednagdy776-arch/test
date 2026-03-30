'use client';

import { useState } from 'react';
import { Table } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Pagination } from '@/components/ui/Pagination';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { SearchInput } from '@/components/ui/SearchInput';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Modal } from '@/components/ui/Modal';
import { usePosts, useDeletePost } from '@/features/posts/hooks';
import { usePagination } from '@/hooks/usePagination';
import { useToast } from '@/components/ui/Toast';
import type { Post } from '@/types';

export default function PostsPage() {
  const { page, nextPage, prevPage, goToPage } = usePagination();
  const [search, setSearch] = useState('');
  const [confirmPost, setConfirmPost] = useState<Post | null>(null);
  const [detailPost, setDetailPost] = useState<Post | null>(null);
  const { data, isLoading, isError } = usePosts(page);
  const deletePost = useDeletePost();
  const { toast } = useToast();

  const filtered = (data?.data ?? []).filter((p) =>
    !search || p.content.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async () => {
    if (!confirmPost) return;
    try {
      await deletePost.mutateAsync(confirmPost.id);
      toast('Post deleted');
    } catch {
      toast('Delete failed', 'error');
    } finally {
      setConfirmPost(null);
    }
  };

  const columns = [
    { header: 'Content', accessor: (p: Post) => (
      <button onClick={() => setDetailPost(p)} className="text-left text-primary hover:underline line-clamp-2 max-w-xs">
        {p.content}
      </button>
    )},
    { header: 'Group', accessor: (p: Post) => <span className="font-mono text-xs">{p.groupId?.slice(0, 8)}…</span> },
    { header: 'Author', accessor: (p: Post) => <span className="font-mono text-xs">{p.userId?.slice(0, 8)}…</span> },
    { header: 'Media', accessor: (p: Post) => p.mediaUrl
      ? <a href={p.mediaUrl} target="_blank" rel="noreferrer" className="text-primary underline text-xs">View</a>
      : <span className="text-gray-400 text-xs">None</span>
    },
    { header: 'Date', accessor: (p: Post) => new Date(p.createdAt).toLocaleDateString() },
    { header: 'Actions', accessor: (p: Post) => (
      <Button variant="danger" onClick={() => setConfirmPost(p)} className="text-xs px-2 py-1">Delete</Button>
    )},
  ];

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Posts</h1>
        <span className="text-sm text-gray-500">{data?.meta.total ?? 0} total</span>
      </div>
      <div className="mb-4 w-64">
        <SearchInput value={search} onChange={setSearch} placeholder="Search content..." />
      </div>
      {isError && <ErrorMessage className="mb-4" />}
      <Table columns={columns} data={filtered} loading={isLoading} emptyMessage="No posts found." />
      <Pagination page={page} totalPages={data?.meta.totalPages ?? 1} onNext={nextPage} onPrev={prevPage} onPage={goToPage} />
      <ConfirmDialog open={!!confirmPost} onClose={() => setConfirmPost(null)} onConfirm={handleDelete}
        title="Delete Post" message="Delete this post? This cannot be undone." confirmLabel="Delete" loading={deletePost.isPending} />
      <Modal open={!!detailPost} onClose={() => setDetailPost(null)} title="Post Details" size="lg">
        {detailPost && (
          <div className="space-y-4 text-sm">
            <p className="text-gray-800 whitespace-pre-wrap">{detailPost.content}</p>
            {detailPost.mediaUrl && <a href={detailPost.mediaUrl} target="_blank" rel="noreferrer" className="text-primary underline">View Media</a>}
            <dl className="grid grid-cols-2 gap-3 border-t pt-4">
              {[['Post ID', detailPost.id], ['Group', detailPost.groupId], ['Author', detailPost.userId], ['Created', new Date(detailPost.createdAt).toLocaleString()]].map(([k, v]) => (
                <div key={k}><dt className="text-xs font-medium text-gray-500">{k}</dt><dd className="text-gray-900 font-mono text-xs break-all">{v}</dd></div>
              ))}
            </dl>
          </div>
        )}
      </Modal>
    </div>
  );
}
