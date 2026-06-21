'use client';
import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { ChatList } from '@/features/chat/components/ChatList';
import { ChatWindow } from '@/features/chat/components/ChatWindow';
import { apiClient } from '@/lib/api-client';
import type { Match } from '@/types';

interface DirectMatch extends Match {
  user2Id: string;
  score: number;
  otherUserName?: string | null;
  otherUserAvatar?: string | null;
}

export default function ChatPage() {
  const [activeMatch, setActiveMatch] = useState<DirectMatch | null>(null);
  const [loading, setLoading] = useState(false);
  const [deepLinkError, setDeepLinkError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const userId = searchParams?.get('user');
  const handledRef = useRef<string | null>(null);

  useEffect(() => {
    // Open/create a conversation when arriving with ?user=<id>.
    // POST /chat/conversations is idempotent (returns the existing 1:1 chat).
    if (!userId || handledRef.current === userId) return;
    handledRef.current = userId;
    setDeepLinkError(null);

    (async () => {
      setLoading(true);
      try {
        const response = await apiClient.post('/chat/conversations', { targetUserId: userId });
        const conv = response.data.data;
        setActiveMatch({
          id: conv.id,
          user1Id: '',
          user2Id: conv.otherUserId || userId,
          score: 0,
          status: 'chat',
          createdAt: conv.createdAt || new Date().toISOString(),
          otherUserName: conv.otherUserName ?? null,
          otherUserAvatar: conv.otherUserAvatar ?? null,
        });
      } catch (error: any) {
        console.error('Failed to create conversation:', error);
        handledRef.current = null;
        setDeepLinkError(error?.response?.data?.message || 'تعذّر فتح المحادثة. يرجى المحاولة مجدداً.');
      } finally {
        setLoading(false);
      }
    })();
  }, [userId]);

  return (
    <div className="flex gap-4 h-[calc(100dvh-8rem)]">
      <div className={`${activeMatch ? 'hidden lg:block' : 'block'} w-full lg:w-80 shrink-0`}>
        <h1 className="mb-4 text-xl font-bold text-[var(--foreground)]">المحادثات</h1>
        <ChatList activeMatchId={activeMatch?.id} onSelect={setActiveMatch as any} />
      </div>

      <div className={`${activeMatch ? 'block' : 'hidden lg:block'} flex-1 min-w-0`}>
        {deepLinkError ? (
          <div className="flex h-full items-center justify-center rounded-2xl bg-[var(--card)] border border-[var(--border)] shadow-lg shadow-black/5">
            <div className="text-center p-8">
              <p className="text-4xl mb-3">⚠️</p>
              <p className="text-sm font-medium text-[var(--primary)] mb-4">{deepLinkError}</p>
              <button
                onClick={() => { setDeepLinkError(null); handledRef.current = null; }}
                className="rounded-xl bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-black/10 hover:shadow-xl transition-all"
              >
                إعادة المحاولة
              </button>
            </div>
          </div>
        ) : loading ? (
          <div className="flex h-full items-center justify-center rounded-2xl bg-[var(--card)] border border-[var(--border)]">
            <div className="text-center">
              <svg className="animate-spin h-8 w-8 text-[var(--primary)] mx-auto mb-3" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              <p className="text-sm text-[var(--primary)]">جاري فتح المحادثة...</p>
            </div>
          </div>
        ) : activeMatch ? (
          <ChatWindow match={activeMatch as unknown as Match} onBack={() => setActiveMatch(null)} />
        ) : (
          <div className="flex h-full items-center justify-center rounded-2xl bg-[var(--card)] text-[var(--primary)]/50 shadow-lg shadow-black/5 border border-[var(--border)]">
            <div className="text-center">
              <p className="text-5xl mb-4">💬</p>
              <p className="text-sm font-medium text-[var(--primary)]">اختر محادثة للبدء</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}