'use client';
import Image from 'next/image';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type { Match } from '@/types';
import { MagnifyingGlass, ChatCircle, Tray, Users, Plus } from '@phosphor-icons/react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || '';

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
  activeConversationId?: string;
  onSelect: (match: Match) => void;
  onCreateGroup: () => void;
}

function avatarSrc(url?: string | null) {
  if (!url) return null;
  return url.startsWith('http') ? url : `${API_BASE}${url}`;
}

const TABS = [
  { key: 'chats'    as const, label: 'المحادثات', Icon: ChatCircle },
  { key: 'requests' as const, label: 'طلبات',     Icon: Tray },
  { key: 'search'   as const, label: 'بحث',       Icon: MagnifyingGlass },
];

export const ChatSidebar = ({ activeConversationId, onSelect, onCreateGroup }: Props) => {
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<'chats' | 'requests' | 'search'>('chats');

  const { data: convData, isLoading: convLoading } = useQuery({
    queryKey: ['conversations'],
    queryFn: () => apiClient.get('/chat/conversations').then((r) => r.data),
  });

  const { data: matchData } = useQuery({
    queryKey: ['chat-matches'],
    queryFn: () => apiClient.get('/matches', { params: { page: 1, limit: 50 } }).then((r) => r.data),
  });

  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ['users-search', search],
    queryFn: () => apiClient.get('/users', { params: { page: 1, limit: 20 } }).then((r) => r.data),
    enabled: tab === 'search',
  });

  const conversations: Conversation[] = convData?.data || [];
  const matches: Match[] = matchData?.data?.filter((m: Match) => m.status === 'accepted' || m.status === 'chat') || [];
  const filteredConvos = conversations.filter(c =>
    !search || (c.name || '').toLowerCase().includes(search.toLowerCase()),
  );

  const handleStartChat = async (userId: string) => {
    try {
      const { data } = await apiClient.post('/chat/conversations', { targetUserId: userId });
      const conv = data.data;
      onSelect({ id: conv.id, user1Id: '', user2Id: userId, score: 0, status: 'chat', createdAt: '' } as Match);
    } catch (e) { console.error(e); }
  };

  return (
    <div className="w-72 shrink-0 flex flex-col" style={{ borderLeft: '1px solid var(--border)', background: 'var(--card)' }}>
      {/* Header + Search */}
      <div className="p-4" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-sm" style={{ color: 'var(--foreground)' }}>المحادثات</h2>
          <button onClick={onCreateGroup}
            className="flex items-center justify-center w-7 h-7 rounded-xl transition-all hover:scale-110"
            style={{ background: 'color-mix(in srgb, var(--primary) 10%, var(--muted))', color: 'var(--primary)' }}>
            <Plus size={14} />
          </button>
        </div>
        <div className="relative">
          <MagnifyingGlass size={13} className="absolute right-3 top-1/2 -translate-y-1/2"
            style={{ color: 'var(--muted-foreground)', pointerEvents: 'none' }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="بحث في المحادثات..."
            className="w-full rounded-xl pr-8 pl-3 py-2 text-xs transition-all focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
            style={{ background: 'var(--background)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex" style={{ borderBottom: '1px solid var(--border)' }}>
        {TABS.map(({ key, label, Icon }) => {
          const active = tab === key;
          return (
            <button key={key} onClick={() => setTab(key)}
              className="flex-1 flex flex-col items-center gap-0.5 py-2.5 text-[11px] font-semibold transition-all"
              style={active
                ? { color: 'var(--accent)', borderBottom: '2px solid var(--accent)' }
                : { color: 'var(--muted-foreground)', borderBottom: '2px solid transparent' }}>
              <Icon size={14} weight={active ? 'fill' : 'regular'} />
              {label}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto">
        {tab === 'chats' ? (
          convLoading ? (
            <div className="p-3 space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-14 rounded-xl animate-pulse" style={{ background: 'var(--muted)' }} />
              ))}
            </div>
          ) : filteredConvos.length === 0 ? (
            <div className="p-6 text-center">
              <ChatCircle size={28} weight="light" className="mx-auto mb-2"
                style={{ color: 'var(--muted-foreground)', opacity: 0.5 }} />
              <p className="text-sm font-medium" style={{ color: 'var(--muted-foreground)' }}>
                {search ? 'لا نتائج' : 'لا توجد محادثات بعد'}
              </p>
              {!search && (
                <button onClick={onCreateGroup}
                  className="mt-2 text-xs font-semibold hover:underline"
                  style={{ color: 'var(--primary)' }}>
                  + أنشئ مجموعة جديدة
                </button>
              )}
            </div>
          ) : (
            filteredConvos.map((conv) => {
              const isActive = activeConversationId === conv.id;
              const src = avatarSrc(conv.avatar);
              const initial = (conv.name || 'م').charAt(0).toUpperCase();
              return (
                <button key={conv.id}
                  onClick={() => onSelect({ id: conv.id, user1Id: '', user2Id: '', score: 0, status: 'chat', createdAt: conv.createdAt } as Match)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-right transition-all"
                  style={isActive
                    ? { background: 'color-mix(in srgb, var(--primary) 6%, var(--muted))', borderRight: '3px solid var(--primary)' }
                    : { borderBottom: '1px solid var(--border)' }}
                  onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = 'var(--muted)'; }}
                  onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}>

                  <div className="h-10 w-10 shrink-0 rounded-full overflow-hidden flex items-center justify-center text-sm font-bold text-white"
                    style={{ background: 'linear-gradient(135deg, var(--primary), var(--accent))' }}>
                    {src ? (
                      <Image src={src} alt={conv.name} width={40} height={40} className="w-full h-full object-cover" />
                    ) : conv.isGroup ? (
                      <Users size={16} />
                    ) : (
                      <span>{initial}</span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0 text-right">
                    <p className="text-sm font-medium truncate"
                      style={{ color: isActive ? 'var(--primary)' : 'var(--foreground)' }}>
                      {conv.name || 'محادثة'}
                    </p>
                    <p className="text-xs truncate" style={{ color: 'var(--muted-foreground)' }}>
                      {conv.lastMessage?.content?.slice(0, 30) || 'لا توجد رسائل بعد'}
                    </p>
                  </div>

                  {conv.unreadCount ? (
                    <span className="min-w-[18px] h-[18px] rounded-full flex items-center justify-center text-[10px] font-bold text-white px-1"
                      style={{ background: 'var(--accent)' }}>
                      {conv.unreadCount > 99 ? '99+' : conv.unreadCount}
                    </span>
                  ) : null}
                </button>
              );
            })
          )
        ) : tab === 'requests' ? (
          <div className="p-6 text-center">
            <Tray size={28} weight="light" className="mx-auto mb-2"
              style={{ color: 'var(--muted-foreground)', opacity: 0.5 }} />
            <p className="text-sm font-medium" style={{ color: 'var(--muted-foreground)' }}>لا توجد طلبات رسائل</p>
            <p className="text-xs mt-1" style={{ color: 'var(--muted-foreground)', opacity: 0.7 }}>
              الرسائل من غير الأصدقاء تظهر هنا
            </p>
          </div>
        ) : (
          <div>
            <div className="px-4 py-2.5 text-xs flex items-start gap-2"
              style={{
                background: 'color-mix(in srgb, var(--accent) 8%, var(--muted))',
                borderBottom: '1px solid color-mix(in srgb, var(--accent) 15%, var(--border))',
              }}>
              <span style={{ color: 'var(--accent)' }}>💡</span>
              <span style={{ color: 'var(--muted-foreground)' }}>يمكنك التواصل فقط مع من قبلت توافقهم</span>
            </div>

            {usersLoading ? (
              <div className="p-3 space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-14 rounded-xl animate-pulse" style={{ background: 'var(--muted)' }} />
                ))}
              </div>
            ) : (
              (usersData?.data ?? []).map((u: any) => {
                const existingMatch = matches.find((m) => m.user2Id === u.id || m.user1Id === u.id);
                const initial = (u.email || 'م').charAt(0).toUpperCase();
                return (
                  <div key={u.id} className="flex items-center gap-3 px-4 py-3"
                    style={{ borderBottom: '1px solid var(--border)' }}>
                    <div className="h-10 w-10 shrink-0 rounded-full flex items-center justify-center text-sm font-bold text-white"
                      style={{ background: 'linear-gradient(135deg, var(--primary), var(--secondary))' }}>
                      {initial}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: 'var(--foreground)' }}>{u.email}</p>
                      <p className="text-xs capitalize" style={{ color: 'var(--muted-foreground)' }}>{u.accountType}</p>
                    </div>
                    {existingMatch ? (
                      <button onClick={() => onSelect(existingMatch)}
                        className="shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold text-white transition-all hover:scale-105"
                        style={{ background: 'linear-gradient(135deg, var(--primary), var(--secondary))' }}>
                        فتح
                      </button>
                    ) : (
                      <button onClick={() => handleStartChat(u.id)}
                        className="shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold transition-all hover:scale-105"
                        style={{ background: 'color-mix(in srgb, var(--primary) 10%, var(--muted))', color: 'var(--primary)' }}>
                        بدء
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
};
