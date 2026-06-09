'use client';

import { useState } from 'react';
import { Table } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Pagination } from '@/components/ui/Pagination';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { SearchInput } from '@/components/ui/SearchInput';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { useNotifications, useDeleteNotification, useMarkNotificationAsRead } from '@/features/notifications/hooks';
import { usePagination } from '@/hooks/usePagination';
import { useToast } from '@/components/ui/Toast';
import type { Notification } from '@/features/notifications/api';

export default function NotificationsPage() {
  const { page, nextPage, prevPage, goToPage } = usePagination();
  const [search, setSearch] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<Notification | null>(null);
  const [detailNotification, setDetailNotification] = useState<Notification | null>(null);
  const { data, isLoading, isError } = useNotifications(page);
  const deleteNotification = useDeleteNotification();
  const markAsRead = useMarkNotificationAsRead();
  const { toast } = useToast();

  const filtered = (data?.data ?? []).filter((n) =>
    !search || n.title.toLowerCase().includes(search.toLowerCase()) || n.message.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      await deleteNotification.mutateAsync(confirmDelete.id);
      toast('Notification deleted');
    } catch {
      toast('Delete failed', 'error');
    } finally {
      setConfirmDelete(null);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await markAsRead.mutateAsync(id);
      toast('Marked as read');
    } catch {
      toast('Failed to mark as read', 'error');
    }
  };

  const columns = [
    { header: 'Status', accessor: (n: Notification) => (
      n.isRead ? <Badge variant="success">Read</Badge> : <Badge variant="warning">Unread</Badge>
    )},
    { header: 'Title', accessor: (n: Notification) => (
      <button onClick={() => setDetailNotification(n)} className="text-left text-primary hover:underline">
        {n.title}
      </button>
    )},
    { header: 'Type', accessor: (n: Notification) => <span className="text-xs">{n.type}</span> },
    { header: 'User', accessor: (n: Notification) => <span className="font-mono text-xs">{n.userId?.slice(0, 8)}…</span> },
    { header: 'Date', accessor: (n: Notification) => new Date(n.createdAt).toLocaleDateString() },
    { header: 'Actions', accessor: (n: Notification) => (
      <div className="flex gap-1">
        {!n.isRead && (
          <Button variant="ghost" onClick={() => handleMarkAsRead(n.id)} className="text-xs px-2 py-1">Read</Button>
        )}
        <Button variant="danger" onClick={() => setConfirmDelete(n)} className="text-xs px-2 py-1">Delete</Button>
      </div>
    )},
  ];

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Notifications</h1>
        <span className="text-sm text-slate-500">{data?.meta.total ?? 0} total</span>
      </div>
      <div className="mb-4 w-64">
        <SearchInput value={search} onChange={setSearch} placeholder="Search notifications..." />
      </div>
      {isError && <ErrorMessage className="mb-4" />}
      <Table columns={columns} data={filtered} loading={isLoading} emptyMessage="No notifications found." />
      <Pagination page={page} totalPages={data?.meta.totalPages ?? 1} onNext={nextPage} onPrev={prevPage} onPage={goToPage} />
      <ConfirmDialog open={!!confirmDelete} onClose={() => setConfirmDelete(null)} onConfirm={handleDelete}
        title="Delete Notification" message="Delete this notification?" confirmLabel="Delete" loading={deleteNotification.isPending} />
      <Modal open={!!detailNotification} onClose={() => setDetailNotification(null)} title="Notification Details" size="lg">
        {detailNotification && (
          <div className="space-y-4 text-sm">
            <div>
              <h3 className="font-semibold text-lg">{detailNotification.title}</h3>
              <p className="text-gray-600 mt-2">{detailNotification.message}</p>
            </div>
            <dl className="grid grid-cols-2 gap-3 border-t pt-4">
              {[['Type', detailNotification.type], ['User', detailNotification.userId], 
                ['Status', detailNotification.isRead ? 'Read' : 'Unread'], ['Created', new Date(detailNotification.createdAt).toLocaleString()]].map(([k, v]) => (
                <div key={k}><dt className="text-xs font-medium text-gray-500">{k}</dt><dd className="text-gray-900 font-mono text-xs break-all">{v}</dd></div>
              ))}
            </dl>
          </div>
        )}
      </Modal>
    </div>
  );
}
