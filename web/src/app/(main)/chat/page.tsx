'use client';
import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { ChatList } from '@/features/chat/components/ChatList';
import { ChatWindow } from '@/features/chat/components/ChatWindow';
import { apiClient } from '@/lib/api-client';
import type { Match } from '@/types';
import { ChatCircle } from '@phosphor-icons/react';

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
      {/* Conversation list sidebar */}
      <div className={`${activeMatch ? 'hidden lg:block' : 'block'} w-full lg:w-80 shrink-0 flex flex-col gap-3`}>
        <h1 className="text-xl font-extrabold" style={{ color: 'var(--foreground)' }}>المحادثات</h1>
        <ChatList activeMatchId={activeMatch?.id} onSelect={setActiveMatch as any} />
      </div>

      {/* Chat window / placeholder */}
      <div className={`${activeMatch ? 'block' : 'hidden lg:block'} flex-1 min-w-0`}>
        {deepLinkError ? (
          <div className="flex h-full items-center justify-center rounded-2xl shadow-sm"
            style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
            <div className="text-center p-8 max-w-xs">
              <div className="mx-auto mb-4 w-14 h-14 rounded-2xl flex items-center justify-center"
                style={{ background: 'color-mix(in srgb, var(--destructive) 8%, var(--muted))' }}>
                <span className="text-2xl">⚠️</span>
              </div>
              <p className="text-sm font-semibold mb-1" style={{ color: 'var(--foreground)' }}>
                تعذّر فتح المحادثة
              </p>
              <p className="text-xs mb-5" style={{ color: 'var(--muted-foreground)' }}>{deepLinkError}</p>
              <button
                onClick={() => { setDeepLinkError(null); handledRef.current = null; }}
                className="rounded-xl px-5 py-2 text-sm font-bold text-white transition-all hover:scale-105 active:scale-95"
                style={{ background: 'linear-gradient(135deg, var(--primary), var(--secondary))' }}>
                إعادة المحاولة
              </button>
            </div>
          </div>
        ) : loading ? (
          <div className="flex h-full items-center justify-center rounded-2xl"
            style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
            <div className="text-center flex flex-col items-center gap-3">
              <div className="w-10 h-10 rounded-full border-2 border-transparent animate-spin"
                style={{ borderTopColor: 'var(--primary)', borderRightColor: 'var(--secondary)' }} />
              <p className="text-sm font-medium" style={{ color: 'var(--muted-foreground)' }}>
                جاري فتح المحادثة...
              </p>
            </div>
          </div>
        ) : activeMatch ? (
          <ChatWindow match={activeMatch as unknown as Match} onBack={() => setActiveMatch(null)} />
        ) : (
          <div className="flex h-full items-center justify-center rounded-2xl shadow-sm"
            style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
            <div className="text-center">
              <div className="mx-auto mb-4 w-16 h-16 rounded-2xl flex items-center justify-center"
                style={{ background: 'color-mix(in srgb, var(--primary) 8%, var(--muted))' }}>
                <ChatCircle size={30} weight="light" style={{ color: 'var(--primary)', opacity: 0.5 }} />
              </div>
              <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>اختر محادثة للبدء</p>
              <p className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>
                اختر محادثة من القائمة أو ابحث عن شخص
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
