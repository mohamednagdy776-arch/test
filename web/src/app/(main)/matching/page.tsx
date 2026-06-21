'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { MatchingStats } from '@/features/matching/components/MatchingStats';
import { MatchingTabs } from '@/features/matching/components/MatchingTabs';
import { MatchCard } from '@/features/matching/components/MatchCard';
import { MatchDetailModal } from '@/features/matching/components/MatchDetailModal';
import { useGenerateMatches } from '@/features/matching/hooks';
import { useDebounce } from '@/hooks/useDebounce';
import {
  Sparkle, MagnifyingGlass, MapPin, Scales,
  X, SlidersHorizontal, Robot,
} from '@phosphor-icons/react';
import type { Match } from '@/types';

type Tab = 'pending' | 'accepted' | 'rejected';

export default function MatchingPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('pending');
  const [showFilters, setShowFilters] = useState(false);
  const [ageMin, setAgeMin] = useState(18);
  const [ageMax, setAgeMax] = useState(45);
  const [location, setLocation] = useState('');
  const [prayerLevel, setPrayerLevel] = useState('');
  const generateMatches = useGenerateMatches();
  const debouncedLocation = useDebounce(location, 400);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [detailMatch, setDetailMatch] = useState<Match | null>(null);

  const hasFilters = !!location || !!prayerLevel || ageMin !== 18 || ageMax !== 45;

  const { data: allData } = useQuery({
    queryKey: ['matches-all-counts'],
    queryFn: () => apiClient.get('/matches', { params: { page: 1, limit: 100 } }).then((r) => r.data),
    staleTime: 60_000,
  });
  const allMatches: Match[] = allData?.data ?? [];
  const counts = {
    pending: allMatches.filter((m) => m.status === 'pending').length,
    accepted: allMatches.filter((m) => m.status === 'accepted').length,
    rejected: allMatches.filter((m) => m.status === 'rejected').length,
  };

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['matches-filtered', tab, ageMin, ageMax, debouncedLocation, prayerLevel],
    queryFn: () => apiClient.get('/matches', {
      params: {
        page: 1, limit: 20, status: tab,
        minAge: ageMin, maxAge: ageMax,
        location: debouncedLocation || undefined,
        prayerLevel: prayerLevel || undefined,
      },
    }).then((r) => r.data),
  });
  const matches: Match[] = data?.data ?? [];

  const handleAction = async (matchId: string, action: 'accept' | 'reject') => {
    setActionLoading(matchId + action);
    setActionError(null);
    try {
      await apiClient.patch(`/matches/${matchId}/${action}`);
      refetch();
    } catch (err: any) {
      setActionError(err?.response?.data?.message || 'فشلت العملية، يرجى المحاولة مجدداً');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-5">
      {detailMatch && (
        <MatchDetailModal
          match={detailMatch}
          onClose={() => setDetailMatch(null)}
          onAccept={detailMatch.status === 'pending'
            ? () => { handleAction(detailMatch.id, 'accept'); setDetailMatch(null); }
            : undefined}
          onReject={detailMatch.status === 'pending'
            ? () => { handleAction(detailMatch.id, 'reject'); setDetailMatch(null); }
            : undefined}
          accepting={actionLoading === detailMatch.id + 'accept'}
          rejecting={actionLoading === detailMatch.id + 'reject'}
        />
      )}

      {/* ── Hero Header ──────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl p-5"
        style={{
          background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 55%, var(--accent) 100%)',
          boxShadow: '0 8px 32px color-mix(in srgb, var(--primary) 30%, transparent)',
        }}>
        <div className="absolute -top-6 -left-6 w-24 h-24 rounded-full opacity-10 bg-white" />
        <div className="absolute -bottom-8 -right-4 w-32 h-32 rounded-full opacity-10 bg-white" />
        <div className="relative z-10 flex items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <Robot size={14} weight="fill" className="text-white/70" />
              <span className="text-[11px] font-semibold text-white/70">مدعوم بالذكاء الاصطناعي</span>
            </div>
            <h1 className="text-xl font-extrabold text-white">اكتشف توافقاتك</h1>
            <p className="text-xs text-white/70 mt-0.5">نظام ذكي يجد أفضل التوافقات لك</p>
          </div>
          <button onClick={() => generateMatches.mutate()} disabled={generateMatches.isPending}
            className="shrink-0 flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-bold transition-all hover:scale-105 active:scale-95 disabled:opacity-60"
            style={{ background: 'rgba(255,255,255,0.2)', color: 'white', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.3)' }}>
            <Sparkle size={15} weight="fill" className={generateMatches.isPending ? 'animate-spin' : ''} />
            {generateMatches.isPending ? 'يبحث...' : 'إيجاد توافقات'}
          </button>
        </div>
      </div>

      {/* ── Stats ───────────────────────────────────────────────── */}
      <MatchingStats />

      {/* ── Tabs + Filter toggle ─────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <MatchingTabs activeTab={tab} onTabChange={setTab} counts={counts} />
        </div>
        <button onClick={() => setShowFilters((v) => !v)}
          className="shrink-0 relative flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all hover:scale-105 active:scale-95"
          style={showFilters || hasFilters
            ? { background: 'color-mix(in srgb, var(--primary) 12%, var(--muted))', color: 'var(--primary)', border: '1px solid color-mix(in srgb, var(--primary) 25%, var(--border))' }
            : { background: 'var(--card)', color: 'var(--muted-foreground)', border: '1px solid var(--border)' }}>
          <SlidersHorizontal size={15} />
          فلترة
          {hasFilters && (
            <span className="absolute -top-1 -left-1 w-4 h-4 rounded-full text-[9px] font-bold text-white flex items-center justify-center"
              style={{ background: 'var(--accent)' }}>!</span>
          )}
        </button>
      </div>

      {/* ── Filter Panel ─────────────────────────────────────────── */}
      {showFilters && (
        <div className="rounded-2xl p-4 animate-slide-down"
          style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-bold flex items-center gap-1.5" style={{ color: 'var(--muted-foreground)' }}>
              <MagnifyingGlass size={13} /> فلاتر البحث
            </p>
            {hasFilters && (
              <button onClick={() => { setAgeMin(18); setAgeMax(45); setLocation(''); setPrayerLevel(''); }}
                className="flex items-center gap-1 text-xs font-semibold hover:opacity-70 transition-opacity"
                style={{ color: 'var(--accent)' }}>
                <X size={12} /> مسح الفلاتر
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--foreground)' }}>العمر</label>
              <div className="flex items-center gap-2">
                <input type="number" value={ageMin} min={18} max={ageMax}
                  onChange={(e) => setAgeMin(parseInt(e.target.value) || 18)}
                  placeholder="من"
                  className="w-full px-3 py-2.5 rounded-xl text-sm text-center transition-all focus:outline-none focus:ring-2"
                  style={{ background: 'var(--background)', border: '1px solid var(--border)', color: 'var(--foreground)' }} />
                <span className="text-xs shrink-0" style={{ color: 'var(--muted-foreground)' }}>—</span>
                <input type="number" value={ageMax} min={ageMin} max={99}
                  onChange={(e) => setAgeMax(parseInt(e.target.value) || 45)}
                  placeholder="إلى"
                  className="w-full px-3 py-2.5 rounded-xl text-sm text-center transition-all focus:outline-none focus:ring-2"
                  style={{ background: 'var(--background)', border: '1px solid var(--border)', color: 'var(--foreground)' }} />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--foreground)' }}>الموقع</label>
              <div className="relative">
                <MapPin size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
                  style={{ color: 'var(--muted-foreground)' }} />
                <input type="text" value={location} onChange={(e) => setLocation(e.target.value)}
                  placeholder="المدينة أو المنطقة"
                  className="w-full pr-8 pl-3 py-2.5 rounded-xl text-sm transition-all focus:outline-none focus:ring-2"
                  style={{ background: 'var(--background)', border: '1px solid var(--border)', color: 'var(--foreground)' }} />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5 flex items-center gap-1" style={{ color: 'var(--foreground)' }}>
                <Scales size={12} /> الالتزام الديني
              </label>
              <select value={prayerLevel} onChange={(e) => setPrayerLevel(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl text-sm transition-all focus:outline-none focus:ring-2 cursor-pointer appearance-none"
                style={{ background: 'var(--background)', border: '1px solid var(--border)', color: 'var(--foreground)' }}>
                <option value="">الكل</option>
                <option value="high">عالي</option>
                <option value="medium">متوسط</option>
                <option value="low">منخفض</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* ── Error ───────────────────────────────────────────────── */}
      {actionError && (
        <div className="rounded-xl px-4 py-3 flex items-center gap-2 text-sm"
          style={{ background: 'color-mix(in srgb, #ef4444 8%, transparent)', border: '1px solid color-mix(in srgb, #ef4444 25%, transparent)', color: '#ef4444' }}>
          <span className="flex-1">{actionError}</span>
          <button onClick={() => setActionError(null)} className="opacity-60 hover:opacity-100 transition-opacity font-bold">✕</button>
        </div>
      )}

      {generateMatches.isSuccess && (
        <div className="rounded-xl px-4 py-3 flex items-center gap-2 text-sm animate-fade-in"
          style={{ background: 'color-mix(in srgb, var(--primary) 8%, transparent)', border: '1px solid color-mix(in srgb, var(--primary) 20%, transparent)', color: 'var(--primary)' }}>
          <Sparkle size={14} weight="fill" />
          <span>تم إنشاء توافقات جديدة! تحقق من قائمة الانتظار.</span>
        </div>
      )}

      {/* ── Cards Grid ──────────────────────────────────────────── */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-80 rounded-2xl animate-pulse" style={{ background: 'var(--muted)' }} />
          ))}
        </div>
      ) : isError ? (
        <div className="rounded-2xl p-10 text-center"
          style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          <p className="text-3xl mb-2">⚠️</p>
          <p className="font-semibold" style={{ color: 'var(--foreground)' }}>فشل تحميل التوافقات</p>
          <button onClick={() => refetch()} className="mt-4 px-4 py-2 rounded-xl text-sm font-bold text-white"
            style={{ background: 'linear-gradient(135deg, var(--primary), var(--secondary))' }}>
            إعادة المحاولة
          </button>
        </div>
      ) : matches.length === 0 ? (
        <div className="rounded-2xl p-12 text-center"
          style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          <div className="mx-auto mb-4 w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{ background: 'color-mix(in srgb, var(--primary) 10%, var(--muted))' }}>
            <Sparkle size={32} weight="light" style={{ color: 'var(--primary)', opacity: 0.5 }} />
          </div>
          <p className="text-base font-bold" style={{ color: 'var(--foreground)' }}>
            {tab === 'pending' ? 'لا توجد توافقات في الانتظار'
              : tab === 'accepted' ? 'لم تقبل أي توافق بعد'
              : 'لم ترفض أي توافق'}
          </p>
          <p className="text-sm mt-1 mb-5" style={{ color: 'var(--muted-foreground)' }}>
            {hasFilters ? 'جرّب تغيير فلاتر البحث' : 'اضغط على "إيجاد توافقات" لبدء البحث'}
          </p>
          <button onClick={() => generateMatches.mutate()} disabled={generateMatches.isPending}
            className="px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:scale-105 disabled:opacity-60"
            style={{ background: 'linear-gradient(135deg, var(--primary), var(--secondary))' }}>
            <Sparkle size={13} className="inline ml-1" />
            {generateMatches.isPending ? 'يبحث...' : 'إيجاد توافقات'}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {matches.map((match) => (
            <MatchCard
              key={match.id}
              match={match}
              onView={() => setDetailMatch(match)}
              onAccept={match.status !== 'accepted' ? () => handleAction(match.id, 'accept') : undefined}
              onReject={match.status !== 'rejected' ? () => handleAction(match.id, 'reject') : undefined}
              onViewProfile={() => {
                const username = (match as any).user?.username || (match as any).otherUsername;
                if (username) router.push(`/${username}`);
              }}
              onSendMessage={() => {
                const uid = (match as any).user?.id || (match as any).otherUserId;
                if (uid) router.push(`/chat?user=${uid}`);
              }}
              accepting={actionLoading === match.id + 'accept'}
              rejecting={actionLoading === match.id + 'reject'}
            />
          ))}
        </div>
      )}
    </div>
  );
}
