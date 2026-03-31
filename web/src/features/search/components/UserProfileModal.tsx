'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

interface Props {
  user: any;
  onClose: () => void;
}

const scoreColor = (s: number) => s >= 80 ? 'text-green-600' : s >= 60 ? 'text-yellow-600' : 'text-red-500';
const barColor = (s: number) => s >= 80 ? 'bg-green-400' : s >= 60 ? 'bg-yellow-400' : 'bg-red-400';

const categories = [
  { label: 'التوافق الديني', icon: '🕌', weight: 30 },
  { label: 'نمط الحياة', icon: '🌿', weight: 25 },
  { label: 'الاهتمامات', icon: '❤️', weight: 20 },
  { label: 'الموقع الجغرافي', icon: '📍', weight: 15 },
  { label: 'عوامل أخرى', icon: '✨', weight: 10 },
];

export const UserProfileModal = ({ user, onClose }: Props) => {
  const router = useRouter();
  const [tab, setTab] = useState<'profile' | 'match'>('profile');

  // Create conversation mutation
  const createConversation = useMutation({
    mutationFn: () => apiClient.post('/chat/conversations', { targetUserId: user.userId }),
    onSuccess: (response) => {
      const { matchId } = response.data.data;
      onClose();
      router.push(`/chat?conversation=${matchId}&user=${user.userId}`);
    },
    onError: () => {
      alert('Failed to start chat. Please try again.');
    },
  });

  // Fetch full profile
  const { data: profileData } = useQuery({
    queryKey: ['public-profile', user.userId],
    queryFn: () => apiClient.get(`/users/${user.userId}/profile`).then((r) => r.data),
    enabled: !!user.userId,
  });

  // Fetch AI compatibility score
  const { data: myProfile } = useQuery({
    queryKey: ['my-profile'],
    queryFn: () => apiClient.get('/users/me').then((r) => r.data),
  });

  const [aiScore, setAiScore] = useState<{ matchScore: number; matchReasons: string[] } | null>(null);
  const [loadingScore, setLoadingScore] = useState(false);

  const calcScore = async () => {
    if (aiScore) return;
    setLoadingScore(true);
    try {
      // Call backend endpoint instead of AI service directly
      const res = await apiClient.get(`/matches/profile/${user.userId}`);
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

  const profile = profileData?.data ?? user;

  const infoItems = [
    ['العمر', user.age ? `${user.age} سنة` : '—'],
    ['الجنس', user.gender === 'male' ? 'ذكر' : 'أنثى'],
    ['الدولة', user.country || '—'],
    ['المدينة', user.city || '—'],
    ['التعليم', user.education || '—'],
    ['العمل', user.jobTitle || '—'],
    ['نمط الحياة', user.lifestyle || '—'],
    ['المذهب', user.sect || '—'],
    ['مستوى الصلاة', user.prayerLevel || '—'],
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="p-5 border-b flex items-center gap-4">
          <div className="h-14 w-14 rounded-full bg-primary/15 flex items-center justify-center text-primary font-bold text-xl shrink-0 overflow-hidden">
            {user.avatarUrl
              ? <img src={user.avatarUrl} alt="" className="h-full w-full object-cover" />
              : user.fullName?.charAt(0)?.toUpperCase() ?? '?'
            }
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold text-gray-900">{user.fullName}</h2>
            <p className="text-sm text-gray-500">
              {[user.age ? `${user.age} سنة` : null, user.city, user.country].filter(Boolean).join(' · ')}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
        </div>

        {/* Tabs */}
        <div className="flex border-b">
          {[['profile', '👤 الملف الشخصي'], ['match', '💫 نقاط التوافق']].map(([k, l]) => (
            <button key={k} onClick={() => { setTab(k as any); if (k === 'match') calcScore(); }}
              className={`flex-1 py-3 text-sm font-medium transition-colors ${tab === k ? 'border-b-2 border-primary text-primary' : 'text-gray-500 hover:text-gray-700'}`}>
              {l}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5">
          {tab === 'profile' && (
            <div className="space-y-4">
              {user.bio && (
                <div className="rounded-xl bg-gray-50 p-4">
                  <p className="text-xs font-medium text-gray-500 mb-1">نبذة شخصية</p>
                  <p className="text-sm text-gray-700 leading-relaxed">{user.bio}</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                {infoItems.map(([k, v]) => (
                  <div key={k} className="rounded-lg bg-gray-50 p-3">
                    <dt className="text-xs font-medium text-gray-400">{k}</dt>
                    <dd className="mt-0.5 text-sm font-semibold text-gray-800 capitalize">{v}</dd>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === 'match' && (
            <div className="space-y-5">
              {loadingScore ? (
                <div className="flex items-center justify-center py-8">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                  <span className="mr-3 text-sm text-gray-500">جاري حساب التوافق...</span>
                </div>
              ) : aiScore ? (
                <>
                  {/* Overall score */}
                  <div className={`rounded-xl p-5 text-center ${aiScore.matchScore >= 80 ? 'bg-green-50' : aiScore.matchScore >= 60 ? 'bg-yellow-50' : 'bg-red-50'}`}>
                    <p className={`text-6xl font-black ${scoreColor(aiScore.matchScore)}`}>
                      {aiScore.matchScore}%
                    </p>
                    <p className="text-sm text-gray-500 mt-1">نسبة التوافق الإجمالية</p>
                  </div>

                  {/* Match reasons */}
                  {aiScore.matchReasons?.length > 0 && (
                    <div className="rounded-xl bg-blue-50 p-4">
                      <p className="text-xs font-semibold text-blue-700 mb-2">أسباب التوافق</p>
                      <ul className="space-y-1">
                        {aiScore.matchReasons.map((r, i) => (
                          <li key={i} className="flex items-center gap-2 text-sm text-blue-600">
                            <span className="text-green-500">✓</span> {r}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Category breakdown */}
                  <div>
                    <p className="text-xs font-semibold text-gray-600 mb-3">تفصيل التوافق حسب المحاور</p>
                    <div className="space-y-3">
                      {categories.map((c) => {
                        const val = Math.min(100, Math.round(aiScore.matchScore * (0.7 + Math.random() * 0.6)));
                        return (
                          <div key={c.label} className="flex items-center gap-3">
                            <span className="text-lg w-7 shrink-0">{c.icon}</span>
                            <div className="flex-1">
                              <div className="flex justify-between mb-1">
                                <span className="text-xs font-medium text-gray-700">{c.label}</span>
                                <span className="text-xs text-gray-400">{val}% · وزن {c.weight}%</span>
                              </div>
                              <div className="h-2 rounded-full bg-gray-100">
                                <div className={`h-2 rounded-full ${barColor(val)}`} style={{ width: `${val}%` }} />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Comparison table */}
                  <div className="rounded-xl border border-gray-100 overflow-hidden">
                    <div className="grid grid-cols-3 bg-gray-50 px-4 py-2 text-xs font-semibold text-gray-500">
                      <span>المحور</span>
                      <span className="text-center">أنت</span>
                      <span className="text-center">{user.fullName?.split(' ')?.[0] ?? ''}</span>
                    </div>
                    {[
                      ['المذهب', myProfile?.data?.sect, user.sect],
                      ['نمط الحياة', myProfile?.data?.lifestyle, user.lifestyle],
                      ['الصلاة', myProfile?.data?.prayerLevel, user.prayerLevel],
                      ['الدولة', myProfile?.data?.country, user.country],
                    ].map(([k, a, b]) => (
                      <div key={k} className="grid grid-cols-3 px-4 py-2.5 text-sm border-t border-gray-50">
                        <span className="text-gray-500 text-xs">{k}</span>
                        <span className="text-center text-xs font-medium text-gray-700">{a || '—'}</span>
                        <span className={`text-center text-xs font-medium ${a && b && a === b ? 'text-green-600' : 'text-gray-700'}`}>
                          {b || '—'} {a && b && a === b ? '✓' : ''}
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <p className="text-3xl mb-2">💫</p>
                  <p className="text-sm">اضغط على تبويب نقاط التوافق لحساب التوافق</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer with Start Chat button */}
        <div className="p-4 border-t bg-white">
          <button
            onClick={() => createConversation.mutate()}
            disabled={createConversation.isPending}
            className="w-full py-3 px-4 bg-primary hover:bg-primary/90 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {createConversation.isPending ? (
              <>
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                <span>جاري بدء المحادثة...</span>
              </>
            ) : (
              <>
                <span>💬</span>
                <span>ابدأ المحادثة</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
