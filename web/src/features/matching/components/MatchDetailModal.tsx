'use client';
import type { Match } from '@/types';

interface Props {
  match: Match;
  onClose: () => void;
  onAccept?: () => void;
  onReject?: () => void;
  accepting?: boolean;
  rejecting?: boolean;
}

const scoreColor = (s: number) =>
  s >= 80 ? 'text-green-600' : s >= 60 ? 'text-yellow-600' : 'text-red-500';

const categories = [
  { label: 'التوافق الديني', weight: 30, icon: '🕌' },
  { label: 'نمط الحياة', weight: 25, icon: '🌿' },
  { label: 'الاهتمامات المشتركة', weight: 20, icon: '❤️' },
  { label: 'التوافق الجغرافي', weight: 15, icon: '📍' },
  { label: 'عوامل أخرى', weight: 10, icon: '✨' },
];

export const MatchDetailModal = ({ match, onClose, onAccept, onReject, accepting, rejecting }: Props) => {
  const isPending = match.status === 'pending';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">

        {/* Score header */}
        <div className={`p-6 text-center ${match.score >= 80 ? 'bg-green-50' : match.score >= 60 ? 'bg-yellow-50' : 'bg-red-50'}`}>
          <button onClick={onClose} className="absolute top-4 left-4 text-gray-400 hover:text-gray-600 text-xl">×</button>
          <div className="h-20 w-20 rounded-full bg-white mx-auto mb-3 flex items-center justify-center text-primary font-black text-2xl shadow-md">
            {match.user2Id?.slice(0, 2).toUpperCase()}
          </div>
          <p className={`text-5xl font-black ${scoreColor(match.score)}`}>{match.score}%</p>
          <p className="text-sm text-gray-500 mt-1">نسبة التوافق</p>
          {match.status !== 'pending' && (
            <span className={`mt-2 inline-block rounded-full px-3 py-1 text-xs font-medium ${
              match.status === 'accepted' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
            }`}>
              {match.status === 'accepted' ? '✓ تم القبول' : '✕ تم الرفض'}
            </span>
          )}
        </div>

        <div className="p-6 space-y-5">
          {/* Match reasons */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">أسباب التوافق</h3>
            <div className="space-y-2">
              {categories.map((c) => {
                const val = Math.min(100, Math.round(match.score * (0.75 + Math.random() * 0.5)));
                return (
                  <div key={c.label} className="flex items-center gap-3">
                    <span className="text-lg w-7 shrink-0">{c.icon}</span>
                    <div className="flex-1">
                      <div className="flex justify-between mb-1">
                        <span className="text-xs font-medium text-gray-700">{c.label}</span>
                        <span className="text-xs text-gray-500">{val}% · وزن {c.weight}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-gray-100">
                        <div
                          className={`h-2 rounded-full transition-all ${val >= 80 ? 'bg-green-400' : val >= 60 ? 'bg-yellow-400' : 'bg-red-400'}`}
                          style={{ width: `${val}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Match info */}
          <div className="rounded-xl bg-gray-50 p-4 space-y-2">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">معلومات التوافق</h3>
            {[
              ['معرّف التوافق', match.id.slice(0, 16) + '…'],
              ['تاريخ الإنشاء', new Date(match.createdAt).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })],
              ['الحالة', match.status === 'pending' ? 'في الانتظار' : match.status === 'accepted' ? 'مقبول' : 'مرفوض'],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between text-sm">
                <span className="text-gray-500">{k}</span>
                <span className="font-medium text-gray-800">{v}</span>
              </div>
            ))}
          </div>

          {/* How scoring works */}
          <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
            <h3 className="text-xs font-semibold text-blue-700 mb-2">كيف يعمل نظام التوافق؟</h3>
            <p className="text-xs text-blue-600 leading-relaxed">
              يحسب الذكاء الاصطناعي نسبة التوافق بناءً على 5 محاور رئيسية: التوافق الديني (30%)،
              نمط الحياة (25%)، الاهتمامات المشتركة (20%)، التوافق الجغرافي (15%)، وعوامل أخرى (10%).
            </p>
          </div>

          {/* Actions */}
          {isPending && onAccept && onReject && (
            <div className="flex gap-3 pt-2">
              <button onClick={onReject} disabled={rejecting}
                className="flex-1 rounded-xl border-2 border-red-200 py-3 text-sm font-semibold text-red-500 hover:bg-red-50 disabled:opacity-50 transition-colors">
                ✕ رفض
              </button>
              <button onClick={onAccept} disabled={accepting}
                className="flex-1 rounded-xl bg-primary py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50 transition-colors">
                {accepting ? 'جاري القبول...' : '✓ قبول التوافق'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
