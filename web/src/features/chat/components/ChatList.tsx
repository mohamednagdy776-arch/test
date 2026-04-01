'use client';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { clsx } from 'clsx';
import type { Match } from '@/types';

interface Props {
  activeMatchId?: string;
  onSelect: (match: Match) => void;
}

export const ChatList = ({ activeMatchId, onSelect }: Props) => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['chat-matches'],
    queryFn: () => apiClient.get('/matches', { params: { page: 1, limit: 50 } }).then((r) => r.data),
  });

  if (isLoading) return (
    <div className="space-y-2">
      {[1,2,3].map((i) => <div key={i} className="h-16 rounded-xl bg-white animate-pulse" />)}
    </div>
  );

  if (isError) return (
    <div className="rounded-xl bg-red-50 p-4 text-sm text-red-600">فشل تحميل المحادثات</div>
  );

  const conversations: Match[] = (data?.data ?? []).filter((m: Match) => m.status === 'accepted' || m.status === 'chat');

  if (conversations.length === 0) return (
    <div className="rounded-xl bg-white p-8 text-center text-gray-400">
      <p className="text-3xl mb-2">💬</p>
      <p className="text-sm font-medium">لا توجد محادثات بعد</p>
      <p className="text-xs mt-1 text-gray-300">اقبل توافقاً لبدء المحادثة</p>
    </div>
  );

  return (
    <div className="space-y-1 overflow-y-auto">
      {conversations.map((m) => (
        <button
          key={m.id}
          onClick={() => onSelect(m)}
          className={clsx(
            'w-full flex items-center gap-3 rounded-xl p-3 text-right transition-colors',
            activeMatchId === m.id ? 'bg-primary/10' : 'bg-white hover:bg-gray-50'
          )}
        >
          <div className="h-11 w-11 shrink-0 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold overflow-hidden">
            {m.otherUserAvatar ? (
              <img src={m.otherUserAvatar} alt="" className="w-full h-full object-cover" />
            ) : (
              (m.otherUserName || m.user2Id || 'U').charAt(0).toUpperCase()
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className={clsx('text-sm font-medium truncate', activeMatchId === m.id ? 'text-primary' : 'text-gray-900')}>
              {m.otherUserName || `مستخدم ${m.user2Id?.slice(0, 8)}`}
            </p>
            <p className="text-xs text-gray-400 truncate">
              توافق {m.score}% · {new Date(m.createdAt).toLocaleDateString('ar-EG')}
            </p>
          </div>
        </button>
      ))}
    </div>
  );
};
