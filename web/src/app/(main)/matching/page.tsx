'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { MatchingStats } from '@/features/matching/components/MatchingStats';
import { MatchingTabs } from '@/features/matching/components/MatchingTabs';
import { useGenerateMatches } from '@/features/matching/hooks';
import type { Match } from '@/types';

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

export default function MatchingPage() {
  const router = useRouter();
  const [tab, setTab] = useState<'pending' | 'accepted' | 'rejected'>('pending');
  const [ageRange, setAgeRange] = useState<[number, number]>([18, 35]);
  const [location, setLocation] = useState('');
  const [prayerLevel, setPrayerLevel] = useState('');

  const generateMatches = useGenerateMatches();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['matches-web', ageRange, location, prayerLevel, tab],
    queryFn: () => apiClient.get('/matches', {
      params: {
        page: 1,
        limit: 20,
        status: tab,
        minAge: ageRange[0],
        maxAge: ageRange[1],
        location: location || undefined,
        prayerLevel: prayerLevel || undefined
      }
    }).then((r) => r.data),
  });

  const matches: MatchWithUser[] = data?.data || [];
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

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

  const handleViewProfile = (username: string) => {
    router.push(`/${username}`);
  };

  const handleSendMessage = (userId: string) => {
    router.push(`/chat?user=${userId}`);
  };

  const scoreColor = (score: number) => score >= 80 ? 'text-emerald-600' : score >= 60 ? 'text-amber-600' : 'text-rose-500';

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-emerald-900">التوافق</h1>
        <button
          onClick={() => generateMatches.mutate()}
          disabled={generateMatches.isPending}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-sm font-semibold shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/30 transition-all disabled:opacity-60"
        >
          {generateMatches.isPending ? (
            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
          ) : (
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
          )}
          {generateMatches.isPending ? 'جاري البحث...' : 'إيجاد توافقات جديدة'}
        </button>
      </div>

      <div className="rounded-2xl bg-gradient-to-br from-[#ECFDF5] to-[#F0FDF4] p-5 shadow-lg shadow-emerald-500/10 border border-emerald-100">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold text-emerald-800 mb-2">العمر</label>
            <div className="flex gap-2">
              <input
                type="number"
                value={ageRange[0]}
                onChange={(e) => setAgeRange([parseInt(e.target.value) || 18, ageRange[1]])}
                className="w-full px-4 py-3 rounded-xl border border-emerald-200/50 text-sm bg-white/80 text-emerald-900 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                placeholder="من"
              />
              <input
                type="number"
                value={ageRange[1]}
                onChange={(e) => setAgeRange([ageRange[0], parseInt(e.target.value) || 35])}
                className="w-full px-4 py-3 rounded-xl border border-emerald-200/50 text-sm bg-white/80 text-emerald-900 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                placeholder="إلى"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-emerald-800 mb-2">الموقع</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-emerald-200/50 text-sm bg-white/80 text-emerald-900 placeholder-emerald-400/50 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              placeholder="المدينة"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-emerald-800 mb-2">مستوى الالتزام الديني</label>
            <select
              value={prayerLevel}
              onChange={(e) => setPrayerLevel(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-emerald-200/50 text-sm bg-white/80 text-emerald-900 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            >
              <option value="">الكل</option>
              <option value="high">عالي</option>
              <option value="medium">متوسط</option>
              <option value="low">منخفض</option>
            </select>
          </div>
        </div>
      </div>

      {actionError && (
        <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 flex items-center gap-2">
          <span>⚠️</span><span>{actionError}</span>
          <button onClick={() => setActionError(null)} className="mr-auto text-red-400 hover:text-red-600">✕</button>
        </div>
      )}
      <MatchingStats />
      <MatchingTabs activeTab={tab} onTabChange={setTab} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          <>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-64 rounded-2xl bg-gradient-to-br from-[#ECFDF5] to-[#F0FDF4] animate-pulse shadow-lg shadow-emerald-500/10 border border-emerald-100" />
            ))}
          </>
        ) : matches.length === 0 ? (
          <div className="col-span-3 rounded-2xl bg-gradient-to-br from-[#ECFDF5] to-[#F0FDF4] p-8 text-center text-emerald-600/60 shadow-lg shadow-emerald-500/10 border border-emerald-100">
            لا توجد توافقات
          </div>
        ) : (
          matches.map((match) => (
            <div key={match.id} className="rounded-2xl bg-gradient-to-br from-[#ECFDF5] to-[#F0FDF4] p-5 shadow-lg shadow-emerald-500/10 border border-emerald-100">
              <div className="mb-4 flex items-center justify-between">
                <div className="h-14 w-14 rounded-full bg-gradient-to-br from-emerald-400 to-amber-400 flex items-center justify-center text-white font-bold text-xl">
                  {match.user?.avatarUrl ? (
                    <img src={match.user.avatarUrl} alt="" className="h-full w-full object-cover rounded-full" />
                  ) : (
                    match.user?.fullName?.charAt(0) || match.user2Id?.slice(0, 2).toUpperCase()
                  )}
                </div>
                <div className="text-center">
                  <p className={`text-3xl font-bold ${scoreColor(match.score)}`}>{match.score}%</p>
                  <p className="text-xs text-emerald-500/60">توافق</p>
                </div>
              </div>
              
              <div className="mb-3 text-center">
                <p className="font-semibold text-emerald-900">{match.user?.fullName || 'مستخدم'}</p>
                <p className="text-xs text-emerald-600/60">
                  {match.user?.age && `العمر: ${match.user.age} · `}
                  {match.user?.location || 'غير محدد'}
                </p>
                {match.user?.prayerLevel && (
                  <p className="text-xs text-amber-600 font-medium">الالتزام: {match.user.prayerLevel}</p>
                )}
              </div>

              {match.status === 'pending' ? (
                <div className="flex flex-col gap-2">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAction(match.id, 'accept')}
                      disabled={actionLoading !== null}
                      className="flex-1 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/30 transition-all disabled:opacity-60"
                    >
                      {actionLoading === match.id + 'accept' ? '...' : 'قبول'}
                    </button>
                    <button
                      onClick={() => handleAction(match.id, 'reject')}
                      disabled={actionLoading !== null}
                      className="flex-1 rounded-xl border border-emerald-200/50 py-2.5 text-sm font-medium text-emerald-700 hover:bg-emerald-50 transition-colors disabled:opacity-60"
                    >
                      {actionLoading === match.id + 'reject' ? '...' : 'رفض'}
                    </button>
                  </div>
                  {match.user?.username && (
                    <button
                      onClick={() => handleViewProfile(match.user!.username)}
                      className="w-full rounded-xl border border-emerald-200/50 py-2.5 text-sm font-medium text-emerald-700 hover:bg-emerald-50 transition-colors"
                    >
                      عرض الملف
                    </button>
                  )}
                  {match.user?.id && (
                    <button
                      onClick={() => handleSendMessage(match.user!.id)}
                      className="w-full rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 py-2.5 text-sm font-semibold text-white shadow-lg shadow-amber-500/25 hover:shadow-xl hover:shadow-amber-500/30 transition-all"
                    >
                      إرسال رسالة
                    </button>
                  )}
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <div className={`rounded-xl py-2.5 text-center text-sm font-medium ${match.status === 'accepted' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                    {match.status === 'accepted' ? '✓ تم القبول' : '✗ تم الرفض'}
                  </div>
                  {match.status === 'rejected' && (
                    <button
                      onClick={() => handleAction(match.id, 'accept')}
                      disabled={actionLoading !== null}
                      className="w-full rounded-xl border border-emerald-200/50 py-2.5 text-sm font-medium text-emerald-700 hover:bg-emerald-50 transition-colors disabled:opacity-60"
                    >
                      {actionLoading === match.id + 'accept' ? '...' : '↩ تراجع عن الرفض'}
                    </button>
                  )}
                  {match.status === 'accepted' && match.user?.username && (
                    <>
                      <button
                        onClick={() => handleViewProfile(match.user!.username)}
                        className="w-full rounded-xl border border-emerald-200/50 py-2.5 text-sm font-medium text-emerald-700 hover:bg-emerald-50 transition-colors"
                      >
                        عرض الملف
                      </button>
                      <button
                        onClick={() => handleSendMessage(match.user!.id)}
                        className="w-full rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 py-2.5 text-sm font-semibold text-white shadow-lg shadow-amber-500/25 hover:shadow-xl hover:shadow-amber-500/30 transition-all"
                      >
                        إرسال رسالة
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}