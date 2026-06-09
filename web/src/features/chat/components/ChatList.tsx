'use client';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { clsx } from 'clsx';
import type { Match } from '@/types';

interface Conversation {
  id: string;
  name: string;
  avatar?: string;
  isGroup: boolean;
  lastMessage?: { content: string; createdAt: string; senderId: string };
  createdAt: string;
  unreadCount?: number;
}

interface Props {
  activeMatchId?: string;
  onSelect: (match: Match) => void;
}

export const ChatList = ({ activeMatchId, onSelect }: Props) => {
  const { data: matchData, isLoading: matchLoading, isError } = useQuery({
    queryKey: ['chat-matches'],
    queryFn: () => apiClient.get('/matches', { params: { page: 1, limit: 50 } }).then((r) => r.data),
  });

  const { data: convData } = useQuery({
    queryKey: ['conversations'],
    queryFn: () => apiClient.get('/chat/conversations').then((r) => r.data),
  });

  if (matchLoading) return (
    <div className="space-y-2">
      {[1,2,3].map((i) => <div key={i} className="h-16 rounded-xl bg-white animate-pulse" />)}
    </div>
  );

  if (isError) return (
    <div className="rounded-xl bg-red-50 p-4 text-sm text-red-600">فشل تحميل المحادثات</div>
  );

  const conversations: any[] = convData?.data || [];
  const allMatches: any[] = (matchData?.data ?? []).filter((m: Match) => m.status === 'accepted' || m.status === 'chat');

  // Hide matches that already have a conversation (avoid duplicate rows).
  const convOtherIds = new Set(conversations.map((c: any) => c.otherUserId).filter(Boolean));
  const matches = allMatches.filter((m: any) => !convOtherIds.has(m.otherUserId));

  const sortedItems = [
    ...conversations.map((c: any) => ({ ...c, _kind: 'conversation' })),
    ...matches.map((m: any) => ({ ...m, _kind: 'match' })),
  ].sort((a: any, b: any) => {
    const dateA = a.lastMessage?.createdAt || a.createdAt;
    const dateB = b.lastMessage?.createdAt || b.createdAt;
    return new Date(dateB).getTime() - new Date(dateA).getTime();
  });

  // Normalize any selected item to a real conversation before opening the window.
  const handleSelect = async (item: any, isConversation: boolean) => {
    if (isConversation) {
      onSelect({
        id: item.id,
        user2Id: item.otherUserId,
        otherUserName: item.otherUserName || item.name,
        otherUserAvatar: item.otherUserAvatar || item.avatar,
      } as any);
      return;
    }
    // It's a match — get/create the underlying conversation first.
    const otherId = item.otherUserId || item.user2Id;
    try {
      const { data } = await apiClient.post('/chat/conversations', { targetUserId: otherId });
      const conv = data.data;
      onSelect({
        id: conv.id,
        user2Id: conv.otherUserId || otherId,
        otherUserName: conv.otherUserName || item.otherUserName,
        otherUserAvatar: conv.otherUserAvatar || item.otherUserAvatar,
      } as any);
    } catch (e) {
      console.error('Failed to open conversation:', e);
    }
  };

  if (sortedItems.length === 0) return (
    <div className="rounded-xl bg-white p-8 text-center text-gray-400">
      <p className="text-3xl mb-2">💬</p>
      <p className="text-sm font-medium">لا توجد محادثات بعد</p>
      <p className="text-xs mt-1 text-gray-300">اقبل توافقاً لبدء المحادثة</p>
    </div>
  );

  const getOtherUserName = (conv: any, match?: Match) => {
    if (conv.name) return conv.name;
    if (match?.otherUserName) return match.otherUserName;
    if (match?.user2Id) return `مستخدم ${match.user2Id.slice(0, 8)}`;
    return 'محادثة';
  };

  const getAvatar = (conv: any, match?: Match) => {
    if (conv.avatar) return conv.avatar;
    if (match?.otherUserAvatar) return match.otherUserAvatar;
    return null;
  };

  const getInitial = (conv: any, match?: Match) => {
    const name = getOtherUserName(conv, match);
    return name.charAt(0).toUpperCase();
  };

  return (
    <div className="space-y-1 overflow-y-auto">
      {sortedItems.map((item: any) => {
        const isConversation = item._kind === 'conversation';
        const match = isConversation ? null : item;
        
        return (
          <button
            key={item.id}
            onClick={() => handleSelect(item, isConversation)}
            className={clsx(
              'w-full flex items-center gap-3 rounded-xl p-3 text-right transition-colors',
              activeMatchId === item.id ? 'bg-primary/10' : 'bg-white hover:bg-gray-50'
            )}
          >
            <div className="h-11 w-11 shrink-0 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold overflow-hidden">
              {getAvatar(item, match) ? (
                <img src={getAvatar(item, match)} alt="" className="w-full h-full object-cover" />
              ) : (
                getInitial(item, match)
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className={clsx('text-sm font-medium truncate', activeMatchId === item.id ? 'text-primary' : 'text-gray-900')}>
                {getOtherUserName(item, match)}
              </p>
              <p className="text-xs text-gray-400 truncate">
                {item.lastMessage?.content?.slice(0, 40) || 'لا توجد رسائل بعد'}
              </p>
            </div>
            {item.unreadCount ? (
              <span className="bg-primary text-white text-xs rounded-full px-2 py-0.5 min-w-[20px] text-center">
                {item.unreadCount}
              </span>
            ) : (
              <p className="text-xs text-gray-300">
                {new Date(item.lastMessage?.createdAt || item.createdAt).toLocaleDateString('ar-EG')}
              </p>
            )}
          </button>
        );
      })}
    </div>
  );
};