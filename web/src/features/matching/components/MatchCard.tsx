'use client';
import type { Match } from '@/types';

interface Props {
  match: Match;
  onView: () => void;
  onAccept?: () => void;
  onReject?: () => void;
  accepting?: boolean;
  rejecting?: boolean;
}

const scoreColor = (s: number) =>
  s >= 80 ? 'text-green-600' : s >= 60 ? 'text-yellow-600' : 'text-red-500';

const scoreRing = (s: number) =>
  s >= 80 ? 'ring-green-400' : s >= 60 ? 'ring-yellow-400' : 'ring-red-400';

const scoreLabel = (s: number) =>
  s >= 80 ? 'توافق ممتاز' : s >= 60 ? 'توافق جيد' : 'توافق منخفض';

export const MatchCard = ({ match, onView, onAccept, onReject, accepting, rejecting }: Props) => {
  const isPending = match.status === 'pending';

  return (
    <div className="rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      {/* Score banner */}
      <div className={`h-1.5 ${match.score >= 80 ? 'bg-green-400' : match.score >= 60 ? 'bg-yellow-400' : 'bg-red-400'}`} />

      <div className="p-5">
        {/* Avatar + score */}
        <div className="flex items-center justify-between mb-4">
          <div className={`h-14 w-14 rounded-full bg-primary/15 flex items-center justify-center text-primary font-bold text-xl ring-4 ${scoreRing(match.score)}`}>
            {match.user2Id?.slice(0, 2).toUpperCase()}
          </div>
          <div className="text-center">
            <p className={`text-4xl font-black ${scoreColor(match.score)}`}>{match.score}%</p>
            <p className="text-xs text-gray-400">{scoreLabel(match.score)}</p>
          </div>
        </div>

        {/* ID */}
        <p className="text-xs text-gray-400 mb-1">معرّف المستخدم</p>
        <p className="text-sm font-mono text-gray-700 mb-4 truncate">{match.user2Id}</p>

        {/* Score breakdown bars */}
        <ScoreBreakdown score={match.score} />

        {/* Date */}
        <p className="text-xs text-gray-400 mt-3 mb-4">
          {new Date(match.createdAt).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>

        {/* Actions */}
        <div className="flex gap-2">
          <button onClick={onView}
            className="flex-1 rounded-lg border border-gray-200 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors">
            عرض التفاصيل
          </button>
          {isPending && onAccept && onReject && (
            <>
              <button onClick={onReject} disabled={rejecting}
                className="rounded-lg border border-red-200 px-3 py-2 text-xs font-medium text-red-500 hover:bg-red-50 disabled:opacity-50 transition-colors">
                ✕
              </button>
              <button onClick={onAccept} disabled={accepting}
                className="rounded-lg bg-primary px-3 py-2 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-50 transition-colors">
                ✓ قبول
              </button>
            </>
          )}
          {!isPending && (
            <span className={`flex-1 rounded-lg py-2 text-center text-xs font-medium ${
              match.status === 'accepted' ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-400'
            }`}>
              {match.status === 'accepted' ? '✓ مقبول' : '✕ مرفوض'}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

// Simulated breakdown based on total score
const ScoreBreakdown = ({ score }: { score: number }) => {
  const categories = [
    { label: 'الدين', weight: 0.30 },
    { label: 'نمط الحياة', weight: 0.25 },
    { label: 'الاهتمامات', weight: 0.20 },
    { label: 'الموقع', weight: 0.15 },
    { label: 'أخرى', weight: 0.10 },
  ];

  return (
    <div className="space-y-1.5">
      {categories.map((c) => {
        const val = Math.min(100, Math.round(score * (0.8 + Math.random() * 0.4)));
        return (
          <div key={c.label} className="flex items-center gap-2">
            <span className="w-20 text-xs text-gray-400 shrink-0">{c.label}</span>
            <div className="flex-1 h-1.5 rounded-full bg-gray-100">
              <div
                className={`h-1.5 rounded-full ${val >= 80 ? 'bg-green-400' : val >= 60 ? 'bg-yellow-400' : 'bg-red-400'}`}
                style={{ width: `${val}%` }}
              />
            </div>
            <span className="text-xs text-gray-500 w-8 text-left">{val}%</span>
          </div>
        );
      })}
    </div>
  );
};
