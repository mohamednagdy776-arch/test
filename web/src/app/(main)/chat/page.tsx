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
  const searchParams = useSearchParams();
  const userId = searchParams?.get('user');
  const handledRef = useRef<string | null>(null);

  useEffect(() => {
    // Open/create a conversation when arriving with ?user=<id>.
    // POST /chat/conversations is idempotent (returns the existing 1:1 chat).
    if (!userId || handledRef.current === userId) return;
    handledRef.current = userId;

    (async () => {
      setLoading(true);
      try {
        const response = await apiClient.post('/chat/conversations', { targetUserId: userId });
        const conv = response.data.data;
        setActiveMatch({
          id: conv.id,                              // real conversation id
          user1Id: '',
          user2Id: conv.otherUserId || userId,
          score: 0,
          status: 'chat',
          createdAt: conv.createdAt || new Date().toISOString(),
          otherUserName: conv.otherUserName ?? null,
          otherUserAvatar: conv.otherUserAvatar ?? null,
        });
      } catch (error) {
        console.error('Failed to create conversation:', error);
        handledRef.current = null; // allow retry on next navigation
      } finally {
        setLoading(false);
      }
    })();
  }, [userId]);

  return (
    <div className="flex gap-4 h-[calc(100vh-8rem)]">
      <div className={`${activeMatch ? 'hidden lg:block' : 'block'} w-full lg:w-80 shrink-0`}>
        <h1 className="mb-4 text-xl font-bold text-emerald-900">المحادثات</h1>
        <ChatList activeMatchId={activeMatch?.id} onSelect={setActiveMatch as any} />
      </div>

      <div className={`${activeMatch ? 'block' : 'hidden lg:block'} flex-1 min-w-0`}>
        {activeMatch ? (
          <ChatWindow match={activeMatch as unknown as Match} onBack={() => setActiveMatch(null)} />
        ) : (
          <div className="flex h-full items-center justify-center rounded-2xl bg-gradient-to-br from-[#ECFDF5] to-[#F0FDF4] text-emerald-600/50 shadow-lg shadow-emerald-500/10 border border-emerald-100">
            <div className="text-center">
              <p className="text-5xl mb-4">💬</p>
              <p className="text-sm font-medium text-emerald-700">اختر محادثة للبدء</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}