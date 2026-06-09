'use client';

import { useState } from 'react';
import { Table } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Pagination } from '@/components/ui/Pagination';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { SearchInput } from '@/components/ui/SearchInput';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Modal } from '@/components/ui/Modal';
import { useEvents, useDeleteEvent } from '@/features/events/hooks';
import { usePagination } from '@/hooks/usePagination';
import { useToast } from '@/components/ui/Toast';
import type { Event } from '@/features/events/api';

export default function EventsPage() {
  const { page, nextPage, prevPage, goToPage } = usePagination();
  const [search, setSearch] = useState('');
  const [confirmEvent, setConfirmEvent] = useState<Event | null>(null);
  const [detailEvent, setDetailEvent] = useState<Event | null>(null);
  const { data, isLoading, isError } = useEvents(page);
  const deleteEvent = useDeleteEvent();
  const { toast } = useToast();

  const filtered = (data?.data ?? []).filter((e) =>
    !search || e.title.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async () => {
    if (!confirmEvent) return;
    try {
      await deleteEvent.mutateAsync(confirmEvent.id);
      toast('Event deleted');
    } catch {
      toast('Delete failed', 'error');
    } finally {
      setConfirmEvent(null);
    }
  };

  const columns = [
    { header: 'Title', accessor: (e: Event) => (
      <button onClick={() => setDetailEvent(e)} className="text-left text-primary hover:underline">
        {e.title}
      </button>
    )},
    { header: 'Location', accessor: (e: Event) => e.location || '-' },
    { header: 'Start Date', accessor: (e: Event) => new Date(e.startDate).toLocaleDateString() },
    { header: 'End Date', accessor: (e: Event) => new Date(e.endDate).toLocaleDateString() },
    { header: 'Organizer', accessor: (e: Event) => <span className="font-mono text-xs">{e.organizerId?.slice(0, 8)}…</span> },
    { header: 'Actions', accessor: (e: Event) => (
      <Button variant="danger" onClick={() => setConfirmEvent(e)} className="text-xs px-2 py-1">Delete</Button>
    )},
  ];

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Events</h1>
        <span className="text-sm text-slate-500">{data?.meta.total ?? 0} total</span>
      </div>
      <div className="mb-4 w-64">
        <SearchInput value={search} onChange={setSearch} placeholder="Search events..." />
      </div>
      {isError && <ErrorMessage className="mb-4" />}
      <Table columns={columns} data={filtered} loading={isLoading} emptyMessage="No events found." />
      <Pagination page={page} totalPages={data?.meta.totalPages ?? 1} onNext={nextPage} onPrev={prevPage} onPage={goToPage} />
      <ConfirmDialog open={!!confirmEvent} onClose={() => setConfirmEvent(null)} onConfirm={handleDelete}
        title="Delete Event" message="Delete this event? This cannot be undone." confirmLabel="Delete" loading={deleteEvent.isPending} />
      <Modal open={!!detailEvent} onClose={() => setDetailEvent(null)} title="Event Details" size="lg">
        {detailEvent && (
          <div className="space-y-4 text-sm">
            <div>
              <h3 className="font-semibold text-lg">{detailEvent.title}</h3>
              <p className="text-gray-600 mt-2">{detailEvent.description}</p>
            </div>
            <dl className="grid grid-cols-2 gap-3 border-t pt-4">
              {[['Location', detailEvent.location], ['Start', new Date(detailEvent.startDate).toLocaleString()], 
                ['End', new Date(detailEvent.endDate).toLocaleString()], ['Organizer', detailEvent.organizerId]].map(([k, v]) => (
                <div key={k}><dt className="text-xs font-medium text-gray-500">{k}</dt><dd className="text-gray-900 font-mono text-xs break-all">{v}</dd></div>
              ))}
            </dl>
          </div>
        )}
      </Modal>
    </div>
  );
}
