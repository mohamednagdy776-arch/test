'use client';
import { ChatList } from '@/features/chat/components/ChatList';

export default function ChatPage() {
  return (
    <div>
      <h1 className="mb-4 text-xl font-bold text-gray-900">المحادثات</h1>
      <ChatList />
    </div>
  );
}
