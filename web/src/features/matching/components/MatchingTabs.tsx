'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { clsx } from 'clsx';
import { useState } from 'react';
import { MatchCard } from './MatchCard';
import { MatchDetailModal } from './MatchDetailModal';
import type { Match } from '@/types';

type Tab = 'pending' | 'accepted' | 'rejected';

interface Props {
  activeTab: Tab;
  onTabChange: (t: Tab) => void;
}

const tabs: { key: Tab; label: string; icon: string }[] = [
  { key: 'pending', label: 'في الانتظار', icon: '⏳' },
  { key: 'accepted', label: 'مقبول', icon: '✅' },
  { key: 'rejected', label: 'مرفوض', icon: '❌' },
];

export const MatchingTabs = ({ activeTab, onTabChange }: Props) => {
  const qc = useQueryClient();
  const [selected, setSelected] = useState<Match | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['matches-web'],
    queryFn: () => apiClient.get('/matches', { params: { page: 1, limit: 100 } }).then((r) => r.data),
  });

  const accept = useMutation({
    mutationFn: (id: string) => apiClient.patch(`/matches/${id}/accept`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['matches-web'] }); setSelected(null); },
  });

  const reject = useMutation({
    mutationFn: (id: string) => apiClient.patch(`/matches/${id}/reject`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['matches-web'] }); setSelected(null); },
  });

  const all: Match[] = data?.data ?? [];
  const filtered = all.filter((m) => m.status === activeTab);

  return (
    <div>
      {/* Tab bar */}
      <div className="flex gap-1 rounded-xl bg-gray-100 p-1 mb-5">
        {tabs.map((t) => {
          const count = all.filter((m) => m.status === t.key).length;
          return (
            <button
              key={t.key}
              onClick={() => onTabChange(t.key)}
              className={clsx(
                'flex-1 flex items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-medium transition-all',
                activeTab === t.key
                  ? 'bg-white text-primary shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              )}
            >
              <span>{t.icon}</span>
              <span>{t.label}</span>
              {count > 0 && (
                <span className={clsx(
                  'rounded-full px-1.5 py-0.5 text-xs font-bold',
                  activeTab === t.key ? 'bg-primary/10 text-primary' : 'bg-gray-200 text-gray-500'
                )}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Content */}
      {isLoading && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-56 rounded-xl bg-white animate-pulse" />)}
        </div>
      )}

      {isError && (
        <div className="rounded-xl bg-red-50 p-4 text-sm text-red-600">فشل تحميل التوافقات</div>
      )}

      {!isLoading && !isError && filtered.length === 0 && (
        <div className="rounded-xl bg-white p-12 text-center text-gray-400">
          <p className="text-4xl mb-3">
            {activeTab === 'pending' ? '⏳' : activeTab === 'accepted' ? '✅' : '❌'}
          </p>
          <p className="font-medium">
            {activeTab === 'pending' ? 'لا توجد توافقات في الانتظار' :
             activeTab === 'accepted' ? 'لم تقبل أي توافق بعد' : 'لم ترفض أي توافق'}
          </p>
        </div>
      )}

      {!isLoading && filtered.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((m) => (
            <MatchCard
              key={m.id}
              match={m}
              onView={() => setSelected(m)}
              onAccept={activeTab === 'pending' ? () => accept.mutate(m.id) : undefined}
              onReject={activeTab === 'pending' ? () => reject.mutate(m.id) : undefined}
              accepting={accept.isPending}
              rejecting={reject.isPending}
            />
          ))}
        </div>
      )}

      {selected && (
        <MatchDetailModal
          match={selected}
          onClose={() => setSelected(null)}
          onAccept={selected.status === 'pending' ? () => accept.mutate(selected.id) : undefined}
          onReject={selected.status === 'pending' ? () => reject.mutate(selected.id) : undefined}
          accepting={accept.isPending}
          rejecting={reject.isPending}
        />
      )}
    </div>
  );
};
