'use client';
import { useState } from 'react';
import { ChatList } from '@/features/chat/components/ChatList';
import { ChatWindow } from '@/features/chat/components/ChatWindow';
import type { Match } from '@/types';

export default function ChatPage() {
  const [activeMatch, setActiveMatch] = useState<Match | null>(null);

  return (
    <div className="flex gap-4 h-[calc(100vh-8rem)]">
      {/* Sidebar — conversation list */}
      <div className={`${activeMatch ? 'hidden lg:block' : 'block'} w-full lg:w-80 shrink-0`}>
        <h1 className="mb-3 text-xl font-bold text-gray-900">المحادثات</h1>
        <ChatList activeMatchId={activeMatch?.id} onSelect={setActiveMatch} />
      </div>

      {/* Chat window */}
      <div className={`${activeMatch ? 'block' : 'hidden lg:block'} flex-1 min-w-0`}>
        {activeMatch ? (
          <ChatWindow match={activeMatch} onBack={() => setActiveMatch(null)} />
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
