'use client';
import { useParams, useRouter } from 'next/navigation';
import { useEvent, useRsvpEvent } from '@/features/events/hooks';
import { useToast } from '@/components/ui/Toast';

export default function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data, isLoading, isError } = useEvent(id);
  const rsvpEvent = useRsvpEvent();
  const { showToast } = useToast();

  const event = data;

  const handleRsvp = async (status: 'going' | 'interested' | 'not_going') => {
    try {
      await rsvpEvent.mutateAsync({ eventId: id, status });
      showToast('تم تحديث حالة الحضور', 'success');
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'فشل تحديث الحضور', 'error');
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto space-y-4">
        <div className="h-48 rounded-3xl bg-gradient-to-br from-[#ECFDF5] to-[#F0FDF4] animate-pulse border border-emerald-100" />
        <div className="h-32 rounded-2xl bg-gradient-to-br from-[#ECFDF5] to-[#F0FDF4] animate-pulse border border-emerald-100" />
        <div className="h-24 rounded-2xl bg-gradient-to-br from-[#ECFDF5] to-[#F0FDF4] animate-pulse border border-emerald-100" />
      </div>
    );
  }

  if (isError || !event) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16">
        <p className="text-4xl mb-4">⚠️</p>
        <p className="text-[#10B981] font-medium mb-6">تعذّر تحميل الحدث أو أنه غير موجود.</p>
        <button
          onClick={() => router.push('/events')}
          className="rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 hover:shadow-xl transition-all"
        >
          العودة للأحداث
        </button>
      </div>
    );
  }

  const startDate = event.startDate ? new Date(event.startDate) : null;
  const endDate   = event.endDate   ? new Date(event.endDate)   : null;

  const rsvpCurrent = event.userRsvp as 'going' | 'interested' | 'not_going' | undefined;

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* Back */}
      <button
        onClick={() => router.push('/events')}
        className="flex items-center gap-2 text-sm font-medium text-[#10B981] hover:text-[#059669] transition-colors"
      >
        <svg className="w-4 h-4 rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        عودة للأحداث
      </button>

      {/* Cover */}
      {event.coverPhoto && (
        <div className="rounded-3xl overflow-hidden border border-emerald-100 h-48">
          <img src={event.coverPhoto} alt={event.title} className="w-full h-full object-cover" />
        </div>
      )}

      {/* Header card */}
      <div className="rounded-3xl bg-gradient-to-br from-[#ECFDF5] to-[#F0FDF4] border border-emerald-100 p-6 shadow-lg shadow-emerald-500/10">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <h1 className="text-xl font-bold text-[#065F46]">{event.title}</h1>
            <span className={`mt-1 inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${
              event.privacy === 'public' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
            }`}>
              {event.privacy === 'public' ? 'عام' : 'خاص'}
            </span>
          </div>
          {event.isOwner && (
            <span className="text-xs bg-[#DCFCE7] text-[#059669] rounded-full px-3 py-1 font-semibold">منظم</span>
          )}
        </div>

        <div className="space-y-2 text-sm text-[#10B981]">
          {startDate && (
            <div className="flex items-center gap-2">
              <span>📅</span>
              <span>
                {startDate.toLocaleDateString('ar-SA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                {' · '}
                {startDate.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          )}
          {endDate && (
            <div className="flex items-center gap-2">
              <span>🏁</span>
              <span>
                ينتهي: {endDate.toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' })}
                {' · '}
                {endDate.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          )}
          {event.location && (
            <div className="flex items-center gap-2">
              <span>📍</span>
              <span>{event.location}</span>
            </div>
          )}
        </div>

        {/* Attendee counts */}
        <div className="flex gap-4 mt-4 pt-4 border-t border-emerald-100">
          <span className="text-xs text-[#10B981]">✅ ذاهب: <strong className="text-[#065F46]">{event.goingCount ?? 0}</strong></span>
          <span className="text-xs text-[#10B981]">⭐ مهتم: <strong className="text-[#065F46]">{event.interestedCount ?? 0}</strong></span>
        </div>
      </div>

      {/* Description */}
      {event.description && (
        <div className="rounded-2xl bg-white/80 border border-emerald-100 p-5">
          <h2 className="text-sm font-bold text-[#065F46] mb-2">التفاصيل</h2>
          <p className="text-sm text-[#10B981] leading-relaxed">{event.description}</p>
        </div>
      )}

      {/* RSVP */}
      {!event.isOwner && (
        <div className="rounded-2xl bg-white/80 border border-emerald-100 p-5">
          <h2 className="text-sm font-bold text-[#065F46] mb-3">هل ستحضر؟</h2>
          <div className="flex gap-2 flex-wrap">
            {([
              { status: 'going' as const,        label: '✅ سأحضر',    active: 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25', inactive: 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' },
              { status: 'interested' as const,   label: '⭐ مهتم',     active: 'bg-amber-500 text-white shadow-lg shadow-amber-500/25',   inactive: 'bg-amber-50 text-amber-700 hover:bg-amber-100' },
              { status: 'not_going' as const,    label: '❌ لن أحضر',  active: 'bg-rose-500 text-white shadow-lg shadow-rose-500/25',     inactive: 'bg-rose-50 text-rose-700 hover:bg-rose-100' },
            ]).map(({ status, label, active, inactive }) => (
              <button
                key={status}
                onClick={() => handleRsvp(status)}
                disabled={rsvpEvent.isPending}
                className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition-all disabled:opacity-60 ${rsvpCurrent === status ? active : inactive}`}
              >
                {rsvpEvent.isPending ? '...' : label}
              </button>
            ))}
          </div>
          {rsvpCurrent && (
            <p className="text-xs text-[#10B981] mt-3">
              حالتك الحالية: <strong>{rsvpCurrent === 'going' ? 'سأحضر' : rsvpCurrent === 'interested' ? 'مهتم' : 'لن أحضر'}</strong>
            </p>
          )}
        </div>
      )}
    </div>
  );
}
