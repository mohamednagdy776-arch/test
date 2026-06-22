'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type { Match } from '@/types';
import { resolveMediaUrl } from '@/lib/media';

const scoreColor = (s: number) => s >= 80 ? 'text-green-600' : s >= 60 ? 'text-yellow-600' : 'text-[var(--destructive)]';

const MatchCard = ({ match }: { match: Match }) => {
  const qc = useQueryClient();
  const accept = useMutation({
    mutationFn: () => apiClient.patch(`/matches/${match.id}/accept`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['matches-web'] }),
  });
  const reject = useMutation({
    mutationFn: () => apiClient.patch(`/matches/${match.id}/reject`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['matches-web'] }),
  });

  return (
    <div className="rounded-xl bg-[var(--card)] p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold overflow-hidden">
          {(match as any).otherUserAvatar
            ? <img src={resolveMediaUrl((match as any).otherUserAvatar) ?? ''} alt="" className="h-full w-full object-cover" />
            : ((match as any).otherUserName || 'مستخدم').trim().slice(0, 2).toUpperCase()}
        </div>
        <div className="text-center">
          <p className={`text-3xl font-bold ${scoreColor(match.score)}`}>{match.score}%</p>
          <p className="text-xs text-[var(--muted-foreground)]">توافق</p>
        </div>
      </div>
      <p className="mb-4 text-sm font-semibold text-[var(--foreground)] text-center">{(match as any).otherUserName || 'مستخدم طيبت'}</p>
      {match.status === 'pending' ? (
        <div className="flex gap-2">
          <button onClick={() => accept.mutate()} disabled={accept.isPending}
            className="flex-1 rounded-lg bg-primary py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">
            قبول
          </button>
          <button onClick={() => reject.mutate()} disabled={reject.isPending}
            className="flex-1 rounded-lg border border-[var(--border)] py-2 text-sm font-medium text-[var(--muted-foreground)] hover:bg-[var(--muted)] disabled:opacity-50">
            رفض
          </button>
        </div>
      ) : (
        <div className={`rounded-lg py-2 text-center text-sm font-medium ${match.status === 'accepted' ? 'bg-green-50 text-green-700' : 'bg-[var(--muted)] text-[var(--muted-foreground)]'}`}>
          {match.status === 'accepted' ? '✓ تم القبول' : '✗ تم الرفض'}
        </div>
      )}
    </div>
  );
};

export const MatchList = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['matches-web'],
    queryFn: () => apiClient.get('/matches', { params: { page: 1, limit: 20 } }).then((r) => r.data),
  });

  if (isLoading) return <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">{[1,2,3].map((i) => <div key={i} className="h-48 rounded-xl bg-[var(--card)] animate-pulse" />)}</div>;
  if (isError) return <div className="rounded-xl bg-[var(--destructive)]/10 p-4 text-sm text-[var(--destructive)]">فشل تحميل التوافقات</div>;

  const matches: Match[] = data?.data ?? [];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {matches.length === 0
        ? <div className="col-span-3 rounded-xl bg-[var(--card)] p-8 text-center text-[var(--muted-foreground)]">لا توجد توافقات بعد</div>
        : matches.map((m) => <MatchCard key={m.id} match={m} />)
      }
    </div>
  );
};
