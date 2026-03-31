'use client';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { ChatList } from '@/features/chat/components/ChatList';
import { ChatWindow } from '@/features/chat/components/ChatWindow';
import { apiClient } from '@/lib/api-client';
import type { Match } from '@/types';

// Extended Match type for direct conversations (without going through match flow)
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
  const conversationId = searchParams?.get('conversation');
  const userId = searchParams?.get('user');

  // Auto-open conversation from query params - call API to get real matchId
  useEffect(() => {
    const createConversation = async () => {
      if (!conversationId || !userId || loading) return;
      setLoading(true);
      try {
        // Call API to create/get real match with UUID
        const response = await apiClient.post('/chat/conversations', { targetUserId: userId });
        const { matchId } = response.data.data;
        
        // Fetch the other user's profile to get their name
        let otherUserName: string | null = null;
        let otherUserAvatar: string | null = null;
        try {
          const profileRes = await apiClient.get(`/matches/profile/${userId}`);
          otherUserName = profileRes.data?.data?.user?.firstName || profileRes.data?.data?.user?.fullName || null;
          otherUserAvatar = profileRes.data?.data?.user?.avatarUrl || null;
        } catch {
          // Profile fetch failed, continue without name
        }
        
        // Create match object with real UUID and user data
        const mockMatch: DirectMatch = {
          id: matchId,
          user1Id: '',
          user2Id: userId,
          score: 0,
          status: 'chat',
          createdAt: new Date().toISOString(),
          otherUserName,
          otherUserAvatar,
        };
        setActiveMatch(mockMatch);
      } catch (error) {
        console.error('Failed to create conversation:', error);
      } finally {
        setLoading(false);
      }
    };
    
    if (conversationId && userId) {
      createConversation();
    }
  }, [conversationId, userId, loading]);

  return (
    <div className="flex gap-4 h-[calc(100vh-8rem)]">
      {/* Sidebar — conversation list */}
      <div className={`${activeMatch ? 'hidden lg:block' : 'block'} w-full lg:w-80 shrink-0`}>
        <h1 className="mb-3 text-xl font-bold text-gray-900">المحادثات</h1>
        <ChatList activeMatchId={activeMatch?.id} onSelect={setActiveMatch as any} />
      </div>

      {/* Chat window */}
      <div className={`${activeMatch ? 'block' : 'hidden lg:block'} flex-1 min-w-0`}>
        {activeMatch ? (
          <ChatWindow match={activeMatch as unknown as Match} onBack={() => setActiveMatch(null)} />
        ) : (
          <div className="flex h-full items-center justify-center rounded-xl bg-white text-gray-400">
            <div className="text-center">
              <p className="text-4xl mb-3">💬</p>
              <p className="text-sm">اختر محادثة للبدء</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
