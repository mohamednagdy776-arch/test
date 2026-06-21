'use client';
import Image from 'next/image';
import { X, Check, Heart, MapPin, Scales, Info } from '@phosphor-icons/react';
import type { Match } from '@/types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || '';

function scoreColor(s: number) {
  return s >= 80 ? 'var(--primary)' : s >= 60 ? 'var(--accent)' : '#ef4444';
}
function scoreLabel(s: number) {
  return s >= 80 ? 'توافق ممتاز' : s >= 60 ? 'توافق جيد' : 'توافق منخفض';
}

const CATEGORIES = [
  { label: 'التوافق الديني', emoji: '🕌', weight: 0.30, displayWeight: 30 },
  { label: 'نمط الحياة', emoji: '🌿', weight: 0.25, displayWeight: 25 },
  { label: 'الاهتمامات المشتركة', emoji: '❤️', weight: 0.20, displayWeight: 20 },
  { label: 'التوافق الجغرافي', emoji: '📍', weight: 0.15, displayWeight: 15 },
  { label: 'عوامل أخرى', emoji: '✨', weight: 0.10, displayWeight: 10 },
];

interface Props {
  match: Match;
  onClose: () => void;
  onAccept?: () => void;
  onReject?: () => void;
  accepting?: boolean;
  rejecting?: boolean;
}

