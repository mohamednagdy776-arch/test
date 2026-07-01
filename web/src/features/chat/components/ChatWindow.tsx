'use client';
import Image from 'next/image';
import { useEffect, useRef, useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { getSocket, getCurrentUserId } from '@/lib/socket-client';
import { useDeleteMessage } from '@/features/chat/hooks';
import { postsApi } from '@/features/posts/api';
import { resolveMediaUrl } from '@/lib/media';
import { TranslatedMessageBody } from './TranslatedMessageBody';
import { useCall } from '@/features/call/CallProvider';
import { useToast } from '@/components/ui/Toast';
import { useTargetLanguage } from '../useTranslation';
import { LANGUAGES, LANGUAGE_BY_CODE } from '@/lib/translation';
import type { Match } from '@/types';
import {
  ArrowLeft, Phone, VideoCamera, DotsThreeVertical,
  PaperPlaneTilt, Image as ImageIcon, Smiley, Trash, ArrowBendUpLeft,
  Translate, Check, Prohibit, UserCircle,
} from '@phosphor-icons/react';


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
  return resolveMediaUrl(url);
}

export const ChatWindow = ({ match, onBack }: Props) => {
  const myUserId = getCurrentUserId();
  const { startCall } = useCall();
  const { showToast } = useToast() as any;
  const { lang: targetLang, setLang: setTargetLang } = useTargetLanguage();
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [blocking, setBlocking] = useState(false);
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

    // Live reaction sync (#26). Ignore our own echo — already applied optimistically.
    socket.on('reactionUpdated', (d: { messageId: string; userId: string; emoji: string; action: string }) => {
      if (d.userId === myUserId) return;
      setMessages(prev => prev.map(m => {
        if (m.id !== d.messageId) return m;
        const others = (m.reactions || []).filter(r => r.userId !== d.userId);
        return { ...m, reactions: d.action === 'removed' ? others : [...others, { emoji: d.emoji, userId: d.userId }] };
      }));
    });

    return () => {
      socket.emit('leaveConversation', { conversationId: match.id });
      socket.off('presence', onPresence);
      socket.off('newMessage');
      socket.off('userTyping');
      socket.off('messageSeen');
      socket.off('reactionUpdated');
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
    } catch (err: any) {
      setMessages((prev) => prev.filter(m => m.id !== tempId));
      setInput(content);
      // Surface a blocked-pair rejection (#28) rather than silently failing.
      const msg = err?.response?.status === 403
        ? (err?.response?.data?.message || 'لا يمكنك مراسلة هذا المستخدم')
        : 'تعذّر إرسال الرسالة';
      showToast?.(msg, 'error');
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
    // One reaction per user (#26): clicking the same emoji removes it, a different
    // emoji replaces it. Update local state by upsert/toggle so reactions are never
    // duplicated, then persist via REST (server mirrors the upsert/toggle).
    const msg = messages.find(m => m.id === messageId);
    const mine = msg?.reactions?.find(r => r.userId === myUserId);
    const isToggleOff = mine?.emoji === emoji;
    setMessages(prev => prev.map(m => {
      if (m.id !== messageId) return m;
      const others = (m.reactions || []).filter(r => r.userId !== (myUserId ?? ''));
      return { ...m, reactions: isToggleOff ? others : [...others, { emoji, userId: myUserId ?? '' }] };
    }));
    setShowReactions(null);
    try {
      const { data } = await apiClient.post(`/chat/messages/${messageId}/reactions`, { emoji });
      const action: string = data?.data?.action ?? (isToggleOff ? 'removed' : 'added');
      // Relay the resulting change so the peer's open chat updates in real time.
      getSocket().emit('addReaction', { conversationId: match.id, messageId, userId: myUserId, emoji, action });
    } catch (e) { console.error(e); }
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const handleBlock = async () => {
    if (!match.user2Id || blocking) return;
    setShowMenu(false);
    setBlocking(true);
    try {
      await apiClient.post('/blocks', { blockedUserId: match.user2Id });
      showToast?.('تم حظر المستخدم', 'success');
      onBack();
    } catch {
      showToast?.('تعذّر حظر المستخدم', 'error');
    } finally {
      setBlocking(false);
    }
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
  // Link to the other user's profile (#9/#27). Prefer the canonical /[username]
  // route the rest of the app uses; fall back to /profile/{id} by user id.
  const otherUsername = (match as any).otherUsername as string | undefined;
  const profileHref = otherUsername
    ? `/${otherUsername}`
    : match.user2Id
      ? `/profile/${match.user2Id}`
      : null;

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

        {/* Avatar — links to the other user's profile (#9) */}
        <a
          href={profileHref ?? undefined}
          aria-label={profileHref ? `عرض ملف ${otherName} الشخصي` : undefined}
          className={`h-9 w-9 shrink-0 rounded-full overflow-hidden flex items-center justify-center text-sm font-bold text-white ${profileHref ? 'cursor-pointer transition-opacity hover:opacity-90' : ''}`}
          style={{ background: 'linear-gradient(135deg, var(--primary), var(--accent))' }}>
          {otherAvatarSrc ? (
            <Image src={otherAvatarSrc} alt={otherName} width={36} height={36} className="w-full h-full object-cover" />
          ) : otherInitial}
        </a>

        {/* Name + status */}
        <div className="flex-1 min-w-0">
          {profileHref ? (
            <a href={profileHref} className="text-sm font-bold truncate block hover:underline" style={{ color: 'var(--foreground)' }}>{otherName}</a>
          ) : (
            <p className="text-sm font-bold truncate" style={{ color: 'var(--foreground)' }}>{otherName}</p>
          )}
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
          {/* Translate / language picker */}
          <div className="relative">
            <button
              onClick={() => setShowLangMenu((v) => !v)}
              title="لغة عرض الرسائل"
              className="relative flex items-center gap-1 p-2 rounded-xl transition-all hover:scale-110"
              style={{
                color: targetLang ? 'var(--primary)' : 'var(--muted-foreground)',
                background: targetLang ? 'color-mix(in srgb, var(--primary) 10%, transparent)' : 'transparent',
              }}
              onMouseEnter={(e) => { if (!targetLang) e.currentTarget.style.background = 'var(--muted)'; }}
              onMouseLeave={(e) => { if (!targetLang) e.currentTarget.style.background = 'transparent'; }}
            >
              <Translate size={18} />
              {targetLang && (
                <span className="text-xs font-bold leading-none">
                  {LANGUAGE_BY_CODE[targetLang]?.flag ?? targetLang.toUpperCase()}
                </span>
              )}
            </button>

            {showLangMenu && (
              <>
                {/* Click-away layer */}
                <div className="fixed inset-0 z-30" onClick={() => setShowLangMenu(false)} />
                <div
                  className="absolute z-40 mt-2 left-0 w-56 rounded-2xl overflow-hidden shadow-xl"
                  style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
                >
                  <div className="px-3 py-2.5" style={{ borderBottom: '1px solid var(--border)' }}>
                    <p className="text-xs font-bold" style={{ color: 'var(--foreground)' }}>ترجمة الرسائل</p>
                    <p className="text-[10px] mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
                      اختر اللغة التي تريد قراءة الرسائل بها
                    </p>
                  </div>
                  <div className="max-h-72 overflow-y-auto py-1">
                    {/* Off / original */}
                    <button
                      onClick={() => { setTargetLang(''); setShowLangMenu(false); }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors text-right"
                      style={{ color: 'var(--foreground)' }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--muted)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <span className="w-4 flex justify-center">
                        {!targetLang && <Check size={14} weight="bold" style={{ color: 'var(--primary)' }} />}
                      </span>
                      <span className="flex-1">بدون ترجمة (الأصل)</span>
                    </button>
                    {LANGUAGES.map((l) => (
                      <button
                        key={l.code}
                        onClick={() => { setTargetLang(l.code); setShowLangMenu(false); }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors text-right"
                        style={{ color: 'var(--foreground)' }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--muted)')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                      >
                        <span className="w-4 flex justify-center">
                          {targetLang === l.code && <Check size={14} weight="bold" style={{ color: 'var(--primary)' }} />}
                        </span>
                        <span>{l.flag}</span>
                        <span className="flex-1">{l.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          <button
            onClick={() => {
              if (!match.user2Id) return;
              startCall({
                conversationId: match.id,
                calleeId: match.user2Id,
                name: otherName,
                avatar: (match as any).otherUserAvatar,
                callType: 'audio',
              });
            }}
            title="مكالمة صوتية"
            aria-label="بدء مكالمة صوتية"
            className="p-2 rounded-xl transition-all hover:scale-110"
            style={{ color: 'var(--muted-foreground)' }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--muted)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
            <Phone size={18} />
          </button>
          <button
            onClick={() => {
              if (!match.user2Id) return;
              startCall({
                conversationId: match.id,
                calleeId: match.user2Id,
                name: otherName,
                avatar: (match as any).otherUserAvatar,
                callType: 'video',
              });
            }}
            title="مكالمة فيديو"
            aria-label="بدء مكالمة فيديو"
            className="p-2 rounded-xl transition-all hover:scale-110"
            style={{ color: 'var(--muted-foreground)' }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--muted)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
            <VideoCamera size={18} />
          </button>
          <div className="relative">
            <button
              onClick={() => setShowMenu((v) => !v)}
              title="مزيد من الخيارات"
              aria-label="مزيد من الخيارات"
              aria-haspopup="menu"
              aria-expanded={showMenu}
              className="p-2 rounded-xl transition-all hover:scale-110"
              style={{ color: 'var(--muted-foreground)', background: showMenu ? 'var(--muted)' : 'transparent' }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--muted)')}
              onMouseLeave={(e) => { if (!showMenu) e.currentTarget.style.background = 'transparent'; }}>
              <DotsThreeVertical size={20} weight="bold" />
            </button>

            {showMenu && (
              <>
                {/* Click-away layer */}
                <div className="fixed inset-0 z-30" onClick={() => setShowMenu(false)} />
                <div
                  role="menu"
                  className="absolute z-40 mt-2 left-0 w-52 rounded-2xl overflow-hidden shadow-xl"
                  style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
                >
                  {profileHref && (
                    <a
                      href={profileHref}
                      role="menuitem"
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm transition-colors text-right"
                      style={{ color: 'var(--foreground)' }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--muted)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <UserCircle size={18} />
                      <span className="flex-1">عرض الملف الشخصي</span>
                    </a>
                  )}
                  <button
                    onClick={handleBlock}
                    disabled={blocking}
                    role="menuitem"
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm transition-colors text-right disabled:opacity-50"
                    style={{ color: 'var(--destructive)' }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'color-mix(in srgb, var(--destructive) 8%, transparent)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <Prohibit size={18} weight="bold" />
                    <span className="flex-1">{blocking ? 'جارٍ الحظر…' : 'حظر المستخدم'}</span>
                  </button>
                </div>
              </>
            )}
          </div>
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