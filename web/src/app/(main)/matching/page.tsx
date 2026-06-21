'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { MatchingStats } from '@/features/matching/components/MatchingStats';
import { MatchingTabs } from '@/features/matching/components/MatchingTabs';
import { MatchDetailModal } from '@/features/matching/components/MatchDetailModal';
import { useGenerateMatches } from '@/features/matching/hooks';
import { useDebounce } from '@/hooks/useDebounce';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import {
  Sparkle, MagnifyingGlass, MapPin, Scales,
  Check, X, Eye, ChatCircle, ArrowCounterClockwise,
} from '@phosphor-icons/react';
import type { Match } from '@/types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || '';

interface MatchWithUser extends Match {
  user?: {
    id: string;
    username: string;
    fullName: string;
    avatarUrl?: string;
    age?: number;
    location?: string;
    prayerLevel?: string;
  };
}

function ScoreBadge({ score }: { score: number }) {
  const color = score >= 80 ? 'var(--primary)' : score >= 60 ? '#f59e0b' : '#ef4444';
  const label = score >= 80 ? 'ممتاز' : score >= 60 ? 'جيد' : 'منخفض';
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-14 h-14">
        <svg viewBox="0 0 56 56" className="w-full h-full -rotate-90">
          <circle cx="28" cy="28" r="22" fill="none" stroke="var(--muted)" strokeWidth="4" />
          <circle cx="28" cy="28" r="22" fill="none" stroke={color} strokeWidth="4"
            strokeDasharray={`${(score / 100) * 138} 138`}
            strokeLinecap="round" style={{ transition: 'stroke-dasharray 1s ease' }} />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-extrabold" style={{ color }}>{score}%</span>
        </div>
      </div>
      <span className="text-[10px] font-semibold mt-0.5" style={{ color: 'var(--muted-foreground)' }}>{label}</span>
    </div>
  );
}

