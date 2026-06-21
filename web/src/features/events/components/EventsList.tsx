'use client';
import Link from 'next/link';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Spinner } from '@/components/ui/Spinner';
import { Modal } from '@/components/ui/Modal';
import { useRsvpEvent, useDeleteEvent } from '../hooks';
import { useToast } from '@/components/ui/Toast';
import { getCurrentUserId } from '@/lib/socket-client';

export const EventsList = () => {
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['events'],
    queryFn: () => apiClient.get('/events').then(res => res.data),
  });

  const rsvpEvent = useRsvpEvent();
  const deleteEvent = useDeleteEvent();
  const { showToast } = useToast();
  const myUserId = getCurrentUserId();

  const handleRsvp = async (eventId: string, status: 'going' | 'interested' | 'not_going', e: React.MouseEvent) => {
    e.preventDefault();
    try {
      await rsvpEvent.mutateAsync({ eventId, status });
      showToast('تم تحديث حالة الحضور بنجاح', 'success');
      refetch();
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'فشل تحديث حالة الحضور', 'error');
    }
  };

  const handleDelete = async () => {
    if (!confirmDeleteId) return;
    try {
      await deleteEvent.mutateAsync(confirmDeleteId);
      showToast('تم حذف الحدث بنجاح', 'success');
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'فشل حذف الحدث', 'error');
    } finally {
      setConfirmDeleteId(null);
    }
  };

  if (isLoading) return <Spinner />;

  if (isError) {
    return (
      <div className="rounded-2xl bg-gradient-to-br from-[#ECFDF5] to-[#F0FDF4] border border-emerald-100 p-8 text-center">
        <p className="text-2xl mb-2">⚠️</p>
        <p className="text-[#10B981] text-sm">تعذّر تحميل الأحداث</p>
        <button onClick={() => refetch()} className="mt-3 text-xs text-[#059669] underline">إعادة المحاولة</button>
      </div>
    );
  }

  const events = data?.data || [];

  return (
    <div className="space-y-3">
      {events.length === 0 ? (
        <div className="rounded-2xl bg-gradient-to-br from-[#ECFDF5] to-[#F0FDF4] border border-emerald-100 p-10 text-center">
          <p className="text-3xl mb-2">📅</p>
          <p className="text-[#10B981]">لا توجد أحداث</p>
        </div>
      ) : (
        events.map((event: any) => (
          <Link
            key={event.id}
            href={`/events/${event.id}`}
            className="block rounded-2xl bg-gradient-to-br from-[#ECFDF5] to-[#F0FDF4] border border-emerald-100 p-5 shadow-sm hover:shadow-lg hover:shadow-emerald-500/10 transition-all"
          >
            <div className="flex items-start justify-between gap-3 mb-2">
              <h3 className="font-semibold text-[#065F46]">{event.title}</h3>
              <div className="flex items-center gap-2 shrink-0">
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                  event.privacy === 'public' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                }`}>
                  {event.privacy === 'public' ? 'عام' : 'خاص'}
                </span>
                {myUserId && (event.creatorId === myUserId || event.userId === myUserId) && (
                  <button
                    onClick={(e) => { e.preventDefault(); setConfirmDeleteId(event.id); }}
                    disabled={deleteEvent.isPending}
                    className="text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg p-1 transition-colors disabled:opacity-50"
                    title="حذف الحدث"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
            <p className="text-xs text-[#10B981] mb-1">
              {event.startDate ? new Date(event.startDate).toLocaleDateString('ar-SA', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' }) : ''}
              {event.location && ` · 📍 ${event.location}`}
            </p>
            {event.description && (
              <p className="text-sm text-[#10B981]/70 line-clamp-2 mb-3">{event.description}</p>
            )}
            <div className="flex gap-2 mt-2" onClick={(e) => e.preventDefault()}>
              <button
                onClick={(e) => handleRsvp(event.id, 'going', e)}
                disabled={rsvpEvent.isPending}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all disabled:opacity-50 ${event.userRsvp === 'going' ? 'bg-emerald-500 text-white' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'}`}
              >
                ✅ ذاهب ({event.goingCount || 0})
              </button>
              <button
                onClick={(e) => handleRsvp(event.id, 'interested', e)}
                disabled={rsvpEvent.isPending}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all disabled:opacity-50 ${event.userRsvp === 'interested' ? 'bg-amber-500 text-white' : 'bg-amber-50 text-amber-700 hover:bg-amber-100'}`}
              >
                ⭐ مهتم ({event.interestedCount || 0})
              </button>
            </div>
          </Link>
        ))
      )}
      <Modal open={!!confirmDeleteId} onClose={() => setConfirmDeleteId(null)} title="حذف الحدث">
        <div className="space-y-4">
          <p className="text-sm text-[#10B981]">هل أنت متأكد من حذف هذا الحدث؟ لا يمكن التراجع عن هذا الإجراء.</p>
          <div className="flex gap-3">
            <button onClick={() => setConfirmDeleteId(null)} className="flex-1 rounded-xl border border-emerald-200 py-2.5 text-sm text-[#10B981] hover:bg-[#ECFDF5] transition-colors">إلغاء</button>
            <button onClick={handleDelete} disabled={deleteEvent.isPending} className="flex-1 rounded-xl bg-red-500 py-2.5 text-sm font-semibold text-white hover:bg-red-600 disabled:opacity-50 transition-colors">
              {deleteEvent.isPending ? '...' : 'تأكيد الحذف'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};