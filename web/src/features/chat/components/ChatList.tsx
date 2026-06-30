'use client';
import { useState } from 'react';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type { Match } from '@/types';
import { ChatCircle } from '@phosphor-icons/react';
import { resolveMediaUrl } from '@/lib/media';

interface Props {
  activeMatchId?: string;
  onSelect: (match: Match) => void;
}

function avatarSrc(url?: string | null) {
  return resolveMediaUrl(url);
}

function timeLabel(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffDays === 0) return d.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' });
  if (diffDays === 1) return 'أمس';
  if (diffDays < 7) return d.toLocaleDateString('ar-SA', { weekday: 'short' });
  return d.toLocaleDateString('ar-SA', { day: 'numeric', month: 'short' });
}

export const ChatList = ({ activeMatchId, onSelect }: Props) => {
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 20;

  const { data: matchData, isLoading: matchLoading, isError } = useQuery({
    queryKey: ['chat-matches', page],
    queryFn: () => apiClient.get('/matches', { params: { page: 1, limit: page * PAGE_SIZE } }).then((r) => r.data),
  });

  const { data: convData } = useQuery({
    queryKey: ['conversations'],
    queryFn: () => apiClient.get('/chat/conversations').then((r) => r.data),
  });

  if (matchLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 p-3 rounded-2xl"
            style={{ background: 'var(--muted)' }}>
            <div className="w-11 h-11 rounded-full shrink-0 animate-pulse" style={{ background: 'var(--border)' }} />
            <div className="flex-1 space-y-2">
              <div className="h-3 rounded-full w-2/3 animate-pulse" style={{ background: 'var(--border)' }} />
              <div className="h-2.5 rounded-full w-4/5 animate-pulse" style={{ background: 'var(--border)' }} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-2xl p-6 text-center"
        style={{ background: 'color-mix(in srgb, var(--destructive) 6%, var(--muted))', border: '1px solid color-mix(in srgb, var(--destructive) 20%, var(--border))' }}>
        <p className="text-sm font-medium" style={{ color: 'var(--destructive)' }}>فشل تحميل المحادثات</p>
      </div>
    );
  }

  const conversations: any[] = convData?.data || [];
  const allMatches: any[] = (matchData?.data ?? []).filter(
    (m: Match) => m.status === 'accepted' || m.status === 'chat',
  );

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

  const handleSelect = async (item: any, isConversation: boolean) => {
    if (isConversation) {
      onSelect({ id: item.id, user2Id: item.otherUserId, otherUserName: item.otherUserName || item.name, otherUserAvatar: item.otherUserAvatar || item.avatar, otherUsername: item.otherUsername } as any);
      return;
    }
    const otherId = item.otherUserId || item.user2Id;
    try {
      const { data } = await apiClient.post('/chat/conversations', { targetUserId: otherId });
      const conv = data.data;
      onSelect({ id: conv.id, user2Id: conv.otherUserId || otherId, otherUserName: conv.otherUserName || item.otherUserName, otherUserAvatar: conv.otherUserAvatar || item.otherUserAvatar, otherUsername: conv.otherUsername || item.otherUsername } as any);
    } catch (e) { console.error('Failed to open conversation:', e); }
  };

  if (sortedItems.length === 0) {
    return (
      <div className="rounded-2xl p-10 text-center"
        style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
        <div className="mx-auto mb-3 w-14 h-14 rounded-2xl flex items-center justify-center"
          style={{ background: 'color-mix(in srgb, var(--primary) 10%, var(--muted))' }}>
          <ChatCircle size={26} weight="light" style={{ color: 'var(--primary)', opacity: 0.5 }} />
        </div>
        <p className="font-semibold text-sm" style={{ color: 'var(--foreground)' }}>لا توجد محادثات بعد</p>
        <p className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>اقبل توافقاً لبدء المحادثة</p>
      </div>
    );
  }

  const getOtherUserName = (item: any) =>
    item.name || item.otherUserName || (item.user2Id ? `مستخدم ${item.user2Id.slice(0, 6)}` : 'محادثة');

  const getAvatar = (item: any) =>
    avatarSrc(item.avatar || item.otherUserAvatar || null);

  const getInitial = (item: any) =>
    getOtherUserName(item).charAt(0).toUpperCase();

  const hasMore = sortedItems.length >= page * PAGE_SIZE;
  const isActive = (item: any) => activeMatchId === item.id;

  return (
    <div className="space-y-1">
      {sortedItems.map((item: any) => {
        const active  = isActive(item);
        const src     = getAvatar(item);
        const initial = getInitial(item);
        const name    = getOtherUserName(item);
        const preview = item.lastMessage?.content?.slice(0, 40) || 'لا توجد رسائل بعد';
        const timeStr = timeLabel(item.lastMessage?.createdAt || item.createdAt);

        return (
          <button key={item.id}
            onClick={() => handleSelect(item, item._kind === 'conversation')}
            className="w-full flex items-center gap-3 rounded-2xl p-3 text-right transition-all hover:scale-[1.01]"
            style={active
              ? { background: 'color-mix(in srgb, var(--primary) 8%, var(--muted))', borderRight: '3px solid var(--primary)' }
              : { background: 'var(--card)', border: '1px solid transparent' }}>

            {/* Avatar */}
            <div className="h-11 w-11 shrink-0 rounded-full overflow-hidden flex items-center justify-center text-sm font-bold text-white"
              style={{ background: 'linear-gradient(135deg, var(--primary), var(--accent))', flexShrink: 0 }}>
              {src ? (
                <Image src={src} alt={name} width={44} height={44} className="w-full h-full object-cover" />
              ) : (
                <span>{initial}</span>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate"
                style={{ color: active ? 'var(--primary)' : 'var(--foreground)' }}>
                {name}
              </p>
              <p className="text-xs truncate mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
                {preview}
              </p>
            </div>

            {/* Meta */}
            <div className="shrink-0 flex flex-col items-end gap-1.5">
              <p className="text-[10px]" style={{ color: 'var(--muted-foreground)' }}>{timeStr}</p>
              {item.unreadCount ? (
                <span className="min-w-[18px] h-[18px] rounded-full flex items-center justify-center text-[10px] font-bold text-white px-1.5"
                  style={{ background: 'var(--accent)' }}>
                  {item.unreadCount > 99 ? '99+' : item.unreadCount}
                </span>
              ) : null}
            </div>
          </button>
        );
      })}

      {hasMore && (
        <button onClick={() => setPage((p) => p + 1)}
          className="w-full py-2.5 text-xs font-semibold text-center rounded-xl transition-all hover:scale-[1.01]"
          style={{ color: 'var(--primary)', background: 'color-mix(in srgb, var(--primary) 5%, var(--muted))' }}>
          تحميل المزيد
        </button>
      )}
    </div>
  );
};
