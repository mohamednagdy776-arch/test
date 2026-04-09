'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
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
  activeConversationId?: string;
  onSelect: (match: Match) => void;
  onCreateGroup: () => void;
}

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
    !search || (c.name || '').toLowerCase().includes(search.toLowerCase())
  );

  const handleStartChat = async (userId: string) => {
    try {
      const { data } = await apiClient.post('/chat/messages', {
        conversationId: userId,
        content: '',
      });
      onSelect({ id: data.conversationId, user1Id: '', user2Id: userId, score: 0, status: 'chat', createdAt: '' } as Match);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="w-72 shrink-0 border-l flex flex-col bg-gray-50">
      <div className="p-4 border-b bg-white">
        <h2 className="font-bold text-gray-900 mb-3">المحادثات</h2>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="🔍 بحث في المحادثات..."
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary focus:outline-none"
        />
      </div>

      <div className="flex border-b bg-white">
        {[
          { key: 'chats' as const, label: 'المحادثات' },
          { key: 'requests' as const, label: 'طلبات' },
          { key: 'search' as const, label: 'بحث' },
        ].map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex-1 py-2.5 text-xs font-medium transition-colors ${
              tab === t.key ? 'border-b-2 border-primary text-primary' : 'text-gray-500'
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto">
        {tab === 'chats' ? (
          convLoading ? (
            <div className="p-4 space-y-2">
              {[1,2,3].map((i) => <div key={i} className="h-14 rounded-lg bg-gray-200 animate-pulse" />)}
            </div>
          ) : filteredConvos.length === 0 ? (
            <div className="p-6 text-center text-gray-400 text-sm">
              <p className="text-2xl mb-2">💬</p>
              {search ? 'لا نتائج' : 'لا توجد محادثات بعد'}
              {!search && (
                <button onClick={onCreateGroup} className="mt-2 text-primary hover:underline">
                  + أنشئ مجموعة جديدة
                </button>
              )}
            </div>
          ) : (
            filteredConvos.map((conv) => (
              <button key={conv.id} onClick={() => onSelect({ id: conv.id, user1Id: '', user2Id: '', score: 0, status: 'chat', createdAt: conv.createdAt } as Match)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-right hover:bg-white transition-colors border-b border-gray-100 ${
                  activeConversationId === conv.id ? 'bg-primary/5 border-r-2 border-r-primary' : ''
                }`}>
                <div className="h-10 w-10 shrink-0 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm overflow-hidden">
                  {conv.avatar ? (
                    <img src={conv.avatar} alt="" className="w-full h-full object-cover" />
                  ) : conv.isGroup ? (
                    '👥'
                  ) : (
                    (conv.name || 'U').charAt(0).toUpperCase()
                  )}
                </div>
                <div className="flex-1 min-w-0 text-right">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {conv.name || 'محادثة'}
                  </p>
                  <p className="text-xs text-gray-400 truncate">
                    {conv.lastMessage?.content?.slice(0, 30) || 'لا توجد رسائل بعد'}
                  </p>
                </div>
                {conv.unreadCount ? (
                  <span className="bg-primary text-white text-xs rounded-full px-2 py-0.5">
                    {conv.unreadCount}
                  </span>
                ) : null}
              </button>
            ))
          )
        ) : tab === 'requests' ? (
          <div className="p-6 text-center text-gray-400 text-sm">
            <p className="text-2xl mb-2">📥</p>
            <p>لا توجد طلبات رسائل</p>
            <p className="text-xs mt-1">الرسائل من غير الأصدقاء تظهر هنا</p>
          </div>
        ) : (
          <div>
            <p className="px-4 py-2 text-xs text-gray-400 bg-yellow-50 border-b border-yellow-100">
              💡 يمكنك التواصل فقط مع من قبلت توافقهم
            </p>
            {usersLoading ? (
              <div className="p-4 space-y-2">
                {[1,2,3].map((i) => <div key={i} className="h-14 rounded-lg bg-gray-200 animate-pulse" />)}
              </div>
            ) : (
              (usersData?.data ?? []).map((u: any) => {
                const existingMatch = matches.find(
                  (m) => m.user2Id === u.id || m.user1Id === u.id
                );
                return (
                  <div key={u.id} className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
                    <div className="h-10 w-10 shrink-0 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold text-sm">
                      {u.email?.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{u.email}</p>
                      <p className="text-xs text-gray-400 capitalize">{u.accountType}</p>
                    </div>
                    {existingMatch ? (
                      <button onClick={() => onSelect(existingMatch)}
                        className="shrink-0 rounded-lg bg-primary px-3 py-1 text-xs text-white hover:bg-blue-700">
                        فتح
                      </button>
                    ) : (
                      <button onClick={() => handleStartChat(u.id)}
                        className="shrink-0 rounded-lg bg-green-500 px-3 py-1 text-xs text-white hover:bg-green-600">
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