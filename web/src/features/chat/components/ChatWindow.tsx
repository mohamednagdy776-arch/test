'use client';
import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { getSocket } from '@/lib/socket-client';
import type { Match } from '@/types';

interface Message {
  id?: string;
  content: string;
  senderId?: string;
  timestamp: string;
  isOwn: boolean;
}

interface Props {
  match: Match;
  onBack: () => void;
}

export const ChatWindow = ({ match, onBack }: Props) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Load message history
  const { data } = useQuery({
    queryKey: ['messages', match.id],
    queryFn: () => apiClient.get(`/chat/${match.id}/messages`).then((r) => r.data),
  });

  useEffect(() => {
    if (data?.data) {
      setMessages(data.data.map((m: any) => ({
        id: m.id,
        content: m.content,
        senderId: m.senderId,
        timestamp: m.createdAt,
        isOwn: m.isOwn,
      })));
    }
  }, [data]);

  // Socket.IO real-time
  useEffect(() => {
    const socket = getSocket();
    socket.emit('joinMatch', match.id);

    socket.on('newMessage', (msg: { content: string; timestamp: string; senderId?: string }) => {
      setMessages((prev) => [...prev, {
        content: msg.content,
        timestamp: msg.timestamp,
        isOwn: false,
      }]);
    });

    return () => { socket.off('newMessage'); };
  }, [match.id]);

  // Auto-scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || sending) return;
    const content = input.trim();
    setInput('');
    setSending(true);

    // Optimistic update
    setMessages((prev) => [...prev, {
      content,
      timestamp: new Date().toISOString(),
      isOwn: true,
    }]);

    try {
      // Send via REST (persists) + socket broadcasts to other user
      await apiClient.post('/chat/messages', { matchId: match.id, content });
      const socket = getSocket();
      socket.emit('sendMessage', { matchId: match.id, encryptedContent: content });
    } catch {
      // Remove optimistic message on failure
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setSending(false);
    }
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  return (
    <div className="flex flex-col h-full rounded-xl bg-white shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 border-b px-4 py-3 shrink-0">
        <button onClick={onBack} className="lg:hidden text-gray-400 hover:text-gray-600 text-lg">←</button>
        <div className="h-9 w-9 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
          {match.user2Id?.slice(0, 2).toUpperCase()}
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-900">مستخدم {match.user2Id?.slice(0, 8)}</p>
          <p className="text-xs text-green-500">متصل</p>
        </div>
        <div className="mr-auto">
          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            توافق {match.score}%
          </span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <div className="flex h-full items-center justify-center text-gray-300 text-sm">
            ابدأ المحادثة الآن 👋
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.isOwn ? 'justify-start' : 'justify-end'}`}>
            <div className={`max-w-xs lg:max-w-md rounded-2xl px-4 py-2.5 text-sm ${
              msg.isOwn
                ? 'bg-primary text-white rounded-br-sm'
                : 'bg-gray-100 text-gray-800 rounded-bl-sm'
            }`}>
              <p className="leading-relaxed">{msg.content}</p>
              <p className={`mt-1 text-xs ${msg.isOwn ? 'text-blue-200' : 'text-gray-400'}`}>
                {new Date(msg.timestamp).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t p-3 shrink-0">
        <div className="flex items-end gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="اكتب رسالة..."
            rows={1}
            className="flex-1 resize-none rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary max-h-32"
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || sending}
            className="h-10 w-10 shrink-0 rounded-xl bg-primary text-white flex items-center justify-center hover:bg-blue-700 disabled:opacity-40 transition-colors"
          >
            {sending ? '…' : '➤'}
          </button>
        </div>
        <p className="mt-1 text-xs text-gray-300 text-center">Enter للإرسال · Shift+Enter لسطر جديد</p>
      </div>
    </div>
  );
};
