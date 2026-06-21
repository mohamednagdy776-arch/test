'use client';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { useEvent, useRsvpEvent } from '@/features/events/hooks';
import { useToast } from '@/components/ui/Toast';
import {
  ArrowLeft, CalendarBlank, MapPin, Users, Check, Star,
  X as XIcon, Globe, Lock, Clock,
} from '@phosphor-icons/react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || '';

function rsvpStyle(active: boolean, kind: 'going' | 'interested' | 'not_going') {
  if (kind === 'going')
    return active
      ? { background: 'linear-gradient(135deg, var(--primary), var(--secondary))', color: 'white', boxShadow: '0 4px 14px color-mix(in srgb, var(--primary) 35%, transparent)' }
      : { background: 'color-mix(in srgb, var(--primary) 8%, var(--muted))', color: 'var(--primary)' };
  if (kind === 'interested')
    return active
      ? { background: 'linear-gradient(135deg, var(--accent), #c8952e)', color: 'white', boxShadow: '0 4px 14px color-mix(in srgb, var(--accent) 35%, transparent)' }
      : { background: 'color-mix(in srgb, var(--accent) 10%, var(--muted))', color: 'var(--accent)' };
  return active
    ? { background: 'var(--destructive)', color: 'white', boxShadow: '0 4px 14px color-mix(in srgb, var(--destructive) 30%, transparent)' }
    : { background: 'color-mix(in srgb, var(--destructive) 8%, var(--muted))', color: 'var(--destructive)' };
}

