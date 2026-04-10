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

  const scoreColor = (score: number) => score >= 80 ? 'text-green-600' : score >= 60 ? 'text-yellow-600' : 'text-red-500';

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">التوافق</h1>
      </div>

      <div className="rounded-xl bg-white p-4 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">العمر</label>
            <div className="flex gap-2">
              <input
                type="number"
                value={ageRange[0]}
                onChange={(e) => setAgeRange([parseInt(e.target.value) || 18, ageRange[1]])}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                placeholder="من"
              />
              <input
                type="number"
                value={ageRange[1]}
                onChange={(e) => setAgeRange([ageRange[0], parseInt(e.target.value) || 35])}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                placeholder="إلى"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">الموقع</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
              placeholder="المدينة"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">مستوى الالتزام الديني</label>
            <select
              value={prayerLevel}
              onChange={(e) => setPrayerLevel(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
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
              <div key={i} className="h-64 rounded-xl bg-white animate-pulse" />
            ))}
          </>
        ) : matches.length === 0 ? (
          <div className="col-span-3 rounded-xl bg-white p-8 text-center text-gray-400">
            لا توجد توافقات
          </div>
        ) : (
          matches.map((match) => (
            <div key={match.id} className="rounded-xl bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                  {match.user?.avatarUrl ? (
                    <img src={match.user.avatarUrl} alt="" className="h-full w-full object-cover rounded-full" />
                  ) : (
                    match.user?.fullName?.charAt(0) || match.user2Id?.slice(0, 2).toUpperCase()
                  )}
                </div>
                <div className="text-center">
                  <p className={`text-3xl font-bold ${scoreColor(match.score)}`}>{match.score}%</p>
                  <p className="text-xs text-gray-400">توافق</p>
                </div>
              </div>
              
              <div className="mb-3 text-center">
                <p className="font-semibold text-gray-800">{match.user?.fullName || 'مستخدم'}</p>
                <p className="text-xs text-gray-500">
                  {match.user?.age && `العمر: ${match.user.age} · `}
                  {match.user?.location || 'غير محدد'}
                </p>
                {match.user?.prayerLevel && (
                  <p className="text-xs text-gray-400">الالتزام: {match.user.prayerLevel}</p>
                )}
              </div>

              {match.status === 'pending' ? (
                <div className="flex flex-col gap-2">
                  <div className="flex gap-2">
                    <button
                      onClick={() => apiClient.patch(`/matches/${match.id}/accept`).then(() => refetch())}
                      className="flex-1 rounded-lg bg-primary py-2 text-sm font-medium text-white hover:bg-blue-700"
                    >
                      قبول
                    </button>
                    <button
                      onClick={() => apiClient.patch(`/matches/${match.id}/reject`).then(() => refetch())}
                      className="flex-1 rounded-lg border border-gray-200 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
                    >
                      رفض
                    </button>
                  </div>
                  {match.user?.username && (
                    <button
                      onClick={() => handleViewProfile(match.user!.username)}
                      className="w-full rounded-lg border border-gray-200 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
                    >
                      عرض الملف
                    </button>
                  )}
                  {match.user?.id && (
                    <button
                      onClick={() => handleSendMessage(match.user!.id)}
                      className="w-full rounded-lg bg-green-600 py-2 text-sm font-medium text-white hover:bg-green-700"
                    >
                      إرسال رسالة
                    </button>
                  )}
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <div className={`rounded-lg py-2 text-center text-sm font-medium ${match.status === 'accepted' ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-500'}`}>
                    {match.status === 'accepted' ? '✓ تم القبول' : '✗ تم الرفض'}
                  </div>
                  {match.status === 'accepted' && match.user?.username && (
                    <>
                      <button
                        onClick={() => handleViewProfile(match.user!.username)}
                        className="w-full rounded-lg border border-gray-200 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
                      >
                        عرض الملف
                      </button>
                      <button
                        onClick={() => handleSendMessage(match.user!.id)}
                        className="w-full rounded-lg bg-green-600 py-2 text-sm font-medium text-white hover:bg-green-700"
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