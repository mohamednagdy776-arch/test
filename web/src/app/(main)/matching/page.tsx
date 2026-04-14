'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { MatchingStats } from '@/features/matching/components/MatchingStats';
import { MatchingTabs } from '@/features/matching/components/MatchingTabs';
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

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['matches-web', ageRange, location, prayerLevel],
    queryFn: () => apiClient.get('/matches', { 
      params: { 
        page: 1, 
        limit: 20,
        minAge: ageRange[0],
        maxAge: ageRange[1],
        location: location || undefined,
        prayerLevel: prayerLevel || undefined
      } 
    }).then((r) => r.data),
  });

  const matches: MatchWithUser[] = data?.data || [];

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
                      onClick={() => apiClient.patch(`/matches/${match.id}/accept`).then(() => refetch())}
                      className="flex-1 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/30 transition-all"
                    >
                      قبول
                    </button>
                    <button
                      onClick={() => apiClient.patch(`/matches/${match.id}/reject`).then(() => refetch())}
                      className="flex-1 rounded-xl border border-emerald-200/50 py-2.5 text-sm font-medium text-emerald-700 hover:bg-emerald-50 transition-colors"
                    >
                      رفض
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