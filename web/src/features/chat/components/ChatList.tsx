'use client';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type { Match } from '@/types';

// Chat is based on accepted matches
export const ChatList = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['chat-matches'],
    queryFn: () => apiClient.get('/matches', { params: { page: 1, limit: 50 } }).then((r) => r.data),
  });

  if (isLoading) return <div className="space-y-3">{[1,2,3].map((i) => <div key={i} className="h-16 rounded-xl bg-white animate-pulse" />)}</div>;
  if (isError) return <div className="rounded-xl bg-red-50 p-4 text-sm text-red-600">فشل تحميل المحادثات</div>;

  const accepted: Match[] = (data?.data ?? []).filter((m: Match) => m.status === 'accepted');

  return (
    <div className="space-y-2">
      {accepted.length === 0 ? (
        <div className="rounded-xl bg-white p-8 text-center text-gray-400">
          <p className="text-lg mb-2">💬</p>
          <p>لا توجد محادثات بعد</p>
          <p className="text-xs mt-1">اقبل توافقاً لبدء المحادثة</p>
        </div>
      ) : (
        accepted.map((m) => (
          <div key={m.id} className="flex items-center gap-3 rounded-xl bg-white p-4 shadow-sm hover:shadow-md cursor-pointer transition-shadow">
            <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
              {m.user2Id?.slice(0, 2).toUpperCase()}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900 font-mono">{m.user2Id?.slice(0, 12)}…</p>
              <p className="text-xs text-gray-400">اضغط لفتح المحادثة</p>
            </div>
            <span className="text-xs text-gray-400">{new Date(m.createdAt).toLocaleDateString('ar-EG')}</span>
          </div>
        ))
      )}
    </div>
  );
};
