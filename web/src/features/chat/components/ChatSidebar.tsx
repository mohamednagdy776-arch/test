'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type { Match } from '@/types';

interface Props {
  activeMatchId?: string;
  onSelect: (match: Match) => void;
}

export const ChatSidebar = ({ activeMatchId, onSelect }: Props) => {
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<'chats' | 'search'>('chats');

  const { data, isLoading } = useQuery({
    queryKey: ['chat-matches'],
    queryFn: () => apiClient.get('/matches', { params: { page: 1, limit: 50 } }).then((r) => r.data),
  });

  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ['users-search', search],
    queryFn: () => apiClient.get('/users', { params: { page: 1, limit: 20 } }).then((r) => r.data),
    enabled: tab === 'search',
  });

  const accepted: Match[] = (data?.data ?? []).filter((m: Match) => m.status === 'accepted');
  const filtered = accepted.filter((m) =>
    !search || m.user2Id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="w-72 shrink-0 border-l flex flex-col bg-gray-50">
      {/* Header */}
      <div className="p-4 border-b bg-white">
        <h2 className="font-bold text-gray-900 mb-3">المحادثات</h2>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="🔍 بحث..."
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary focus:outline-none"
        />
      </div>

      {/* Tabs */}
      <div className="flex border-b bg-white">
        {(['chats', 'search'] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex-1 py-2.5 text-xs font-medium transition-colors ${
              tab === t ? 'border-b-2 border-primary text-primary' : 'text-gray-500'
            }`}>
            {t === 'chats' ? '💬 محادثاتي' : '🔍 بحث عن مستخدم'}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {tab === 'chats' ? (
          isLoading ? (
            <div className="p-4 space-y-2">
              {[1,2,3].map((i) => <div key={i} className="h-14 rounded-lg bg-gray-200 animate-pulse" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-6 text-center text-gray-400 text-sm">
              <p className="text-2xl mb-2">💬</p>
              {search ? 'لا نتائج' : 'لا توجد محادثات بعد'}
              {!search && <p className="text-xs mt-1">اقبل توافقاً من صفحة التوافق</p>}
            </div>
          ) : (
            filtered.map((m) => (
              <button key={m.id} onClick={() => onSelect(m)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-right hover:bg-white transition-colors border-b border-gray-100 ${
                  activeMatchId === m.id ? 'bg-primary/5 border-r-2 border-r-primary' : ''
                }`}>
                <div className="h-10 w-10 shrink-0 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
                  {m.user2Id?.slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0 text-right">
                  <p className="text-sm font-medium text-gray-900 truncate font-mono">
                    {m.user2Id?.slice(0, 12)}…
                  </p>
                  <p className="text-xs text-gray-400">
                    توافق {m.score}% · {new Date(m.createdAt).toLocaleDateString('ar-EG')}
                  </p>
                </div>
              </button>
            ))
          )
        ) : (
          // Search tab — show all users
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
                const existingMatch = accepted.find(
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
                      <span className="shrink-0 text-xs text-gray-400">لا توافق</span>
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