export const MatchDetailModal = ({ match, onClose, onAccept, onReject, accepting, rejecting }: Props) => {
  const isPending = match.status === 'pending';
  const isAccepted = match.status === 'accepted';
  const displayName = (match as any).otherUserName || (match as any).user?.fullName || 'مستخدم';
  const avatarRaw = (match as any).otherUserAvatar || (match as any).user?.avatarUrl;
  const avatarSrc = avatarRaw
    ? (avatarRaw.startsWith('http') ? avatarRaw : `${API_BASE}${avatarRaw}`)
    : null;
  const age = (match as any).user?.age || (match as any).otherUserAge;
  const location = (match as any).user?.location || (match as any).otherUserLocation;
  const prayerLevel = (match as any).user?.prayerLevel;
  const initial = displayName.trim().charAt(0).toUpperCase();
  const color = scoreColor(match.score);
  const circumference = 2 * Math.PI * 30;
  const dash = (match.score / 100) * circumference;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col"
        style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>

        {/* Header — luxury gradient */}
        <div className="relative p-6 pb-8 shrink-0"
          style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 50%, var(--accent) 100%)' }}>
          <button onClick={onClose} aria-label="إغلاق"
            className="absolute top-4 left-4 w-8 h-8 rounded-xl flex items-center justify-center transition-all hover:scale-110 active:scale-95"
            style={{ background: 'rgba(255,255,255,0.2)', color: 'white' }}>
            <X size={16} weight="bold" />
          </button>

          <div className="flex flex-col items-center text-center">
            {/* Avatar */}
            <div className="relative w-20 h-20 mb-3">
              {avatarSrc ? (
                <Image src={avatarSrc} alt={displayName} width={80} height={80}
                  className="w-20 h-20 rounded-2xl object-cover border-3"
                  style={{ border: '3px solid rgba(255,255,255,0.4)' }} />
              ) : (
                <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-black text-white"
                  style={{ background: 'rgba(255,255,255,0.2)', border: '3px solid rgba(255,255,255,0.4)', backdropFilter: 'blur(8px)' }}>
                  {initial}
                </div>
              )}
              {isAccepted && (
                <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-xl flex items-center justify-center border-2"
                  style={{ background: 'var(--primary)', borderColor: 'white' }}>
                  <Heart size={13} weight="fill" className="text-white" />
                </div>
              )}
            </div>

            <h2 className="text-lg font-extrabold text-white mb-1">{displayName}</h2>
            <div className="flex items-center gap-3 text-white/70 text-xs mb-3">
              {age && <span>{age} سنة</span>}
              {age && location && <span>·</span>}
              {location && <span className="flex items-center gap-0.5"><MapPin size={10} /> {location}</span>}
              {prayerLevel && (
                <>
                  <span>·</span>
                  <span className="flex items-center gap-0.5"><Scales size={10} /> {prayerLevel === 'high' ? 'التزام عالي' : prayerLevel === 'medium' ? 'التزام متوسط' : 'التزام منخفض'}</span>
                </>
              )}
            </div>

            {/* Score ring */}
            <div className="relative w-20 h-20 mx-auto">
              <svg viewBox="0 0 80 80" className="w-full h-full -rotate-90">
                <circle cx="40" cy="40" r="30" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="6" />
                <circle cx="40" cy="40" r="30" fill="none" stroke="white" strokeWidth="6"
                  strokeDasharray={`${dash} ${circumference}`}
                  strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-black text-white leading-none">{match.score}%</span>
                <span className="text-[10px] text-white/70">{scoreLabel(match.score)}</span>
              </div>
            </div>

            {/* Status badge */}
            {!isPending && (
              <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold"
                style={isAccepted
                  ? { background: 'rgba(255,255,255,0.25)', color: 'white' }
                  : { background: 'rgba(0,0,0,0.2)', color: 'rgba(255,255,255,0.8)' }}>
                {isAccepted ? <Check size={12} weight="bold" /> : <X size={12} weight="bold" />}
                {isAccepted ? 'تم القبول' : 'تم الرفض'}
              </div>
            )}
          </div>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto scrollbar-thin flex-1">
          <div className="p-6 space-y-5">

            {/* Score breakdown */}
            <div>
              <h3 className="text-sm font-bold mb-3" style={{ color: 'var(--foreground)' }}>أسباب التوافق</h3>
              <div className="space-y-2.5">
                {CATEGORIES.map((c) => {
                  const val = Math.min(100, Math.round(match.score * (0.85 + c.weight / 2)));
                  const catColor = scoreColor(val);
                  return (
                    <div key={c.label} className="flex items-center gap-3">
                      <span className="text-base w-6 shrink-0">{c.emoji}</span>
                      <div className="flex-1">
                        <div className="flex justify-between mb-1">
                          <span className="text-xs font-medium" style={{ color: 'var(--foreground)' }}>{c.label}</span>
                          <span className="text-[11px] tabular-nums" style={{ color: 'var(--muted-foreground)' }}>
                            {val}% · وزن {c.displayWeight}%
                          </span>
                        </div>
                        <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--muted)' }}>
                          <div className="h-full rounded-full transition-all duration-700"
                            style={{ width: `${val}%`, background: catColor }} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Match info */}
            <div className="rounded-2xl p-4 space-y-2.5" style={{ background: 'var(--muted)' }}>
              <h3 className="text-sm font-bold mb-1" style={{ color: 'var(--foreground)' }}>معلومات التوافق</h3>
              {[
                ['معرّف التوافق', match.id.slice(0, 16) + '…'],
                ['تاريخ الإنشاء', new Date(match.createdAt).toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' })],
                ['الحالة', isPending ? 'في الانتظار' : isAccepted ? 'مقبول' : 'مرفوض'],
              ].map(([k, v]) => (
                <div key={String(k)} className="flex justify-between text-sm">
                  <span style={{ color: 'var(--muted-foreground)' }}>{k}</span>
                  <span className="font-semibold" style={{ color: 'var(--foreground)' }}>{v}</span>
                </div>
              ))}
            </div>

            {/* How scoring works */}
            <div className="rounded-2xl p-4" style={{ background: 'color-mix(in srgb, var(--accent) 8%, var(--muted))', border: '1px solid color-mix(in srgb, var(--accent) 20%, var(--border))' }}>
              <div className="flex items-start gap-2">
                <Info size={15} weight="fill" className="shrink-0 mt-0.5" style={{ color: 'var(--accent)' }} />
                <div>
                  <h3 className="text-xs font-bold mb-1" style={{ color: 'var(--accent)' }}>كيف يعمل نظام التوافق؟</h3>
                  <p className="text-xs leading-relaxed" style={{ color: 'var(--foreground)' }}>
                    يحسب الذكاء الاصطناعي نسبة التوافق بناءً على 5 محاور: التوافق الديني (30%)،
                    نمط الحياة (25%)، الاهتمامات المشتركة (20%)، التوافق الجغرافي (15%)، وعوامل أخرى (10%).
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            {isPending && (onAccept || onReject) && (
              <div className="flex gap-3 pt-1">
                {onReject && (
                  <button onClick={onReject} disabled={rejecting}
                    className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-2xl text-sm font-bold transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
                    style={{ border: '2px solid color-mix(in srgb, #ef4444 30%, var(--border))', color: '#ef4444' }}>
                    <X size={15} weight="bold" />
                    {rejecting ? 'جاري...' : 'رفض'}
                  </button>
                )}
                {onAccept && (
                  <button onClick={onAccept} disabled={accepting}
                    className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-2xl text-sm font-bold text-white transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
                    style={{ background: 'linear-gradient(135deg, var(--primary), var(--secondary))', boxShadow: '0 4px 16px color-mix(in srgb, var(--primary) 35%, transparent)' }}>
                    <Check size={15} weight="bold" />
                    {accepting ? 'جاري القبول...' : 'قبول التوافق'}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
