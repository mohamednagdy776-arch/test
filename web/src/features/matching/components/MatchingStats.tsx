'use client';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type { Match } from '@/types';

export const MatchingStats = () => {
  const { data } = useQuery({
    queryKey: ['matches-web'],
    queryFn: () => apiClient.get('/matches', { params: { page: 1, limit: 100 } }).then((r) => r.data),
  });

  const matches: Match[] = data?.data ?? [];
  const total = data?.meta?.total ?? 0;
  const accepted = matches.filter((m) => m.status === 'accepted').length;
  const pending = matches.filter((m) => m.status === 'pending').length;
  const avgScore = matches.length
    ? Math.round(matches.reduce((s, m) => s + m.score, 0) / matches.length)
    : 0;

  const stats = [
    { label: 'إجمالي التوافقات', value: total, color: 'bg-blue-50 text-blue-700', icon: '💫' },
    { label: 'في الانتظار', value: pending, color: 'bg-yellow-50 text-yellow-700', icon: '⏳' },
    { label: 'تم القبول', value: accepted, color: 'bg-green-50 text-green-700', icon: '✅' },
    { label: 'متوسط التوافق', value: `${avgScore}%`, color: 'bg-purple-50 text-purple-700', icon: '📊' },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {stats.map((s) => (
        <div key={s.label} className={`rounded-xl p-4 ${s.color}`}>
          <p className="text-xl mb-1">{s.icon}</p>
          <p className="text-2xl font-bold">{s.value}</p>
          <p className="text-xs opacity-70 mt-0.5">{s.label}</p>
        </div>
      ))}
    </div>
  );
};
