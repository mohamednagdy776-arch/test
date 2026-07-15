'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
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
import { useT } from '@/i18n/I18nProvider';

type Tab = 'pending' | 'accepted' | 'rejected';

export default function MatchingPage() {
  const { t } = useT();
  const router = useRouter();
  const queryClient = useQueryClient();
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
        // Sent as `prayerLevel` but the UI labels/values this field as
        // "الالتزام الديني" (Religious Commitment), and the backend never
        // even accepted this param at all -- it had zero effect (#257).
        religiousCommitment: prayerLevel || undefined,
      },
    }).then((r) => r.data),
  });
  const matches: Match[] = data?.data ?? [];

  const handleAction = async (matchId: string, action: 'accept' | 'reject' | 'undo-reject' | 'undo-accept') => {
    setActionLoading(matchId + action);
    setActionError(null);
    const newStatus = action === 'accept' ? 'accepted' : action === 'reject' ? 'rejected' : 'pending';

    const prevAllData = queryClient.getQueryData<any>(['matches-all-counts']);
    if (prevAllData?.data) {
      queryClient.setQueryData(['matches-all-counts'], {
        ...prevAllData,
        data: prevAllData.data.map((m: Match) =>
          m.id === matchId ? { ...m, status: newStatus } : m
        ),
      });
    }

    const filteredKey = ['matches-filtered', tab, ageMin, ageMax, debouncedLocation, prayerLevel];
    const prevFilteredData = queryClient.getQueryData<any>(filteredKey);
    if (prevFilteredData?.data) {
      queryClient.setQueryData(filteredKey, {
        ...prevFilteredData,
        data: prevFilteredData.data.filter((m: Match) => m.id !== matchId),
      });
    }

    try {
      await apiClient.patch(`/matches/${matchId}/${action}`);
      queryClient.invalidateQueries({ queryKey: ['matches-all-counts'] });
      queryClient.invalidateQueries({ queryKey: ['matches-filtered'] });
    } catch (err: any) {
      if (prevAllData !== undefined) queryClient.setQueryData(['matches-all-counts'], prevAllData);
      if (prevFilteredData !== undefined) queryClient.setQueryData(filteredKey, prevFilteredData);
      setActionError(err?.response?.data?.message || t('matching.actionFailed'));
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
              <span className="text-[11px] font-semibold text-white/70">{t('matching.aiPowered')}</span>
            </div>
            <h1 className="text-xl font-extrabold text-white">{t('matching.heroTitle')}</h1>
            <p className="text-xs text-white/70 mt-0.5">{t('matching.heroSubtitle')}</p>
          </div>
          <button onClick={() => generateMatches.mutate()} disabled={generateMatches.isPending}
            className="shrink-0 flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-bold transition-all hover:scale-105 active:scale-95 disabled:opacity-60"
            style={{ background: 'rgba(255,255,255,0.2)', color: 'white', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.3)' }}>
            <Sparkle size={15} weight="fill" className={generateMatches.isPending ? 'animate-spin' : ''} />
            {generateMatches.isPending ? t('matching.searching') : t('matching.findMatches')}
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
          {t('matching.filterLabel')}
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
              <MagnifyingGlass size={13} /> {t('matching.searchFilters')}
            </p>
            {hasFilters && (
              <button onClick={() => { setAgeMin(18); setAgeMax(45); setLocation(''); setPrayerLevel(''); }}
                className="flex items-center gap-1 text-xs font-semibold hover:opacity-70 transition-opacity"
                style={{ color: 'var(--accent)' }}>
                <X size={12} /> {t('matching.clearFilters')}
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--foreground)' }}>{t('matching.filterAge')}</label>
              <div className="flex items-center gap-2">
                <input type="number" value={ageMin} min={18} max={ageMax}
                  onChange={(e) => setAgeMin(parseInt(e.target.value) || 18)}
                  placeholder={t('matching.from')}
                  className="w-full px-3 py-2.5 rounded-xl text-sm text-center transition-all focus:outline-none focus:ring-2"
                  style={{ background: 'var(--background)', border: '1px solid var(--border)', color: 'var(--foreground)' }} />
                <span className="text-xs shrink-0" style={{ color: 'var(--muted-foreground)' }}>—</span>
                <input type="number" value={ageMax} min={ageMin} max={99}
                  onChange={(e) => setAgeMax(parseInt(e.target.value) || 45)}
                  placeholder={t('matching.to')}
                  className="w-full px-3 py-2.5 rounded-xl text-sm text-center transition-all focus:outline-none focus:ring-2"
                  style={{ background: 'var(--background)', border: '1px solid var(--border)', color: 'var(--foreground)' }} />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--foreground)' }}>{t('matching.locationLabel')}</label>
              <div className="relative">
                <MapPin size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
                  style={{ color: 'var(--muted-foreground)' }} />
                <input type="text" value={location} onChange={(e) => setLocation(e.target.value)}
                  placeholder={t('matching.locationPlaceholder')}
                  className="w-full pr-8 pl-3 py-2.5 rounded-xl text-sm transition-all focus:outline-none focus:ring-2"
                  style={{ background: 'var(--background)', border: '1px solid var(--border)', color: 'var(--foreground)' }} />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5 flex items-center gap-1" style={{ color: 'var(--foreground)' }}>
                <Scales size={12} /> {t('matching.religiousCommitment')}
              </label>
              {/* Values were 'high'/'medium'/'low', matching neither this
                  field's real name (religiousCommitment) nor its actual
                  stored values ('very_committed'/'committed'/'moderate'/
                  'low', per ProfileEditForm.tsx) -- never matched anything
                  server-side even once the param itself got wired up (#257). */}
              <select value={prayerLevel} onChange={(e) => setPrayerLevel(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl text-sm transition-all focus:outline-none focus:ring-2 cursor-pointer appearance-none"
                style={{ background: 'var(--background)', border: '1px solid var(--border)', color: 'var(--foreground)' }}>
                <option value="">{t('matching.commitment.all')}</option>
                <option value="very_committed">{t('matching.commitment.veryCommitted')}</option>
                <option value="committed">{t('matching.commitment.committed')}</option>
                <option value="moderate">{t('matching.commitment.moderate')}</option>
                <option value="low">{t('matching.commitment.low')}</option>
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
          <span>{t('matching.matchesGeneratedSuccess')}</span>
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
          <p className="font-semibold" style={{ color: 'var(--foreground)' }}>{t('matching.loadError')}</p>
          <button onClick={() => refetch()} className="mt-4 px-4 py-2 rounded-xl text-sm font-bold text-white"
            style={{ background: 'linear-gradient(135deg, var(--primary), var(--secondary))' }}>
            {t('matching.retry')}
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
            {tab === 'pending' ? t('matching.emptyPending')
              : tab === 'accepted' ? t('matching.emptyAccepted')
              : t('matching.emptyRejected')}
          </p>
          <p className="text-sm mt-1 mb-5" style={{ color: 'var(--muted-foreground)' }}>
            {hasFilters ? t('matching.tryChangingFilters') : t('matching.pressToStart')}
          </p>
          <button onClick={() => generateMatches.mutate()} disabled={generateMatches.isPending}
            className="px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:scale-105 disabled:opacity-60"
            style={{ background: 'linear-gradient(135deg, var(--primary), var(--secondary))' }}>
            <Sparkle size={13} className="inline ml-1" />
            {generateMatches.isPending ? t('matching.searching') : t('matching.findMatches')}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {matches.map((match) => (
            <MatchCard
              key={match.id}
              match={match}
              onView={() => setDetailMatch(match)}
              onAccept={match.status === 'pending' ? () => handleAction(match.id, 'accept') : undefined}
              onReject={match.status === 'pending' ? () => handleAction(match.id, 'reject') : undefined}
              onUndoReject={match.status === 'rejected' ? () => handleAction(match.id, 'undo-reject') : undefined}
              onUndoAccept={match.status === 'accepted' ? () => handleAction(match.id, 'undo-accept') : undefined}
              onViewProfile={() => {
                const uid = (match as any).otherUserId;
                if (uid) router.push(`/profile/${uid}`);
              }}
              onSendMessage={() => {
                const uid = (match as any).otherUserId;
                if (uid) router.push(`/chat?user=${uid}`);
              }}
              accepting={actionLoading === match.id + 'accept' || actionLoading === match.id + 'undo-reject'}
              rejecting={actionLoading === match.id + 'reject'}
            />
          ))}
        </div>
      )}
    </div>
  );
}