function MatchCard({ match, onAccept, onReject, onViewProfile, onSendMessage, onViewDetail, actionLoading }: {
  match: MatchWithUser;
  onAccept: () => void;
  onReject: () => void;
  onViewProfile: () => void;
  onSendMessage: () => void;
  onViewDetail: () => void;
  actionLoading: string | null;
}) {
  const u = match.user;
  const avatarSrc = u?.avatarUrl ? `${API_BASE}${u.avatarUrl}` : null;

  return (
    <div className="rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg group"
      style={{
        background: 'var(--card)',
        border: '1px solid var(--border)',
        boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
      }}>
      {/* Top gradient strip */}
      <div className="h-1 w-full" style={{
        background: match.score >= 80
          ? 'linear-gradient(90deg, var(--primary), var(--accent))'
          : match.score >= 60
            ? 'linear-gradient(90deg, #f59e0b, #d97706)'
            : 'linear-gradient(90deg, #ef4444, #dc2626)',
      }} />

      <div className="p-5">
        {/* Avatar + score */}
        <div className="flex items-start justify-between mb-4">
          <Avatar
            src={avatarSrc}
            name={u?.fullName || 'م'}
            size="lg"
            shape="rounded"
            online={match.status === 'accepted'}
          />
          <ScoreBadge score={match.score} />
        </div>

        {/* User info */}
        <div className="mb-4">
          <h3 className="font-bold text-base truncate" style={{ color: 'var(--foreground)' }}>
            {u?.fullName || 'مستخدم'}
          </h3>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-1">
            {u?.age && (
              <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{u.age} سنة</span>
            )}
            {u?.location && (
              <span className="flex items-center gap-0.5 text-xs" style={{ color: 'var(--muted-foreground)' }}>
                <MapPin size={11} /> {u.location}
              </span>
            )}
          </div>
          {u?.prayerLevel && (
            <span className="inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold"
              style={{ background: 'color-mix(in srgb, var(--primary) 10%, transparent)', color: 'var(--primary)' }}>
              <Scales size={11} /> الالتزام: {u.prayerLevel === 'high' ? 'عالي' : u.prayerLevel === 'medium' ? 'متوسط' : 'منخفض'}
            </span>
          )}
        </div>

        {/* Status badge for accepted/rejected */}
        {match.status !== 'pending' && (
          <div className="mb-3 flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold"
            style={match.status === 'accepted'
              ? { background: 'color-mix(in srgb, var(--primary) 10%, transparent)', color: 'var(--primary)' }
              : { background: 'color-mix(in srgb, #ef4444 10%, transparent)', color: '#ef4444' }}>
            {match.status === 'accepted' ? <Check size={14} weight="bold" /> : <X size={14} weight="bold" />}
            {match.status === 'accepted' ? 'تم القبول' : 'تم الرفض'}
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-2">
          {match.status === 'pending' && (
            <>
              <button onClick={onViewDetail}
                className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-all hover:bg-[color-mix(in_srgb,var(--primary)_8%,transparent)]"
                style={{ border: '1px solid var(--border)', color: 'var(--foreground)' }}>
                <Eye size={14} /> عرض تفاصيل التوافق
              </button>
              <div className="flex gap-2">
                <Button variant="primary" size="sm" className="flex-1"
                  onClick={onAccept}
                  loading={actionLoading === match.id + 'accept'}
                  disabled={actionLoading !== null}>
                  <Check size={14} weight="bold" /> قبول
                </Button>
                <Button variant="outline" size="sm" className="flex-1"
                  onClick={onReject}
                  loading={actionLoading === match.id + 'reject'}
                  disabled={actionLoading !== null}>
                  <X size={14} weight="bold" /> رفض
                </Button>
              </div>
            </>
          )}
          {match.status === 'rejected' && (
            <Button variant="outline" size="sm" onClick={onAccept}
              loading={actionLoading === match.id + 'accept'}
              disabled={actionLoading !== null}>
              <ArrowCounterClockwise size={14} /> تراجع عن الرفض
            </Button>
          )}
          {(match.status === 'pending' || match.status === 'accepted') && (
            <div className="flex gap-2">
              {u?.username && (
                <button onClick={onViewProfile}
                  className="flex-1 flex items-center justify-center gap-1 py-2 rounded-xl text-xs font-semibold transition-all hover:bg-[color-mix(in_srgb,var(--primary)_8%,transparent)]"
                  style={{ border: '1px solid var(--border)', color: 'var(--muted-foreground)' }}>
                  <Eye size={12} /> الملف
                </button>
              )}
              {u?.id && (
                <button onClick={onSendMessage}
                  className="flex-1 flex items-center justify-center gap-1 py-2 rounded-xl text-xs font-bold transition-all"
                  style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: '#fff' }}>
                  <ChatCircle size={12} weight="fill" /> رسالة
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function MatchingPage() {
  const router = useRouter();
  const [tab, setTab] = useState<'pending' | 'accepted' | 'rejected'>('pending');
  const [ageRange, setAgeRange] = useState<[number, number]>([18, 35]);
  const [location, setLocation] = useState('');
  const [prayerLevel, setPrayerLevel] = useState('');
  const generateMatches = useGenerateMatches();
  const debouncedLocation = useDebounce(location, 400);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['matches-web', ageRange, debouncedLocation, prayerLevel, tab],
    queryFn: () => apiClient.get('/matches', {
      params: { page: 1, limit: 20, status: tab, minAge: ageRange[0], maxAge: ageRange[1],
        location: debouncedLocation || undefined, prayerLevel: prayerLevel || undefined }
    }).then((r) => r.data),
  });

  const matches: MatchWithUser[] = data?.data || [];
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [detailMatch, setDetailMatch] = useState<MatchWithUser | null>(null);

  const handleAction = async (matchId: string, action: 'accept' | 'reject') => {
    setActionLoading(matchId + action);
    setActionError(null);
    try {
      await apiClient.patch(`/matches/${matchId}/${action}`);
      refetch();
    } catch (err: any) {
      setActionError(err?.response?.data?.message || 'فشلت العملية، يرجى المحاولة مجدداً');
    } finally { setActionLoading(null); }
  };

  return (
    <div className="space-y-5">
      {detailMatch && (
        <MatchDetailModal
          match={detailMatch}
          onClose={() => setDetailMatch(null)}
          onAccept={() => { handleAction(detailMatch.id, 'accept'); setDetailMatch(null); }}
          onReject={() => { handleAction(detailMatch.id, 'reject'); setDetailMatch(null); }}
          accepting={actionLoading === detailMatch.id + 'accept'}
          rejecting={actionLoading === detailMatch.id + 'reject'}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold" style={{ color: 'var(--foreground)' }}>التوافق</h1>
          <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>اكتشف توافقاتك المثالية</p>
        </div>
        <Button variant="primary" size="sm" onClick={() => generateMatches.mutate()} loading={generateMatches.isPending}>
          <Sparkle size={15} weight="fill" />
          {generateMatches.isPending ? 'جاري البحث...' : 'إيجاد توافقات'}
        </Button>
      </div>

      {/* Filters */}
      <div className="rounded-2xl p-4"
        style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
        <p className="text-xs font-bold mb-3 flex items-center gap-1.5" style={{ color: 'var(--muted-foreground)' }}>
          <MagnifyingGlass size={13} /> فلاتر البحث
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--foreground)' }}>العمر</label>
            <div className="flex gap-2">
              {[['من', ageRange[0], (v: number) => setAgeRange([v, ageRange[1]])],
                ['إلى', ageRange[1], (v: number) => setAgeRange([ageRange[0], v])]].map(([ph, val, cb]) => (
                <input key={String(ph)} type="number" value={val as number}
                  onChange={(e) => (cb as Function)(parseInt(e.target.value) || 18)}
                  placeholder={ph as string}
                  className="w-full px-3 py-2.5 rounded-xl text-sm transition-all focus:outline-none focus:ring-2"
                  style={{
                    background: 'var(--background)', border: '1px solid var(--border)',
                    color: 'var(--foreground)',
                  }} />
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--foreground)' }}>الموقع</label>
            <div className="relative">
              <MapPin size={14} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--muted-foreground)' }} />
              <input type="text" value={location} onChange={(e) => setLocation(e.target.value)}
                placeholder="المدينة"
                className="w-full pr-8 pl-3 py-2.5 rounded-xl text-sm transition-all focus:outline-none focus:ring-2"
                style={{ background: 'var(--background)', border: '1px solid var(--border)', color: 'var(--foreground)' }} />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--foreground)' }}>الالتزام الديني</label>
            <select value={prayerLevel} onChange={(e) => setPrayerLevel(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl text-sm transition-all focus:outline-none focus:ring-2 cursor-pointer"
              style={{ background: 'var(--background)', border: '1px solid var(--border)', color: 'var(--foreground)' }}>
              <option value="">الكل</option>
              <option value="high">عالي</option>
              <option value="medium">متوسط</option>
              <option value="low">منخفض</option>
            </select>
          </div>
        </div>
      </div>

      {actionError && (
        <div className="rounded-xl px-4 py-3 flex items-center gap-2 text-sm"
          style={{ background: 'color-mix(in srgb, #ef4444 8%, transparent)', border: '1px solid color-mix(in srgb, #ef4444 25%, transparent)', color: '#ef4444' }}>
          <span className="flex-1">{actionError}</span>
          <button onClick={() => setActionError(null)} className="opacity-60 hover:opacity-100 transition-opacity">✕</button>
        </div>
      )}

      <MatchingStats />
      <MatchingTabs activeTab={tab} onTabChange={setTab} />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-72 rounded-2xl animate-pulse" style={{ background: 'var(--muted)' }} />
          ))
        ) : matches.length === 0 ? (
          <div className="col-span-full rounded-2xl p-12 text-center"
            style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
            <Sparkle size={40} weight="light" className="mx-auto mb-3 opacity-30" style={{ color: 'var(--primary)' }} />
            <p className="font-semibold" style={{ color: 'var(--foreground)' }}>لا توجد توافقات حالياً</p>
            <p className="text-sm mt-1" style={{ color: 'var(--muted-foreground)' }}>جرّب تغيير الفلاتر أو البحث عن توافقات جديدة</p>
          </div>
        ) : (
          matches.map((match) => (
            <MatchCard
              key={match.id}
              match={match}
              onAccept={() => handleAction(match.id, 'accept')}
              onReject={() => handleAction(match.id, 'reject')}
              onViewProfile={() => match.user?.username && router.push(`/${match.user.username}`)}
              onSendMessage={() => match.user?.id && router.push(`/chat?user=${match.user.id}`)}
              onViewDetail={() => setDetailMatch(match)}
              actionLoading={actionLoading}
            />
          ))
        )}
      </div>
    </div>
  );
}
