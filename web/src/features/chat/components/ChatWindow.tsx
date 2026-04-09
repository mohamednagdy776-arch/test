'use client';
import { useEffect, useRef, useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { getSocket } from '@/lib/socket-client';
import type { Match } from '@/types';

interface Message {
  id: string;
  content: string;
  senderId?: string;
  timestamp: string;
  isOwn: boolean;
  type: string;
  mediaUrl?: string;
  replyToId?: string;
  isEdited?: boolean;
  editedAt?: string;
  isDeletedForEveryone?: boolean;
  isStarred?: boolean;
  reactions?: { emoji: string; userId: string }[];
}

interface Props {
  match: Match;
  onBack: () => void;
}

const EMOJI_REACTIONS = ['👍', '❤️', '😂', '😮', '😢', '🙏'];

export const ChatWindow = ({ match, onBack }: Props) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const [showReactions, setShowReactions] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { data } = useQuery({
    queryKey: ['messages', match.id],
    queryFn: () => apiClient.get(`/chat/conversations/${match.id}/messages`).then((r) => r.data),
    enabled: !!match.id,
  });

  useEffect(() => {
    if (data?.data) {
      setMessages(data.data.map((m: any) => ({
        id: m.id,
        content: m.content,
        senderId: m.senderId,
        timestamp: m.createdAt,
        isOwn: m.senderId === match.user2Id || m.senderId === match.user1Id,
        type: m.type || 'text',
        mediaUrl: m.mediaUrl,
        replyToId: m.replyToId,
        isEdited: m.isEdited,
        editedAt: m.editedAt,
        isDeletedForEveryone: m.isDeletedForEveryone,
        isStarred: m.isStarred,
        reactions: m.reactions,
      })));
    }
  }, [data, match.user2Id, match.user1Id]);

  useEffect(() => {
    const socket = getSocket();
    socket.emit('joinConversation', { conversationId: match.id, userId: match.user1Id });

    socket.on('newMessage', (msg: any) => {
      if (msg.conversationId === match.id) {
        setMessages((prev) => [...prev, {
          id: msg.id,
          content: msg.content,
          timestamp: msg.createdAt,
          isOwn: msg.senderId === match.user1Id,
          type: msg.type || 'text',
          mediaUrl: msg.mediaUrl,
          replyToId: msg.replyToId,
        }]);
      }
    });

    socket.on('userTyping', (data: { conversationId: string; userId: string; isTyping: boolean }) => {
      if (data.conversationId === match.id && data.userId !== match.user1Id) {
        setTypingUsers(prev => data.isTyping 
          ? [...prev.filter(id => id !== data.userId), data.userId]
          : prev.filter(id => id !== data.userId)
        );
      }
    });

    socket.on('messageSeen', (data: { conversationId: string; userId: string; messageId: string; seenAt: string }) => {
      if (data.conversationId === match.id) {
        setMessages(prev => prev.map(m => 
          m.id === data.messageId ? { ...m, seenAt: data.seenAt } : m
        ));
      }
    });

    return () => {
      socket.emit('leaveConversation', { conversationId: match.id });
      socket.off('newMessage');
      socket.off('userTyping');
      socket.off('messageSeen');
    };
  }, [match.id, match.user1Id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendTypingIndicator = useCallback(() => {
    const socket = getSocket();
    socket.emit('typing', { conversationId: match.id, userId: match.user1Id, isTyping: true });
    
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('typing', { conversationId: match.id, userId: match.user1Id, isTyping: false });
    }, 2000);
  }, [match.id, match.user1Id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    sendTypingIndicator();
  };

  const sendMessage = async () => {
    if (!input.trim() || sending) return;
    const content = input.trim();
    setInput('');
    setSending(true);

    const tempId = `temp-${Date.now()}`;
    setMessages((prev) => [...prev, {
      id: tempId,
      content,
      timestamp: new Date().toISOString(),
      isOwn: true,
      type: 'text',
      replyToId: replyTo?.id,
    }]);
    setReplyTo(null);

    try {
      const { data } = await apiClient.post('/chat/messages', {
        conversationId: match.id,
        content,
        type: 'text',
        replyToId: replyTo?.id,
      });
      
      setMessages((prev) => prev.map(m => 
        m.id === tempId ? { ...m, id: data.data.id } : m
      ));
      
      const socket = getSocket();
      socket.emit('sendMessage', {
        conversationId: match.id,
        senderId: match.user1Id,
        content,
        type: 'text',
        replyToId: replyTo?.id,
      });

      socket.emit('typing', { conversationId: match.id, userId: match.user1Id, isTyping: false });
    } catch {
      setMessages((prev) => prev.filter(m => m.id !== tempId));
    } finally {
      setSending(false);
    }
  };

  const handleReaction = async (messageId: string, emoji: string) => {
    try {
      await apiClient.post(`/chat/messages/${messageId}/reactions`, { emoji });
      setMessages(prev => prev.map(m => 
        m.id === messageId 
          ? { ...m, reactions: [...(m.reactions || []), { emoji, userId: match.user1Id }] }
          : m
      ));
      const socket = getSocket();
      socket.emit('addReaction', { messageId, userId: match.user1Id, emoji });
    } catch (e) { console.error(e); }
    setShowReactions(null);
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
  };

  const getReplyMessage = (replyToId: string) => messages.find(m => m.id === replyToId);

  return (
    <div className="flex flex-col h-full rounded-xl bg-white shadow-sm overflow-hidden">
      <div className="flex items-center gap-3 border-b px-4 py-3 shrink-0">
        <button onClick={onBack} className="lg:hidden text-gray-400 hover:text-gray-600 text-lg">←</button>
        <div className="h-9 w-9 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm overflow-hidden">
          {match.otherUserAvatar ? (
            <img src={match.otherUserAvatar} alt="" className="w-full h-full object-cover" />
          ) : (
            (match.otherUserName || match.user2Id || 'U').charAt(0).toUpperCase()
          )}
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-900">
            {match.otherUserName || `مستخدم ${match.user2Id?.slice(0, 8)}`}
          </p>
          <p className="text-xs text-green-500">متصل</p>
        </div>
        <div className="mr-auto flex items-center gap-2">
          <button className="p-2 hover:bg-gray-100 rounded-full" title="مكالمة صوتية">📞</button>
          <button className="p-2 hover:bg-gray-100 rounded-full" title="مكالمة فيديو">📹</button>
          <button className="p-2 hover:bg-gray-100 rounded-full" title="مزيد من الخيارات">⋮</button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <div className="flex h-full items-center justify-center text-gray-300 text-sm">
            ابدأ المحادثة الآن 👋
          </div>
        )}
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.isOwn ? 'justify-start' : 'justify-end'}`}>
            <div className={`relative max-w-xs lg:max-w-md rounded-2xl px-4 py-2.5 text-sm ${
              msg.isOwn ? 'bg-primary text-white rounded-br-sm' : 'bg-gray-100 text-gray-800 rounded-bl-sm'
            }`}>
              {replyTo && msg.replyToId && (
                <div className={`mb-2 p-2 rounded-lg text-xs ${msg.isOwn ? 'bg-blue-600/30' : 'bg-gray-200'}`}>
                  <span className="opacity-70">↩️ رد على: </span>
                  {getReplyMessage(msg.replyToId)?.content?.slice(0, 30)}...
                </div>
              )}
              {msg.isDeletedForEveryone ? (
                <span className="italic opacity-50">تم حذف الرسالة</span>
              ) : (
                <>
                  <p className="leading-relaxed">{msg.content}</p>
                  {msg.isEdited && <span className="text-xs opacity-60">(تم التعديل)</span>}
                </>
              )}
              <div className={`mt-1 flex items-center justify-between gap-2 text-xs ${msg.isOwn ? 'text-blue-200' : 'text-gray-400'}`}>
                <span>{formatTime(msg.timestamp)}</span>
                {msg.isOwn && <span>✓✓</span>}
              </div>
              {msg.reactions && msg.reactions.length > 0 && (
                <div className="absolute -bottom-2 flex gap-1">
                  {msg.reactions.map((r, i) => (
                    <span key={i} className="bg-white rounded-full px-1.5 py-0.5 text-xs shadow">{r.emoji}</span>
                  ))}
                </div>
              )}
              <button
                onClick={() => setShowReactions(showReactions === msg.id ? null : msg.id)}
                className={`absolute top-1/2 -translate-y-1/2 ${msg.isOwn ? 'left-full ml-2' : 'right-full mr-2'} opacity-0 hover:opacity-100 group-hover:opacity-100`}
              >
                😀
              </button>
              {showReactions === msg.id && (
                <div className={`absolute ${msg.isOwn ? 'left-full ml-2' : 'right-full mr-2'} top-0 bg-white rounded-full shadow-lg p-1 flex gap-1`}>
                  {EMOJI_REACTIONS.map(emoji => (
                    <button key={emoji} onClick={() => handleReaction(msg.id, emoji)} className="hover:scale-125 transition-transform">{emoji}</button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {typingUsers.length > 0 && (
          <div className="text-xs text-gray-400 animate-pulse">
            جاري الكتابة...
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {replyTo && (
        <div className="flex items-center gap-2 px-4 py-2 border-t bg-gray-50">
          <span className="text-xs text-gray-500">رد على: {replyTo.content?.slice(0, 30)}...</span>
          <button onClick={() => setReplyTo(null)} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>
      )}

      <div className="border-t p-3 shrink-0">
        <div className="flex items-end gap-2">
          <button className="p-2 text-gray-400 hover:text-primary">📎</button>
          <button className="p-2 text-gray-400 hover:text-primary">📷</button>
          <textarea
            value={input}
            onChange={handleInputChange}
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