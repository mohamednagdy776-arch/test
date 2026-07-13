'use client';
import Link from 'next/link';
import { resolveMediaUrl } from '@/lib/media';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Modal } from '@/components/ui/Modal';
import { useRsvpEvent, useDeleteEvent } from '../hooks';
import { useToast } from '@/components/ui/Toast';
import { getCurrentUserId } from '@/lib/socket-client';
import {
  CalendarBlank, MapPin, Users, Trash, Check, Star, X as XIcon,
  Globe, Lock,
} from '@phosphor-icons/react';


function privacyBadge(privacy: string) {
  if (privacy === 'public')
    return { label: 'عام', icon: Globe, style: { background: 'color-mix(in srgb, var(--primary) 10%, var(--muted))', color: 'var(--primary)' } };
  return { label: 'خاص', icon: Lock, style: { background: 'color-mix(in srgb, var(--accent) 12%, var(--muted))', color: 'var(--accent)' } };
}

function rsvpStyle(active: boolean, kind: 'going' | 'interested' | 'not_going') {
  if (kind === 'going')
    return active
      ? { background: 'linear-gradient(135deg, var(--primary), var(--secondary))', color: 'white' }
      : { background: 'color-mix(in srgb, var(--primary) 8%, var(--muted))', color: 'var(--primary)' };
  if (kind === 'interested')
    return active
      ? { background: 'linear-gradient(135deg, var(--accent), #c8952e)', color: 'white' }
      : { background: 'color-mix(in srgb, var(--accent) 10%, var(--muted))', color: 'var(--accent)' };
  return active
    ? { background: 'var(--destructive)', color: 'white' }
    : { background: 'color-mix(in srgb, var(--destructive) 8%, var(--muted))', color: 'var(--destructive)' };
}

interface EventCardProps {
  event: any;
  myUserId: string | null;
  onRsvp: (eventId: string, status: 'going' | 'interested' | 'not_going', e: React.MouseEvent) => void;
  onDelete: (id: string) => void;
  isRsvpPending: boolean;
}

