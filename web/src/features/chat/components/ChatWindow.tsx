'use client';
import Image from 'next/image';
import { useEffect, useRef, useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { getSocket, getCurrentUserId } from '@/lib/socket-client';
import { useDeleteMessage } from '@/features/chat/hooks';
import { postsApi } from '@/features/posts/api';
import type { Match } from '@/types';
import {
  ArrowLeft, Phone, VideoCamera, DotsThreeVertical,
  PaperPlaneTilt, Image as ImageIcon, Smiley, Trash, ArrowBendUpLeft,
} from '@phosphor-icons/react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || '';

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

function avatarSrc(url?: string | null) {
  if (!url) return null;
  return url.startsWith('http') ? url : `${API_BASE}${url}`;
}

export const ChatWindow = ({ match, onBack }: Props) => {
  const myUserId = getCurrentUserId();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const [showReactions, setShowReactions] = useState<string | null>(null);
  const [hoveredMsgId, setHoveredMsgId] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const deleteMessage = useDeleteMessage();
  const [isOnline, setIsOnline] = useState(false);
  const [callToast, setCallToast] = useState<string | null>(null);
  const [otherSeenAt, setOtherSeenAt] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const { data, isLoading: messagesLoading } = useQuery({
    queryKey: ['messages', match.id],
    queryFn: () => apiClient.get(`/chat/conversations/${match.id}/messages`).then((r) => r.data),
    enabled: !!match.id,
  });

  useEffect(() => {
    const list: any[] = Array.isArray(data?.data?.data)
      ? data.data.data
      : Array.isArray(data?.data)
        ? data.data
        : [];
    setMessages(list.map((m: any) => ({
      id: m.id,
      content: m.content,
      senderId: m.senderId,
      timestamp: m.createdAt,
      isOwn: m.senderId === myUserId,
      type: m.type || 'text',
      mediaUrl: m.mediaUrl,
      replyToId: m.replyToId,
      isEdited: m.isEdited,
      editedAt: m.editedAt,
      isDeletedForEveryone: m.isDeletedForEveryone,
      isStarred: m.isStarred,
      reactions: m.reactions,
    })));
  }, [data, myUserId]);

  const markSeen = useCallback(() => {
    if (!match.id) return;
    getSocket().emit('markSeen', { conversationId: match.id, userId: myUserId, messageId: null });
  }, [match.id, myUserId]);

  useEffect(() => {
    if (!match.id) return;
    const socket = getSocket();
    socket.emit('joinConversation', { conversationId: match.id, userId: myUserId });

    setOtherSeenAt(null);
    setIsOnline(false);
    if (match.user2Id) {
      socket.emit('getPresence', { userId: match.user2Id }, (res: any) => {
        if (res && res.userId === match.user2Id) setIsOnline(!!res.online);
      });
    }
    const onPresence = (p: { userId: string; online: boolean }) => {
      if (p.userId === match.user2Id) setIsOnline(p.online);
    };
    socket.on('presence', onPresence);

    socket.on('newMessage', (msg: any) => {
      if (msg.conversationId !== match.id) return;
      setMessages((prev) => {
        if (msg.senderId === myUserId) return prev;
        if (prev.some(m => m.id === msg.id)) return prev;
        return [...prev, {
          id: msg.id, content: msg.content, senderId: msg.senderId,
          timestamp: msg.createdAt, isOwn: false, type: msg.type || 'text',
          mediaUrl: msg.mediaUrl, replyToId: msg.replyToId,
        }];
      });
      markSeen();
    });

    socket.on('userTyping', (d: { conversationId: string; userId: string; isTyping: boolean }) => {
      if (d.conversationId === match.id && d.userId !== myUserId) {
        setTypingUsers(prev => d.isTyping
          ? [...prev.filter(id => id !== d.userId), d.userId]
          : prev.filter(id => id !== d.userId));
      }
    });

    socket.on('messageSeen', (d: { conversationId: string; userId: string; seenAt: string }) => {
      if (d.conversationId === match.id && d.userId === match.user2Id) {
        setOtherSeenAt(d.seenAt || new Date().toISOString());
      }
    });

    return () => {
      socket.emit('leaveConversation', { conversationId: match.id });
      socket.off('presence', onPresence);
      socket.off('newMessage');
      socket.off('userTyping');
      socket.off('messageSeen');
    };
  }, [match.id, myUserId, match.user2Id, markSeen]);

  useEffect(() => {
    if (messages.length === 0) return;
    const last = messages[messages.length - 1];
    if (last && !last.isOwn) markSeen();
  }, [messages, markSeen]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendTypingIndicator = useCallback(() => {
    const socket = getSocket();
    socket.emit('typing', { conversationId: match.id, userId: myUserId, isTyping: true });
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('typing', { conversationId: match.id, userId: myUserId, isTyping: false });
    }, 2000);
  }, [match.id, myUserId]);

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
    const replyId = replyTo?.id;
    setMessages((prev) => [...prev, {
      id: tempId, content, senderId: myUserId ?? undefined,
      timestamp: new Date().toISOString(), isOwn: true, type: 'text', replyToId: replyId,
    }]);
    setReplyTo(null);

    try {
      const { data } = await apiClient.post('/chat/messages', {
        conversationId: match.id, content, type: 'text', replyToId: replyId,
      });
      const saved = data.data;
      setMessages((prev) => prev.map(m => m.id === tempId ? { ...m, id: saved.id } : m));

      const socket = getSocket();
      socket.emit('relayMessage', {
        conversationId: match.id,
        message: { id: saved.id, content, senderId: myUserId, type: 'text', replyToId: replyId, createdAt: saved.createdAt ?? new Date().toISOString() },
      });
      socket.emit('typing', { conversationId: match.id, userId: myUserId, isTyping: false });
    } catch {
      setMessages((prev) => prev.filter(m => m.id !== tempId));
      setInput(content);
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async (messageId: string, forEveryone: boolean) => {
    try {
      await deleteMessage.mutateAsync({ messageId, forEveryone });
      setMessages(prev =>
        forEveryone
          ? prev.map(m => m.id === messageId ? { ...m, isDeletedForEveryone: true } : m)
          : prev.filter(m => m.id !== messageId),
      );
    } catch (e) { console.error(e); }
  };

  const handleReaction = async (messageId: string, emoji: string) => {
    try {
      await apiClient.post(`/chat/messages/${messageId}/reactions`, { emoji });
      setMessages(prev => prev.map(m =>
        m.id === messageId
          ? { ...m, reactions: [...(m.reactions || []), { emoji, userId: myUserId ?? '' }] }
          : m,
      ));
      const socket = getSocket();
      socket.emit('addReaction', { messageId, userId: myUserId, emoji });
    } catch (e) { console.error(e); }
    setShowReactions(null);
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const sendImageMessage = async (file: File) => {
    if (!file || uploadingImage) return;
    setUploadingImage(true);
    const tempId = `temp-${Date.now()}`;
    const previewUrl = URL.createObjectURL(file);
    setMessages(prev => [...prev, {
      id: tempId, content: '', senderId: myUserId ?? undefined,
      timestamp: new Date().toISOString(), isOwn: true, type: 'image', mediaUrl: previewUrl,
    }]);
    try {
      const uploaded = await postsApi.uploadMedia(file);
      const mediaUrl: string = uploaded?.data?.url ?? uploaded?.url ?? previewUrl;
      const { data } = await apiClient.post('/chat/messages', { conversationId: match.id, content: '', type: 'image', mediaUrl });
      const saved = data.data;
      URL.revokeObjectURL(previewUrl);
      setMessages(prev => prev.map(m => m.id === tempId ? { ...m, id: saved.id, mediaUrl } : m));
      const socket = getSocket();
      socket.emit('relayMessage', { conversationId: match.id, message: { id: saved.id, content: '', senderId: myUserId, type: 'image', mediaUrl, createdAt: saved.createdAt ?? new Date().toISOString() } });
    } catch {
      URL.revokeObjectURL(previewUrl);
      setMessages(prev => prev.filter(m => m.id !== tempId));
    } finally {
      setUploadingImage(false);
    }
  };

  const formatTime = (timestamp: string) =>
    new Date(timestamp).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' });

  const getReplyMessage = (replyToId: string) => messages.find(m => m.id === replyToId);

  const otherName = (match as any).otherUserName || `مستخدم ${match.user2Id?.slice(0, 8)}`;
  const otherAvatarSrc = avatarSrc((match as any).otherUserAvatar);
  const otherInitial = otherName.charAt(0).toUpperCase();

  return (
    <div className="flex flex-col h-full rounded-2xl overflow-hidden"
      style={{ background: 'var(--card)', border: '1px solid var(--border)', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>

      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 px-4 py-3 shrink-0"
        style={{ borderBottom: '1px solid var(--border)', background: 'var(--card)' }}>
        <button onClick={onBack}
          className="lg:hidden flex items-center justify-center w-8 h-8 rounded-xl transition-all hover:scale-110"
          style={{ color: 'var(--muted-foreground)', background: 'var(--muted)' }}>
          <ArrowLeft size={16} />
        </button>

        {/* Avatar */}
        <div className="h-9 w-9 shrink-0 rounded-full overflow-hidden flex items-center justify-center text-sm font-bold text-white"
          style={{ background: 'linear-gradient(135deg, var(--primary), var(--accent))' }}>
          {otherAvatarSrc ? (
            <Image src={otherAvatarSrc} alt={otherName} width={36} height={36} className="w-full h-full object-cover" />
          ) : otherInitial}
        </div>

        {/* Name + status */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold truncate" style={{ color: 'var(--foreground)' }}>{otherName}</p>
          {typingUsers.length > 0 ? (
            <p className="text-xs font-medium" style={{ color: 'var(--accent)' }}>يكتب الآن...</p>
          ) : (
            <p className="text-xs flex items-center gap-1" style={{ color: 'var(--muted-foreground)' }}>
              <span className="inline-block h-1.5 w-1.5 rounded-full"
                style={{ background: isOnline ? '#22c55e' : 'var(--border)' }} />
              <span style={{ color: isOnline ? '#22c55e' : 'var(--muted-foreground)' }}>
                {isOnline ? 'متصل' : 'غير متصل'}
              </span>
            </p>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1">
          {callToast && (
            <span className="text-xs px-2.5 py-1 rounded-xl"
              style={{ color: 'var(--muted-foreground)', background: 'var(--muted)' }}>
              {callToast}
            </span>
          )}
          <button
            onClick={() => { setCallToast('المكالمات قيد التطوير'); setTimeout(() => setCallToast(null), 3000); }}
            title="مكالمة صوتية"
            className="p-2 rounded-xl transition-all hover:scale-110"
            style={{ color: 'var(--muted-foreground)' }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--muted)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
            <Phone size={18} />
          </button>
          <button
            onClick={() => { setCallToast('مكالمات الفيديو قيد التطوير'); setTimeout(() => setCallToast(null), 3000); }}
            title="مكالمة فيديو"
            className="p-2 rounded-xl transition-all hover:scale-110"
            style={{ color: 'var(--muted-foreground)' }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--muted)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
            <VideoCamera size={18} />
          </button>
          <button title="مزيد من الخيارات"
            className="p-2 rounded-xl transition-all hover:scale-110"
            style={{ color: 'var(--muted-foreground)' }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--muted)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
            <DotsThreeVertical size={20} weight="bold" />
          </button>
        </div>
      </div>

      {/* ── Messages area ──────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2"
        style={{ background: 'var(--background)' }}>
        {messagesLoading ? (
          <div className="flex h-full items-center justify-center flex-col gap-3">
            <div className="w-10 h-10 rounded-full border-2 border-transparent animate-spin"
              style={{ borderTopColor: 'var(--primary)', borderRightColor: 'var(--secondary)' }} />
            <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>جاري تحميل الرسائل...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex h-full items-center justify-center flex-col gap-3">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{ background: 'color-mix(in srgb, var(--primary) 8%, var(--muted))' }}>
              <span className="text-3xl">👋</span>
            </div>
            <p className="text-sm font-medium" style={{ color: 'var(--muted-foreground)' }}>ابدأ المحادثة الآن</p>
          </div>
        ) : null}

        {messages.map((msg) => (
          <div key={msg.id}
            className={`group flex items-end gap-1.5 ${msg.isOwn ? 'justify-end' : 'justify-start'}`}
            onMouseEnter={() => setHoveredMsgId(msg.id)}
            onMouseLeave={() => setHoveredMsgId(null)}>

            {/* Received-message reply button (appears to the right of the bubble since bubble is on left) */}
            {!msg.isOwn && hoveredMsgId === msg.id && !msg.isDeletedForEveryone && (
              <button onClick={() => setReplyTo(msg)}
                className="flex items-center justify-center w-6 h-6 rounded-full mb-1 opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
                style={{ background: 'var(--muted)', color: 'var(--muted-foreground)', order: 2 }}>
                <ArrowBendUpLeft size={11} />
              </button>
            )}

            {/* Own-message action buttons (appear to the left of the bubble) */}
            {msg.isOwn && hoveredMsgId === msg.id && !msg.isDeletedForEveryone && !String(msg.id).startsWith('temp-') && (
              <div className="flex items-center gap-1 mb-1 opacity-0 group-hover:opacity-100 transition-all" style={{ order: 0 }}>
                <button onClick={() => setReplyTo(msg)} title="رد"
                  className="flex items-center justify-center w-6 h-6 rounded-full transition-all hover:scale-110"
                  style={{ background: 'var(--muted)', color: 'var(--muted-foreground)' }}>
                  <ArrowBendUpLeft size={11} />
                </button>
                <button onClick={() => handleDelete(msg.id, false)} title="حذف للي"
                  className="flex items-center justify-center w-6 h-6 rounded-full transition-all hover:scale-110"
                  style={{ background: 'color-mix(in srgb, var(--destructive) 10%, var(--muted))', color: 'var(--destructive)' }}>
                  <Trash size={10} />
                </button>
                <button onClick={() => handleDelete(msg.id, true)} title="حذف للجميع"
                  className="text-[10px] font-bold px-2 h-6 rounded-full transition-all hover:scale-105"
                  style={{ background: 'var(--destructive)', color: 'white' }}>
                  للجميع
                </button>
              </div>
            )}

            {/* Bubble */}
            <div
              className={`relative max-w-xs lg:max-w-md rounded-2xl px-4 py-2.5 text-sm ${msg.isOwn ? 'rounded-tl-sm' : 'rounded-tr-sm'}`}
              style={msg.isOwn
                ? { background: 'linear-gradient(135deg, var(--primary), var(--secondary))' }
                : { background: 'var(--muted)', border: '1px solid var(--border)' }}>

              {/* Reply preview — always show when a message has a replyToId */}
              {msg.replyToId && (
                <div className="mb-2 p-2 rounded-lg text-xs"
                  style={msg.isOwn
                    ? { background: 'rgba(255,255,255,0.15)', borderRight: '2px solid rgba(255,255,255,0.45)', color: 'rgba(255,255,255,0.85)' }
                    : { background: 'color-mix(in srgb, var(--primary) 6%, var(--muted))', borderRight: '2px solid var(--primary)', color: 'var(--muted-foreground)' }}>
                  {(() => {
                    const replyContent = getReplyMessage(msg.replyToId)?.content || 'رسالة محذوفة';
                    return replyContent.length > 40 ? replyContent.slice(0, 40) + '...' : replyContent;
                  })()}
                </div>
              )}

              {/* Message body */}
              {msg.isDeletedForEveryone ? (
                <span className="italic text-xs" style={{ opacity: 0.55, color: msg.isOwn ? 'white' : 'var(--muted-foreground)' }}>
                  تم حذف الرسالة
                </span>
              ) : msg.type === 'image' && msg.mediaUrl ? (
                <div className="rounded-xl overflow-hidden max-w-[200px]">
                  <Image src={msg.mediaUrl} alt="صورة" width={200} height={200} className="w-full h-auto object-cover" />
                </div>
              ) : (
                <>
                  <p className="leading-relaxed" dir="auto"
                    style={{ color: msg.isOwn ? 'white' : 'var(--foreground)' }}>
                    {msg.content}
                  </p>
                  {msg.isEdited && (
                    <span className="text-[10px]" style={{ opacity: 0.6, color: msg.isOwn ? 'white' : 'var(--muted-foreground)' }}>
                      (تم التعديل)
                    </span>
                  )}
                </>
              )}

              {/* Timestamp + read receipt */}
              <div className="mt-1 flex items-center justify-end gap-1.5 text-[10px]">
                <span style={{ color: msg.isOwn ? 'rgba(255,255,255,0.65)' : 'var(--muted-foreground)' }}>
                  {formatTime(msg.timestamp)}
                </span>
                {msg.isOwn && !String(msg.id).startsWith('temp-') && (() => {
                  const seen = !!otherSeenAt && new Date(msg.timestamp).getTime() <= new Date(otherSeenAt).getTime();
                  return (
                    <span title={seen ? 'تمت القراءة' : 'تم الإرسال'}
                      style={{ color: seen ? 'white' : 'rgba(255,255,255,0.6)', fontWeight: seen ? 700 : 400 }}>
                      {seen ? '✓✓' : '✓'}
                    </span>
                  );
                })()}
                {msg.isOwn && String(msg.id).startsWith('temp-') && (
                  <span title="جارٍ الإرسال" style={{ color: 'rgba(255,255,255,0.45)' }}>○</span>
                )}
              </div>

              {/* Reactions display */}
              {msg.reactions && msg.reactions.length > 0 && (
                <div className="absolute -bottom-3 flex gap-0.5">
                  {msg.reactions.map((r, i) => (
                    <span key={i} className="rounded-full px-1.5 py-0.5 text-xs shadow-sm"
                      style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                      {r.emoji}
                    </span>
                  ))}
                </div>
              )}

              {/* Emoji picker trigger */}
              <button
                onClick={() => setShowReactions(showReactions === msg.id ? null : msg.id)}
                className={`absolute top-1/2 -translate-y-1/2 ${msg.isOwn ? '-left-7' : '-right-7'} w-6 h-6 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:scale-110`}
                style={{ background: 'var(--card)', border: '1px solid var(--border)', color: 'var(--muted-foreground)' }}>
                <Smiley size={13} />
              </button>

              {showReactions === msg.id && (
                <div
                  className={`absolute top-0 z-10 flex gap-1 p-1.5 rounded-full shadow-xl ${msg.isOwn ? '-left-44' : '-right-44'}`}
                  style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                  {EMOJI_REACTIONS.map(emoji => (
                    <button key={emoji}
                      onClick={() => handleReaction(msg.id, emoji)}
                      className="text-base hover:scale-125 transition-transform">
                      {emoji}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {typingUsers.length > 0 && (
          <div className="flex justify-start">
            <div className="flex items-center gap-1 rounded-2xl rounded-tr-sm px-4 py-2.5"
              style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}>
              {[0, 1, 2].map(i => (
                <span key={i} className="block w-1.5 h-1.5 rounded-full animate-bounce"
                  style={{ background: 'var(--muted-foreground)', animationDelay: `${i * 0.15}s` }} />
              ))}
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* ── Reply preview strip ─────────────────────────────────── */}
      {replyTo && (
        <div className="flex items-center gap-3 px-4 py-2 shrink-0"
          style={{ borderTop: '1px solid var(--border)', background: 'color-mix(in srgb, var(--primary) 4%, var(--card))' }}>
          <ArrowBendUpLeft size={14} style={{ color: 'var(--primary)', flexShrink: 0 }} />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold" style={{ color: 'var(--primary)' }}>رد على رسالة</p>
            <p className="text-xs truncate" style={{ color: 'var(--muted-foreground)' }}>
              {replyTo.content?.slice(0, 50) || 'رسالة صورة'}
            </p>
          </div>
          <button onClick={() => setReplyTo(null)}
            className="text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center transition-all hover:scale-110"
            style={{ background: 'var(--muted)', color: 'var(--muted-foreground)' }}>
            ✕
          </button>
        </div>
      )}

      {/* ── Input area ─────────────────────────────────────────── */}
      <div className="shrink-0 px-3 py-2.5"
        style={{ borderTop: '1px solid var(--border)', background: 'var(--card)' }}>
        <div className="flex items-end gap-2">
          <input
            ref={imageInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) { sendImageMessage(f); e.target.value = ''; } }}
          />
          <button
            title="إرسال صورة"
            disabled={uploadingImage}
            onClick={() => imageInputRef.current?.click()}
            className="flex items-center justify-center w-10 h-10 rounded-xl shrink-0 transition-all hover:scale-110 disabled:opacity-40"
            style={{ color: uploadingImage ? 'var(--muted-foreground)' : 'var(--primary)', background: 'var(--muted)' }}>
            {uploadingImage ? (
              <span className="w-4 h-4 border-2 border-transparent rounded-full animate-spin"
                style={{ borderTopColor: 'var(--primary)' }} />
            ) : (
              <ImageIcon size={18} />
            )}
          </button>

          <textarea
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKey}
            placeholder="اكتب رسالة..."
            rows={1}
            dir="auto"
            className="flex-1 resize-none rounded-xl px-4 py-2.5 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-[var(--ring)] max-h-32"
            style={{ background: 'var(--background)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
          />

          <button
            onClick={sendMessage}
            disabled={!input.trim() || sending}
            className="flex items-center justify-center w-10 h-10 shrink-0 rounded-xl text-white transition-all hover:scale-110 active:scale-95 disabled:opacity-40"
            style={{ background: 'linear-gradient(135deg, var(--primary), var(--secondary))' }}>
            {sending ? (
              <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            ) : (
              <PaperPlaneTilt size={16} weight="fill" />
            )}
          </button>
        </div>
        <p className="mt-1 text-center text-[10px]" style={{ color: 'var(--muted-foreground)', opacity: 0.6 }}>
          Enter للإرسال · Shift+Enter لسطر جديد
        </p>
      </div>
    </div>
  );
};
