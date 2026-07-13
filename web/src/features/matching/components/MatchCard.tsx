'use client';
import Image from 'next/image';
import { resolveMediaUrl } from '@/lib/media';
import { MapPin, Scales, Check, X, Eye, ChatCircle, ArrowCounterClockwise, Heart } from '@phosphor-icons/react';
import type { Match } from '@/types';


function scoreColor(s: number) {
  return s >= 80 ? 'var(--primary)' : s >= 60 ? 'var(--accent)' : '#ef4444';
}
function scoreLabel(s: number) {
  return s >= 80 ? 'توافق ممتاز' : s >= 60 ? 'توافق جيد' : 'توافق منخفض';
}
function scoreGradient(s: number) {
  return s >= 80
    ? 'linear-gradient(90deg, var(--primary), var(--accent))'
    : s >= 60
    ? 'linear-gradient(90deg, var(--accent), #d97706)'
    : 'linear-gradient(90deg, #ef4444, #dc2626)';
}

function ScoreGauge({ score }: { score: number }) {
  const color = scoreColor(score);
  const circumference = 2 * Math.PI * 22;
  const dash = (score / 100) * circumference;
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-14 h-14">
        <svg viewBox="0 0 56 56" className="w-full h-full -rotate-90">
          <circle cx="28" cy="28" r="22" fill="none" stroke="var(--muted)" strokeWidth="4" />
          <circle cx="28" cy="28" r="22" fill="none" stroke={color} strokeWidth="4"
            strokeDasharray={`${dash} ${circumference}`}
            strokeLinecap="round"
            style={{ transition: 'stroke-dasharray 1s ease-out' }} />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          {/* An unrounded decimal score overflowed this small fixed circle (#273). */}
          <span className="text-xs font-extrabold tabular-nums" style={{ color }}>{Math.round(score)}%</span>
        </div>
      </div>
      <span className="text-[10px] font-semibold mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
        {scoreLabel(score)}
      </span>
    </div>
  );
}

const categories = [
  { label: 'الدين', key: 'religious', weight: 0.30 },
  { label: 'نمط الحياة', key: 'lifestyle', weight: 0.25 },
  { label: 'الاهتمامات', key: 'interests', weight: 0.20 },
  { label: 'الموقع', key: 'location', weight: 0.15 },
  { label: 'أخرى', key: 'other', weight: 0.10 },
];

function ScoreBreakdown({ score, breakdown }: { score: number; breakdown?: Record<string, number> | null }) {
  return (
    <div className="space-y-1.5 mt-3 pt-3" style={{ borderTop: '1px solid var(--border)' }}>
      {categories.map((c) => {
        // Prefer the real per-dimension sub-score from the AI service (#741);
        // fall back to an estimate only for legacy matches with no breakdown.
        const real = breakdown?.[c.key];
        const val = real != null
          ? Math.max(0, Math.min(100, Math.round(real)))
          : Math.min(100, Math.round(score * (0.85 + c.weight / 2)));
        const col = scoreColor(val);
        return (
          <div key={c.label} className="flex items-center gap-2">
            <span className="w-20 text-[11px] shrink-0" style={{ color: 'var(--muted-foreground)' }}>{c.label}</span>
            <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--muted)' }}>
              <div className="h-full rounded-full transition-all duration-700"
                style={{ width: `${val}%`, background: col }} />
            </div>
            <span className="text-[10px] w-7 text-left tabular-nums" style={{ color: 'var(--muted-foreground)' }}>{val}%</span>
          </div>
        );
      })}
    </div>
  );
}

interface Props {
  match: Match;
  onView?: () => void;
  onAccept?: () => void;
  onReject?: () => void;
  onUndoReject?: () => void;
  onUndoAccept?: () => void;
  onViewProfile?: () => void;
  onSendMessage?: () => void;
  accepting?: boolean;
  rejecting?: boolean;
}