function EventCard({ event, myUserId, onRsvp, onDelete, isRsvpPending }: EventCardProps) {
  const date   = event.startDate ? new Date(event.startDate) : null;
  const day    = date?.getDate();
  const month  = date?.toLocaleDateString('ar-SA', { month: 'short' });
  const badge  = privacyBadge(event.privacy);
  const BadgeIcon = badge.icon;
  const isOwner = myUserId && (event.creatorId === myUserId || event.userId === myUserId);
  const coverSrc = event.coverPhoto
    ? (resolveMediaUrl(event.coverPhoto))
    : null;

  return (
    <Link href={`/events/${event.id}`}
      className="block rounded-2xl overflow-hidden transition-all hover:-translate-y-0.5 group"
      style={{ background: 'var(--card)', border: '1px solid var(--border)', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>

      {/* Cover strip / mini banner */}
      {coverSrc ? (
        <div className="relative h-28 overflow-hidden">
          <Image src={coverSrc} alt={event.title} fill className="object-cover" />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.4) 0%, transparent 60%)' }} />
        </div>
      ) : (
        <div className="h-1.5 w-full" style={{ background: 'linear-gradient(90deg, var(--primary), var(--accent))' }} />
      )}

      <div className="p-4">
        <div className="flex items-start gap-3 mb-3">
          {/* Date square */}
          <div className="shrink-0 w-12 h-14 rounded-xl flex flex-col items-center justify-center"
            style={{ background: 'color-mix(in srgb, var(--accent) 12%, var(--muted))' }}>
            {date ? (
              <>
                <span className="text-lg font-extrabold leading-none tabular-nums" style={{ color: 'var(--accent)' }}>{day}</span>
                <span className="text-[10px] font-semibold mt-0.5" style={{ color: 'var(--accent)' }}>{month}</span>
              </>
            ) : (
              <CalendarBlank size={20} style={{ color: 'var(--accent)' }} />
            )}
          </div>

          {/* Title + meta */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-bold text-sm leading-snug line-clamp-2 flex-1"
                style={{ color: 'var(--foreground)' }}>
                {event.title}
              </h3>
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="flex items-center gap-1 rounded-lg px-2 py-0.5 text-[11px] font-bold"
                  style={badge.style}>
                  <BadgeIcon size={9} />
                  {badge.label}
                </span>
                {isOwner && (
                  <button
                    onClick={(e) => { e.preventDefault(); onDelete(event.id); }}
                    aria-label="حذف الحدث"
                    className="flex items-center justify-center w-6 h-6 rounded-lg transition-all hover:scale-110 active:scale-95"
                    style={{ color: 'var(--destructive)', background: 'color-mix(in srgb, var(--destructive) 8%, transparent)' }}>
                    <Trash size={11} />
                  </button>
                )}
              </div>
            </div>

            {date && (
              <p className="flex items-center gap-1 text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>
                <CalendarBlank size={10} />
                {date.toLocaleDateString('ar-SA', { weekday: 'short', day: 'numeric', month: 'short' })}
                {' · '}
                {date.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
              </p>
            )}
            {event.location && (
              <p className="flex items-center gap-1 text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
                <MapPin size={10} />
                {event.location}
              </p>
            )}
          </div>
        </div>

        {/* Description */}
        {event.description && (
          <p className="text-xs leading-relaxed line-clamp-2 mb-3" style={{ color: 'var(--muted-foreground)' }}>
            {event.description}
          </p>
        )}

        {/* Attendee counts */}
        <div className="flex items-center gap-3 mb-3">
          <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--muted-foreground)' }}>
            <Users size={11} />
            <span className="font-semibold tabular-nums" style={{ color: 'var(--foreground)' }}>{event.goingCount ?? 0}</span> ذاهب
          </span>
          <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
            <span className="font-semibold tabular-nums" style={{ color: 'var(--foreground)' }}>{event.interestedCount ?? 0}</span> مهتم
          </span>
        </div>

        {/* RSVP buttons */}
        <div className="flex gap-2" onClick={(e) => e.preventDefault()}>
          {([
            { status: 'going'      as const, icon: Check, label: 'سأحضر' },
            { status: 'interested' as const, icon: Star,  label: 'مهتم' },
            { status: 'not_going'  as const, icon: XIcon, label: 'لن أحضر' },
          ]).map(({ status, icon: Icon, label }) => (
            <button key={status}
              onClick={(e) => onRsvp(event.id, status, e)}
              disabled={isRsvpPending}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[11px] font-bold transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
              style={rsvpStyle(event.userRsvp === status, status)}>
              <Icon size={11} weight={event.userRsvp === status ? 'fill' : 'regular'} />
              {isRsvpPending ? '...' : label}
            </button>
          ))}
        </div>
      </div>
    </Link>
  );
}

export const EventsList = () => {
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  // No pagination existed at all -- always fetched the same fixed first page,
  // so once the event count exceeded that page size, newly created events
  // pushed older ones out of view with no way to reach them (#223).
  const [page, setPage] = useState(1);
  const [allEvents, setAllEvents] = useState<any[]>([]);
  const { data, isLoading, isFetching, isError, refetch } = useQuery({
    queryKey: ['events', page],
    queryFn:  () => apiClient.get('/events', { params: { page, limit: 20 } }).then((r) => r.data),
  });

  useEffect(() => {
    const incoming: any[] = data?.data ?? [];
    if (page === 1) {
      setAllEvents(incoming);
    } else {
      // Merge by id (not just append-if-new) so a refetch after an RSVP/delete
      // on an already-loaded page reflects the fresh status instead of being
      // silently filtered out as a "duplicate".
      setAllEvents((prev) => {
        const merged = new Map(prev.map((e) => [e.id, e]));
        for (const e of incoming) merged.set(e.id, e);
        return Array.from(merged.values());
      });
    }
  }, [data, page]);

  const totalPages: number = data?.meta?.totalPages ?? 1;
  const hasMore = page < totalPages;
  const rsvpEvent  = useRsvpEvent();
  const deleteEvent = useDeleteEvent();
  const { showToast } = useToast() as any;
  const myUserId   = getCurrentUserId();

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

  if (isLoading && page === 1) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-52 rounded-2xl animate-pulse" style={{ background: 'var(--muted)' }} />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-2xl p-10 text-center"
        style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
        <p className="text-2xl mb-2">⚠️</p>
        <p className="text-sm mb-3" style={{ color: 'var(--muted-foreground)' }}>تعذّر تحميل الأحداث</p>
        <button onClick={() => refetch()}
          className="text-xs font-semibold hover:underline" style={{ color: 'var(--primary)' }}>
          إعادة المحاولة
        </button>
      </div>
    );
  }

  const events: any[] = allEvents;

  if (events.length === 0) {
    return (
      <div className="rounded-2xl p-12 text-center"
        style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
        <div className="mx-auto mb-4 w-16 h-16 rounded-2xl flex items-center justify-center"
          style={{ background: 'color-mix(in srgb, var(--accent) 12%, var(--muted))' }}>
          <CalendarBlank size={30} weight="light" style={{ color: 'var(--accent)', opacity: 0.7 }} />
        </div>
        <p className="font-bold" style={{ color: 'var(--foreground)' }}>لا توجد أحداث</p>
        <p className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>أنشئ حدثاً جديداً أو انتظر الأحداث القادمة</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {events.map((event: any) => (
          <EventCard
            key={event.id}
            event={event}
            myUserId={myUserId}
            onRsvp={handleRsvp}
            onDelete={(id) => setConfirmDeleteId(id)}
            isRsvpPending={rsvpEvent.isPending}
          />
        ))}
      </div>

      {hasMore && (
        <div className="flex justify-center mt-4">
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={isFetching}
            className="rounded-xl px-5 py-2.5 text-sm font-semibold transition-all disabled:opacity-50"
            style={{ border: '1px solid var(--border)', color: 'var(--primary)' }}
          >
            {isFetching ? 'جاري التحميل...' : 'عرض المزيد'}
          </button>
        </div>
      )}

      <Modal open={!!confirmDeleteId} onClose={() => setConfirmDeleteId(null)} title="حذف الحدث">
        <div className="space-y-4">
          <div className="rounded-xl p-4 text-sm leading-relaxed"
            style={{ background: 'color-mix(in srgb, var(--destructive) 6%, var(--muted))', color: 'var(--foreground)' }}>
            هل أنت متأكد من حذف هذا الحدث؟ لا يمكن التراجع عن هذا الإجراء.
          </div>
          <div className="flex gap-3">
            <button onClick={() => setConfirmDeleteId(null)}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all"
              style={{ border: '1px solid var(--border)', color: 'var(--muted-foreground)' }}>
              إلغاء
            </button>
            <button onClick={handleDelete} disabled={deleteEvent.isPending}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:scale-[1.01] disabled:opacity-50"
              style={{ background: 'var(--destructive)' }}>
              <Trash size={13} />
              {deleteEvent.isPending ? 'جاري...' : 'تأكيد الحذف'}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};
