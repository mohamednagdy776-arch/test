'use client';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Heart, HourglassHigh, CheckCircle, ChartBar } from '@phosphor-icons/react';
import type { Match } from '@/types';

export const MatchingStats = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['matches-all-counts'],
    queryFn: () => apiClient.get('/matches', { params: { page: 1, limit: 100 } }).then((r) => r.data),
    staleTime: 60_000,
  });

  const matches: Match[] = data?.data ?? [];
  const total = data?.meta?.total ?? matches.length;
  const accepted = matches.filter((m) => m.status === 'accepted').length;
  const pending = matches.filter((m) => m.status === 'pending').length;
  const avgScore = matches.length
    ? Math.round(matches.reduce((s, m) => s + m.score, 0) / matches.length)
    : 0;

  const stats = [
    {
      label: 'إجمالي التوافقات',
      value: total,
      icon: Heart,
      gradient: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
      textColor: 'white',
      iconBg: 'rgba(255,255,255,0.2)',
    },
    {
      label: 'في الانتظار',
      value: pending,
      icon: HourglassHigh,
      // On-palette warning amber → gold accent (was off-palette #d97706, #740).
      gradient: 'linear-gradient(135deg, #f59e0b 0%, var(--accent) 100%)',
      textColor: 'white',
      iconBg: 'rgba(255,255,255,0.2)',
    },
    {
      label: 'تم القبول',
      value: accepted,
      icon: CheckCircle,
      gradient: 'linear-gradient(135deg, var(--accent) 0%, #c8952e 100%)',
      textColor: 'white',
      iconBg: 'rgba(255,255,255,0.2)',
    },
    {
      label: 'متوسط التوافق',
      value: `${avgScore}%`,
      icon: ChartBar,
      gradient: 'var(--card)',
      textColor: 'var(--foreground)',
      iconBg: 'color-mix(in srgb, var(--primary) 10%, transparent)',
      border: true,
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 rounded-2xl animate-pulse" style={{ background: 'var(--muted)' }} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {stats.map((s) => (
        <div key={s.label} className="relative rounded-2xl p-4 overflow-hidden"
          style={{
            background: s.gradient,
            border: s.border ? '1px solid var(--border)' : 'none',
            boxShadow: s.border ? 'none' : '0 4px 16px rgba(0,0,0,0.1)',
          }}>
          <div className="flex items-start justify-between mb-2">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: s.iconBg }}>
              <s.icon size={18} weight="fill" style={{ color: s.textColor }} />
            </div>
            {/* A manual refresh button only ever appeared on ONE of the four
                stat cards (whichever had `border: true`), with no refresh
                affordance on the others -- an inconsistent, unnecessary
                control on a widget that already refetches on its own
                staleTime (#321). */}
          </div>
          <p className="text-2xl font-extrabold leading-none tabular-nums" style={{ color: s.textColor }}>{s.value}</p>
          <p className="text-[11px] font-medium mt-1 opacity-80" style={{ color: s.textColor }}>{s.label}</p>
        </div>
      ))}
    </div>
  );
};
