'use client';
import { useState } from 'react';
import { resolveMediaUrl } from '@/lib/media';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useMutation, useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { useToast } from '@/components/ui/Toast';
import { X, ChatCircle, User, Sparkle, Check, MapPin, UserPlus, ArrowSquareOut } from '@phosphor-icons/react';


interface Props {
  user: any;
  onClose: () => void;
}

function scoreColor(s: number) {
  return s >= 80 ? 'var(--primary)' : s >= 60 ? 'var(--accent)' : '#ef4444';
}
function scoreBg(s: number) {
  return s >= 80
    ? 'color-mix(in srgb, var(--primary) 8%, var(--muted))'
    : s >= 60
    ? 'color-mix(in srgb, var(--accent) 8%, var(--muted))'
    : 'color-mix(in srgb, #ef4444 8%, var(--muted))';
}
function scoreLabel(s: number) {
  return s >= 80 ? 'توافق ممتاز' : s >= 60 ? 'توافق جيد' : 'توافق منخفض';
}

const CATEGORIES = [
  { label: 'التوافق الديني', emoji: '🕌', weight: 0.30 },
  { label: 'نمط الحياة', emoji: '🌿', weight: 0.25 },
  { label: 'الاهتمامات', emoji: '❤️', weight: 0.20 },
  { label: 'الموقع الجغرافي', emoji: '📍', weight: 0.15 },
  { label: 'عوامل أخرى', emoji: '✨', weight: 0.10 },
];

