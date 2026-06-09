'use client';

import { useState } from 'react';
import { Table } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Pagination } from '@/components/ui/Pagination';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { SearchInput } from '@/components/ui/SearchInput';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Modal } from '@/components/ui/Modal';
import { useComments, useDeleteComment } from '@/features/comments/hooks';
import { usePagination } from '@/hooks/usePagination';
import { useToast } from '@/components/ui/Toast';
import type { Comment } from '@/features/comments/api';

export default function CommentsPage() {
  const { page, nextPage, prevPage, goToPage } = usePagination();
  const [search, setSearch] = useState('');
  const [confirmComment, setConfirmComment] = useState<Comment | null>(null);
  const [detailComment, setDetailComment] = useState<Comment | null>(null);
  const { data, isLoading, isError } = useComments(page);
  const deleteComment = useDeleteComment();
  const { toast } = useToast();

  const filtered = (data?.data ?? []).filter((c) =>
    !search || c.content.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async () => {
    if (!confirmComment) return;
    try {
      await deleteComment.mutateAsync(confirmComment.id);
      toast('Comment deleted');
    } catch {
      toast('Delete failed', 'error');
    } finally {
      setConfirmComment(null);
    }
  };

  const columns = [
    { header: 'Content', accessor: (c: Comment) => (
      <button onClick={() => setDetailComment(c)} className="text-left text-primary hover:underline line-clamp-2 max-w-xs">
        {c.content}
      </button>
    )},
    { header: 'Post', accessor: (c: Comment) => <span className="font-mono text-xs">{c.postId?.slice(0, 8)}…</span> },
    { header: 'Author', accessor: (c: Comment) => <span className="font-mono text-xs">{c.userId?.slice(0, 8)}…</span> },
    { header: 'Parent', accessor: (c: Comment) => c.parentId ? <span className="font-mono text-xs">{c.parentId.slice(0, 8)}…</span> : '-' },
    { header: 'Date', accessor: (c: Comment) => new Date(c.createdAt).toLocaleDateString() },
    { header: 'Actions', accessor: (c: Comment) => (
      <Button variant="danger" onClick={() => setConfirmComment(c)} className="text-xs px-2 py-1">Delete</Button>
    )},
  ];

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Comments</h1>
        <span className="text-sm text-slate-500">{data?.meta.total ?? 0} total</span>
      </div>
      <div className="mb-4 w-64">
        <SearchInput value={search} onChange={setSearch} placeholder="Search comments..." />
      </div>
      {isError && <ErrorMessage className="mb-4" />}
      <Table columns={columns} data={filtered} loading={isLoading} emptyMessage="No comments found." />
      <Pagination page={page} totalPages={data?.meta.totalPages ?? 1} onNext={nextPage} onPrev={prevPage} onPage={goToPage} />
      <ConfirmDialog open={!!confirmComment} onClose={() => setConfirmComment(null)} onConfirm={handleDelete}
        title="Delete Comment" message="Delete this comment? This cannot be undone." confirmLabel="Delete" loading={deleteComment.isPending} />
      <Modal open={!!detailComment} onClose={() => setDetailComment(null)} title="Comment Details" size="lg">
        {detailComment && (
          <div className="space-y-4 text-sm">
            <p className="text-gray-800 whitespace-pre-wrap">{detailComment.content}</p>
            <dl className="grid grid-cols-2 gap-3 border-t pt-4">
              {[['Comment ID', detailComment.id], ['Post', detailComment.postId], ['Author', detailComment.userId], 
                ['Parent', detailComment.parentId || '-'], ['Created', new Date(detailComment.createdAt).toLocaleString()]].map(([k, v]) => (
                <div key={k}><dt className="text-xs font-medium text-gray-500">{k}</dt><dd className="text-gray-900 font-mono text-xs break-all">{v}</dd></div>
              ))}
            </dl>
          </div>
        )}
      </Modal>
    </div>
  );
}