export const MatchCard = ({
  match, onView, onAccept, onReject, onUndoReject, onUndoAccept, onViewProfile, onSendMessage,
  accepting, rejecting,
}: Props) => {
  const displayName = (match as any).otherUserName || (match as any).user?.fullName || 'مستخدم';
  const avatarRaw = (match as any).otherUserAvatar || (match as any).user?.avatarUrl;
  const avatarSrc = avatarRaw
    ? (resolveMediaUrl(avatarRaw))
    : null;
  const age = (match as any).user?.age || (match as any).otherUserAge;
  const location = (match as any).user?.location || (match as any).otherUserLocation;
  const prayerLevel = (match as any).user?.prayerLevel || (match as any).otherUserPrayerLevel;
  const initial = displayName.trim().charAt(0).toUpperCase();
  const isPending = match.status === 'pending';
  const isAccepted = match.status === 'accepted';

  return (
    <div className="rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-0.5 group"
      style={{
        background: 'var(--card)',
        border: '1px solid var(--border)',
        boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
      }}>
      {/* Score strip */}
      <div className="h-1 w-full" style={{ background: scoreGradient(match.score) }} />

      <div className="p-5">
        {/* Avatar + score ring */}
        <div className="flex items-start justify-between mb-4">
          <div className="relative">
            {avatarSrc ? (
              <Image src={avatarSrc} alt={displayName} width={52} height={52}
                className="w-13 h-13 rounded-2xl object-cover"
                style={{ width: 52, height: 52 }} />
            ) : (
              <div className="w-13 h-13 rounded-2xl flex items-center justify-center text-lg font-bold text-white"
                style={{ width: 52, height: 52, background: 'linear-gradient(135deg, var(--primary), var(--accent))' }}>
                {initial}
              </div>
            )}
            {isAccepted && (
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 flex items-center justify-center"
                style={{ background: 'var(--primary)', borderColor: 'var(--card)' }}>
                <Check size={9} weight="bold" className="text-white" />
              </div>
            )}
          </div>
          <ScoreGauge score={match.score} />
        </div>

        {/* Name + meta */}
        <div className="mb-3">
          <h3 className="font-bold text-base truncate" style={{ color: 'var(--foreground)' }}>{displayName}</h3>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-0.5">
            {age && (
              <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{age} سنة</span>
            )}
            {location && (
              <span className="flex items-center gap-0.5 text-xs" style={{ color: 'var(--muted-foreground)' }}>
                <MapPin size={10} /> {location}
              </span>
            )}
          </div>
          {prayerLevel && (
            <span className="inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold"
              style={{ background: 'color-mix(in srgb, var(--primary) 10%, transparent)', color: 'var(--primary)' }}>
              <Scales size={10} />
              الالتزام: {prayerLevel === 'high' ? 'عالي' : prayerLevel === 'medium' ? 'متوسط' : 'منخفض'}
            </span>
          )}
        </div>

        <ScoreBreakdown score={match.score} breakdown={(match as any).breakdown} />

        {/* Status badge for non-pending */}
        {!isPending && (
          <div className="mt-3 flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold"
            style={isAccepted
              ? { background: 'color-mix(in srgb, var(--primary) 10%, transparent)', color: 'var(--primary)' }
              : { background: 'color-mix(in srgb, #ef4444 10%, transparent)', color: '#ef4444' }}>
            {isAccepted ? <Heart size={13} weight="fill" /> : <X size={13} weight="bold" />}
            {isAccepted ? 'تم القبول' : 'تم الرفض'}
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-2 mt-4">
          {isPending && (
            <>
              {onView && (
                <button onClick={onView}
                  className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-all hover:bg-[color-mix(in_srgb,var(--primary)_8%,transparent)]"
                  style={{ border: '1px solid var(--border)', color: 'var(--muted-foreground)' }}>
                  <Eye size={13} /> عرض تفاصيل التوافق
                </button>
              )}
              {(onAccept || onReject) && (
                <div className="flex gap-2">
                  {onAccept && (
                    <button onClick={onAccept} disabled={accepting}
                      className="flex-1 flex items-center justify-center gap-1 py-2.5 rounded-xl text-xs font-bold transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
                      style={{ background: 'linear-gradient(135deg, var(--primary), var(--secondary))', color: 'white', boxShadow: '0 2px 8px color-mix(in srgb, var(--primary) 30%, transparent)' }}>
                      <Check size={13} weight="bold" />
                      {accepting ? 'جاري...' : 'قبول'}
                    </button>
                  )}
                  {onReject && (
                    <button onClick={onReject} disabled={rejecting}
                      className="flex-1 flex items-center justify-center gap-1 py-2.5 rounded-xl text-xs font-semibold transition-all hover:bg-[color-mix(in_srgb,#ef4444_8%,transparent)] active:scale-95 disabled:opacity-50"
                      style={{ border: '1px solid color-mix(in srgb, #ef4444 30%, var(--border))', color: '#ef4444' }}>
                      <X size={13} weight="bold" />
                      {rejecting ? 'جاري...' : 'رفض'}
                    </button>
                  )}
                </div>
              )}
            </>
          )}
          {match.status === 'rejected' && onUndoReject && (
            <button onClick={onUndoReject} disabled={accepting}
              className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-all hover:bg-[color-mix(in_srgb,var(--accent)_8%,transparent)] disabled:opacity-50"
              style={{ border: '1px solid var(--border)', color: 'var(--accent)' }}>
              <ArrowCounterClockwise size={13} /> تراجع عن الرفض
            </button>
          )}
          {/* "Undo Reject" existed but there was no equivalent for an
              accepted match (#362). */}
          {isAccepted && onUndoAccept && (
            <button onClick={onUndoAccept} disabled={accepting}
              className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-all hover:bg-[color-mix(in_srgb,var(--accent)_8%,transparent)] disabled:opacity-50"
              style={{ border: '1px solid var(--border)', color: 'var(--accent)' }}>
              <ArrowCounterClockwise size={13} /> تراجع عن القبول
            </button>
          )}
          {/* Rejected cards only ever showed "Undo Reject" -- no way to
              review who was rejected before deciding to undo (#364). */}
          {(isPending || isAccepted || match.status === 'rejected') && (onViewProfile || (isAccepted && onSendMessage)) && (
            <div className="flex gap-2">
              {onViewProfile && (
                <button onClick={onViewProfile}
                  className="flex-1 flex items-center justify-center gap-1 py-2 rounded-xl text-xs font-semibold transition-all hover:bg-[color-mix(in_srgb,var(--primary)_6%,transparent)]"
                  style={{ border: '1px solid var(--border)', color: 'var(--muted-foreground)' }}>
                  <Eye size={12} /> الملف
                </button>
              )}
              {isAccepted && onSendMessage && (
                <button onClick={onSendMessage}
                  className="flex-1 flex items-center justify-center gap-1 py-2 rounded-xl text-xs font-bold transition-all hover:scale-[1.02] active:scale-95"
                  style={{ background: 'linear-gradient(135deg, var(--accent), #c8952e)', color: 'white' }}>
                  <ChatCircle size={12} weight="fill" /> رسالة
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