export const UserProfileModal = ({ user, onClose }: Props) => {
  const router = useRouter();
  const { showToast } = useToast() as any;
  const [tab, setTab] = useState<'profile' | 'match'>('profile');
  const [aiScore, setAiScore] = useState<{ matchScore: number; matchReasons: string[] } | null>(null);
  const [loadingScore, setLoadingScore] = useState(false);
  const [chatError, setChatError] = useState('');
  const [friendRequestSent, setFriendRequestSent] = useState(false);

  const targetId = user.userId ?? user.id;
  const avatarSrc = user.avatarUrl
    ? (resolveMediaUrl(user.avatarUrl))
    : null;
  const initial = (user.fullName || user.username || '?').charAt(0).toUpperCase();

  const { data: myProfile } = useQuery({
    queryKey: ['my-profile'],
    queryFn: () => apiClient.get('/users/me').then((r) => r.data),
  });

  const createConversation = useMutation({
    mutationFn: () => apiClient.post('/chat/conversations', { targetUserId: targetId }),
    onSuccess: (response) => {
      const conv = response.data.data;
      onClose();
      router.push(`/chat?conversation=${conv.id}&user=${conv.otherUserId || targetId}`);
    },
    onError: (e: any) => {
      // Always showed this same generic message regardless of the real
      // reason (e.g. a relationship-gate 403) -- surface the actual
      // backend message when available (#175).
      setChatError(e?.response?.data?.message || 'تعذّر بدء المحادثة، حاول مرة أخرى.');
    },
  });

  const sendFriendRequest = useMutation({
    mutationFn: () => apiClient.post('/friends/request', { userId: targetId }),
    onSuccess: () => {
      setFriendRequestSent(true);
      showToast('تم إرسال طلب الصداقة', 'success');
    },
    onError: () => showToast('فشل إرسال طلب الصداقة', 'error'),
  });

  const calcScore = async () => {
    if (aiScore || loadingScore) return;
    setLoadingScore(true);
    try {
      const res = await apiClient.get(`/matches/profile/${targetId}`);
      const data = res.data?.data;
      setAiScore({
        matchScore: data?.matchScore ?? 0,
        matchReasons: data?.matchReasons ?? [],
      });
    } catch {
      setAiScore({ matchScore: 0, matchReasons: ['تعذر حساب التوافق'] });
    } finally {
      setLoadingScore(false);
    }
  };

  const infoItems: [string, string][] = [
    ['العمر', user.age ? `${user.age} سنة` : '—'],
    ['الجنس', user.gender === 'male' ? 'ذكر' : 'أنثى'],
    ['الدولة', user.country || '—'],
    ['المدينة', user.city || '—'],
    ['التعليم', ({high_school:'ثانوية',diploma:'دبلوم',bachelor:'بكالوريوس',master:'ماجستير',phd:'دكتوراه'})[user.education as string] || user.education || '—'],
    ['العمل', user.jobTitle || '—'],
    ['نمط الحياة', ({conservative:'محافظ',moderate:'معتدل',open:'منفتح'})[user.lifestyle as string] || user.lifestyle || '—'],
    ['المذهب', ({sunni:'سني',shia:'شيعي',other:'أخرى'})[user.sect as string] || user.sect || '—'],
    ['مستوى الصلاة', ({always:'دائماً',mostly:'في الغالب',sometimes:'أحياناً',rarely:'نادراً'})[user.prayerLevel as string] || user.prayerLevel || '—'],
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      {/* 90vh is computed off the layout viewport, which on mobile Safari/Chrome
          can be taller than what's actually visible (browser chrome not
          subtracted) -- pushed content past this app's own fixed header/bottom
          nav (#174). dvh tracks the real visible height. */}
      <div className="relative z-10 w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl max-h-[min(90vh,90dvh)] flex flex-col"
        style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>

        {/* ── Luxury header ─────────────────────────────────────── */}
        <div className="relative p-5 pb-6 shrink-0"
          style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 55%, var(--accent) 100%)' }}>
          <button onClick={onClose} aria-label="إغلاق"
            className="absolute top-4 left-4 w-8 h-8 rounded-xl flex items-center justify-center transition-all hover:scale-110 active:scale-95"
            style={{ background: 'rgba(255,255,255,0.2)', color: 'white' }}>
            <X size={16} weight="bold" />
          </button>

          <div className="flex items-center gap-4">
            {avatarSrc ? (
              <Image src={avatarSrc} alt={user.fullName || ''} width={64} height={64}
                className="rounded-2xl object-cover shrink-0"
                style={{ border: '3px solid rgba(255,255,255,0.4)' }} />
            ) : (
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black text-white shrink-0"
                style={{ background: 'rgba(255,255,255,0.2)', border: '3px solid rgba(255,255,255,0.35)', backdropFilter: 'blur(8px)' }}>
                {initial}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-extrabold text-white truncate">{user.fullName || user.username}</h2>
              <div className="flex items-center gap-2 flex-wrap mt-0.5">
                {user.age && <span className="text-xs text-white/70">{user.age} سنة</span>}
                {(user.city || user.country) && (
                  <span className="flex items-center gap-0.5 text-xs text-white/70">
                    <MapPin size={10} />
                    {[user.city, user.country].filter(Boolean).join('، ')}
                  </span>
                )}
              </div>
              {user.username && (
                <span className="text-xs text-white/50 mt-0.5 block">@{user.username}</span>
              )}
            </div>
          </div>
        </div>

        {/* ── Tabs ──────────────────────────────────────────────── */}
        <div className="flex shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>
          {[
            { key: 'profile', label: 'الملف الشخصي', icon: User },
            { key: 'match', label: 'نقاط التوافق', icon: Sparkle },
          ].map(({ key, label, icon: Icon }) => (
            <button key={key}
              onClick={() => { setTab(key as any); if (key === 'match') calcScore(); }}
              className="flex-1 flex items-center justify-center gap-1.5 py-3 text-sm font-semibold transition-colors"
              style={tab === key
                ? { color: 'var(--primary)', borderBottom: '2px solid var(--accent)' }
                : { color: 'var(--muted-foreground)', borderBottom: '2px solid transparent' }}>
              <Icon size={14} weight={tab === key ? 'fill' : 'regular'} />
              {label}
            </button>
          ))}
        </div>

        {/* ── Content ───────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto scrollbar-thin p-5">

          {/* Profile tab */}
          {tab === 'profile' && (
            <div className="space-y-4">
              {user.bio && (
                <div className="rounded-2xl p-4" style={{ background: 'var(--muted)' }}>
                  <p className="text-xs font-semibold mb-1.5" style={{ color: 'var(--muted-foreground)' }}>نبذة شخصية</p>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--foreground)' }}>{user.bio}</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-2.5">
                {infoItems.map(([k, v]) => (
                  <div key={k} className="rounded-xl p-3" style={{ background: 'var(--muted)' }}>
                    <dt className="text-[11px] font-semibold mb-0.5" style={{ color: 'var(--muted-foreground)' }}>{k}</dt>
                    <dd className="text-sm font-bold truncate" style={{ color: 'var(--foreground)' }}>{v}</dd>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Match tab */}
          {tab === 'match' && (
            <div className="space-y-5">
              {loadingScore ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3">
                  <div className="w-10 h-10 rounded-full border-3 animate-spin"
                    style={{ borderColor: 'var(--primary)', borderTopColor: 'transparent', borderWidth: 3 }} />
                  <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>جاري حساب التوافق...</p>
                </div>
              ) : aiScore ? (
                <>
                  {/* Score hero */}
                  <div className="rounded-2xl p-6 text-center"
                    style={{ background: scoreBg(aiScore.matchScore), border: `1px solid color-mix(in srgb, ${scoreColor(aiScore.matchScore)} 20%, var(--border))` }}>
                    <p className="text-6xl font-black leading-none" style={{ color: scoreColor(aiScore.matchScore) }}>
                      {aiScore.matchScore}%
                    </p>
                    <p className="text-sm font-semibold mt-2" style={{ color: scoreColor(aiScore.matchScore) }}>
                      {scoreLabel(aiScore.matchScore)}
                    </p>
                    <p className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>نسبة التوافق الإجمالية</p>
                  </div>

                  {/* Match reasons */}
                  {aiScore.matchReasons?.length > 0 && (
                    <div className="rounded-2xl p-4"
                      style={{ background: 'color-mix(in srgb, var(--accent) 8%, var(--muted))', border: '1px solid color-mix(in srgb, var(--accent) 20%, var(--border))' }}>
                      <p className="text-xs font-bold mb-2.5" style={{ color: 'var(--accent)' }}>أسباب التوافق</p>
                      <ul className="space-y-1.5">
                        {aiScore.matchReasons.map((r, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm">
                            <Check size={13} weight="bold" className="mt-0.5 shrink-0" style={{ color: 'var(--primary)' }} />
                            <span style={{ color: 'var(--foreground)' }}>{r}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Category breakdown */}
                  <div>
                    <p className="text-xs font-bold mb-3" style={{ color: 'var(--muted-foreground)' }}>تفصيل التوافق حسب المحاور</p>
                    <div className="space-y-2.5">
                      {CATEGORIES.map((c) => {
                        const val = Math.min(100, Math.round(aiScore.matchScore * (0.85 + c.weight / 2)));
                        const col = scoreColor(val);
                        return (
                          <div key={c.label} className="flex items-center gap-3">
                            <span className="text-base w-6 shrink-0">{c.emoji}</span>
                            <div className="flex-1">
                              <div className="flex justify-between mb-1">
                                <span className="text-xs font-medium" style={{ color: 'var(--foreground)' }}>{c.label}</span>
                                <span className="text-[11px] tabular-nums" style={{ color: 'var(--muted-foreground)' }}>
                                  {val}% · وزن {Math.round(c.weight * 100)}%
                                </span>
                              </div>
                              <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--muted)' }}>
                                <div className="h-full rounded-full transition-all duration-700"
                                  style={{ width: `${val}%`, background: col }} />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Comparison table */}
                  <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
                    <div className="grid grid-cols-3 px-4 py-2.5 text-xs font-bold"
                      style={{ background: 'var(--muted)', color: 'var(--muted-foreground)' }}>
                      <span>المحور</span>
                      <span className="text-center">أنت</span>
                      <span className="text-center">{user.fullName?.split(' ')?.[0] ?? ''}</span>
                    </div>
                    {[
                      ['المذهب', myProfile?.data?.sect, user.sect],
                      ['نمط الحياة', myProfile?.data?.lifestyle, user.lifestyle],
                      ['الصلاة', myProfile?.data?.prayerLevel, user.prayerLevel],
                      ['الدولة', myProfile?.data?.country, user.country],
                    ].map(([k, a, b]) => {
                      const match = a && b && a === b;
                      return (
                        <div key={String(k)} className="grid grid-cols-3 px-4 py-2.5 text-sm"
                          style={{ borderTop: '1px solid color-mix(in srgb, var(--border) 50%, transparent)' }}>
                          <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{k}</span>
                          <span className="text-center text-xs font-medium" style={{ color: 'var(--foreground)' }}>{a || '—'}</span>
                          <span className="text-center text-xs font-medium flex items-center justify-center gap-1"
                            style={{ color: match ? 'var(--primary)' : 'var(--foreground)' }}>
                            {b || '—'}
                            {match && <Check size={10} weight="bold" />}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </>
              ) : (
                <div className="text-center py-10">
                  <div className="mx-auto mb-3 w-14 h-14 rounded-2xl flex items-center justify-center"
                    style={{ background: 'color-mix(in srgb, var(--primary) 10%, var(--muted))' }}>
                    <Sparkle size={28} weight="light" style={{ color: 'var(--primary)', opacity: 0.5 }} />
                  </div>
                  <p className="text-sm font-semibold mb-1" style={{ color: 'var(--foreground)' }}>حساب التوافق</p>
                  <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                    اضغط على تبويب نقاط التوافق لحساب التوافق معه
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Footer ────────────────────────────────────────────── */}
        <div className="shrink-0 p-4 space-y-2" style={{ borderTop: '1px solid var(--border)' }}>
          {chatError && (
            <p className="text-xs text-center mb-2" style={{ color: '#ef4444' }}>{chatError}</p>
          )}
          <div className="flex gap-2">
            <button
              onClick={() => { onClose(); router.push(user.username ? `/${user.username}` : `/profile/${targetId}`); }}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-2xl text-sm font-bold transition-all hover:scale-[1.01] active:scale-95"
              style={{ background: 'var(--muted)', color: 'var(--foreground)', border: '1px solid var(--border)' }}>
              <ArrowSquareOut size={15} weight="bold" />
              عرض الملف
            </button>
            <button
              onClick={() => sendFriendRequest.mutate()}
              disabled={sendFriendRequest.isPending || friendRequestSent}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-2xl text-sm font-bold text-white transition-all hover:scale-[1.01] active:scale-95 disabled:opacity-60"
              style={{ background: friendRequestSent ? 'var(--muted)' : 'linear-gradient(135deg, var(--accent), #c8952e)', color: friendRequestSent ? 'var(--muted-foreground)' : 'white' }}>
              {friendRequestSent ? <><Check size={15} weight="bold" /> تم الإرسال</> : <><UserPlus size={15} weight="bold" /> إضافة صديق</>}
            </button>
          </div>
          <button
            onClick={() => createConversation.mutate()}
            disabled={createConversation.isPending}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-bold text-white transition-all hover:scale-[1.01] active:scale-95 disabled:opacity-60"
            style={{ background: 'linear-gradient(135deg, var(--primary), var(--secondary))', boxShadow: '0 4px 16px color-mix(in srgb, var(--primary) 30%, transparent)' }}>
            {createConversation.isPending ? (
              <>
                <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                جاري بدء المحادثة...
              </>
            ) : (
              <>
                <ChatCircle size={16} weight="fill" />
                ابدأ المحادثة
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