export default function EventDetailPage() {
  const { id }  = useParams<{ id: string }>();
  const router  = useRouter();
  const { data, isLoading, isError } = useEvent(id);
  const rsvpEvent  = useRsvpEvent();
  const { showToast } = useToast() as any;

  const handleRsvp = async (status: 'going' | 'interested' | 'not_going') => {
    try {
      await rsvpEvent.mutateAsync({ eventId: id, status });
      showToast('تم تحديث حالة الحضور', 'success');
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'فشل تحديث الحضور', 'error');
    }
  };

  // ── Loading ─────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto space-y-4 pb-24 lg:pb-8">
        <div className="h-52 rounded-2xl animate-pulse" style={{ background: 'var(--muted)' }} />
        <div className="h-36 rounded-2xl animate-pulse" style={{ background: 'var(--muted)' }} />
        <div className="h-24 rounded-2xl animate-pulse" style={{ background: 'var(--muted)' }} />
      </div>
    );
  }

  // ── Error ───────────────────────────────────────────────────────
  if (isError || !data) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16 pb-24 lg:pb-8">
        <div className="mx-auto mb-4 w-16 h-16 rounded-2xl flex items-center justify-center"
          style={{ background: 'color-mix(in srgb, var(--accent) 12%, var(--muted))' }}>
          <CalendarBlank size={30} weight="light" style={{ color: 'var(--accent)', opacity: 0.7 }} />
        </div>
        <p className="font-bold mb-1" style={{ color: 'var(--foreground)' }}>تعذّر تحميل الحدث</p>
        <p className="text-sm mb-5" style={{ color: 'var(--muted-foreground)' }}>الحدث غير موجود أو حدث خطأ أثناء التحميل</p>
        <button onClick={() => router.push('/events')}
          className="px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:scale-105"
          style={{ background: 'linear-gradient(135deg, var(--primary), var(--secondary))' }}>
          العودة للأحداث
        </button>
      </div>
    );
  }

  const event      = data;
  const startDate  = event.startDate ? new Date(event.startDate) : null;
  const endDate    = event.endDate   ? new Date(event.endDate)   : null;
  const rsvpCurrent = event.userRsvp as 'going' | 'interested' | 'not_going' | undefined;
  const coverSrc   = event.coverPhoto
    ? (event.coverPhoto.startsWith('http') ? event.coverPhoto : `${API_BASE}${event.coverPhoto}`)
    : null;
  const isPublic   = event.privacy === 'public';

  return (
    <div className="max-w-2xl mx-auto space-y-5 pb-24 lg:pb-8">

      {/* ── Back button ─────────────────────────────────────────── */}
      <button onClick={() => router.push('/events')}
        className="flex items-center gap-1.5 text-sm font-medium transition-all hover:gap-2"
        style={{ color: 'var(--primary)' }}>
        <ArrowLeft size={15} />
        عودة للأحداث
      </button>

      {/* ── Hero: cover photo or luxury gradient ─────────────────── */}
      <div className="relative rounded-2xl overflow-hidden"
        style={{ boxShadow: '0 8px 32px color-mix(in srgb, var(--primary) 20%, transparent)' }}>
        {coverSrc ? (
          <div className="relative h-52">
            <Image src={coverSrc} alt={event.title} fill className="object-cover" />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.45) 0%, transparent 60%)' }} />
          </div>
        ) : (
          <div className="relative h-52 flex flex-col items-center justify-center"
            style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 55%, var(--accent) 100%)' }}>
            <div className="absolute -top-6 -left-6 w-24 h-24 rounded-full bg-white opacity-10" />
            <div className="absolute -bottom-8 -right-4 w-32 h-32 rounded-full bg-white opacity-10" />
            <div className="relative z-10 text-center">
              {startDate && (
                <div className="mx-auto mb-3 w-20 h-20 rounded-2xl flex flex-col items-center justify-center backdrop-blur-sm"
                  style={{ background: 'rgba(255,255,255,0.18)', border: '2px solid rgba(255,255,255,0.3)' }}>
                  <span className="text-3xl font-black text-white leading-none">{startDate.getDate()}</span>
                  <span className="text-xs text-white/80 font-semibold mt-0.5">
                    {startDate.toLocaleDateString('ar-SA', { month: 'short' })}
                  </span>
                </div>
              )}
              <CalendarBlank size={startDate ? 0 : 36} weight="light" className="text-white/50 mx-auto" />
            </div>
          </div>
        )}

        {/* Privacy badge overlaid on hero */}
        <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 rounded-xl backdrop-blur-sm text-xs font-bold"
          style={isPublic
            ? { background: 'rgba(255,255,255,0.22)', color: 'white' }
            : { background: 'rgba(0,0,0,0.3)', color: 'white' }}>
          {isPublic ? <Globe size={10} /> : <Lock size={10} />}
          {isPublic ? 'عام' : 'خاص'}
        </div>
        {event.isOwner && (
          <div className="absolute top-4 left-4 px-3 py-1.5 rounded-xl backdrop-blur-sm text-xs font-bold"
            style={{ background: 'rgba(255,255,255,0.22)', color: 'white' }}>
            منظم
          </div>
        )}
      </div>

      {/* ── Event info card ──────────────────────────────────────── */}
      <div className="rounded-2xl p-5"
        style={{ background: 'var(--card)', border: '1px solid var(--border)', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
        <h1 className="text-xl font-extrabold mb-4" style={{ color: 'var(--foreground)' }}>{event.title}</h1>

        <div className="space-y-2.5">
          {startDate && (
            <div className="flex items-center gap-3 rounded-xl px-3 py-2.5"
              style={{ background: 'var(--muted)' }}>
              <CalendarBlank size={15} style={{ color: 'var(--primary)', flexShrink: 0 }} />
              <span className="text-sm" style={{ color: 'var(--foreground)' }}>
                {startDate.toLocaleDateString('ar-SA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                {' · '}
                <span style={{ color: 'var(--muted-foreground)' }}>
                  {startDate.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </span>
            </div>
          )}
          {endDate && (
            <div className="flex items-center gap-3 rounded-xl px-3 py-2.5"
              style={{ background: 'var(--muted)' }}>
              <Clock size={15} style={{ color: 'var(--muted-foreground)', flexShrink: 0 }} />
              <span className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                ينتهي: {endDate.toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' })}
                {' · '}
                {endDate.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          )}
          {event.location && (
            <div className="flex items-center gap-3 rounded-xl px-3 py-2.5"
              style={{ background: 'var(--muted)' }}>
              <MapPin size={15} style={{ color: 'var(--accent)', flexShrink: 0 }} />
              <span className="text-sm" style={{ color: 'var(--foreground)' }}>{event.location}</span>
            </div>
          )}
        </div>

        {/* Attendee count chips */}
        <div className="flex gap-3 mt-4 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
          <span className="flex items-center gap-1.5 text-xs font-medium"
            style={{ color: 'var(--muted-foreground)' }}>
            <Users size={12} />
            <span className="font-bold tabular-nums" style={{ color: 'var(--primary)' }}>{event.goingCount ?? 0}</span>
            ذاهب
          </span>
          <span className="flex items-center gap-1.5 text-xs font-medium"
            style={{ color: 'var(--muted-foreground)' }}>
            <Star size={12} />
            <span className="font-bold tabular-nums" style={{ color: 'var(--accent)' }}>{event.interestedCount ?? 0}</span>
            مهتم
          </span>
        </div>
      </div>

      {/* ── Description ─────────────────────────────────────────── */}
      {event.description && (
        <div className="rounded-2xl p-5"
          style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          <h2 className="text-sm font-bold mb-2.5" style={{ color: 'var(--foreground)' }}>التفاصيل</h2>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>{event.description}</p>
        </div>
      )}

      {/* ── RSVP ────────────────────────────────────────────────── */}
      {!event.isOwner && (
        <div className="rounded-2xl p-5"
          style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          <h2 className="text-sm font-bold mb-3" style={{ color: 'var(--foreground)' }}>هل ستحضر؟</h2>

          <div className="flex gap-2 flex-wrap">
            {([
              { status: 'going'      as const, icon: Check, label: 'سأحضر' },
              { status: 'interested' as const, icon: Star,  label: 'مهتم' },
              { status: 'not_going'  as const, icon: XIcon, label: 'لن أحضر' },
            ]).map(({ status, icon: Icon, label }) => {
              const isActive = rsvpCurrent === status;
              return (
                <button key={status}
                  onClick={() => handleRsvp(status)}
                  disabled={rsvpEvent.isPending}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-bold transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
                  style={rsvpStyle(isActive, status)}>
                  <Icon size={14} weight={isActive ? 'fill' : 'regular'} />
                  {rsvpEvent.isPending ? '...' : label}
                </button>
              );
            })}
          </div>

          {rsvpCurrent && (
            <p className="text-xs mt-3" style={{ color: 'var(--muted-foreground)' }}>
              حالتك الحالية:{' '}
              <strong style={{ color: 'var(--foreground)' }}>
                {rsvpCurrent === 'going' ? 'سأحضر' : rsvpCurrent === 'interested' ? 'مهتم' : 'لن أحضر'}
              </strong>
            </p>
          )}
        </div>
      )}
    </div>
  );
}
