'use client';
import Link from 'next/link';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useReactions, useToggleReaction, useComments, useAddComment, useSavePost, useSharePost, useHidePost, useDeletePost, useUpdatePost } from '../hooks';
import { useMyProfile } from '@/features/profile/hooks';
import { apiClient } from '@/lib/api-client';
import { cn, displayName } from '@/lib/utils';
import { resolveMediaUrl } from '@/lib/media';
import { useToast } from '@/components/ui/Toast';
import { ChatCircle, ShareNetwork, MapPin, BookmarkSimple, EyeSlash, Clock, Trash, X, DotsThreeVertical, PaperPlaneTilt, PencilSimple } from '@phosphor-icons/react';

const REACTIONS = [
  { type: 'like', emoji: '👍', label: 'إعجاب', activeBg: 'bg-[var(--muted)]', activeText: 'text-[var(--foreground)]' },
  { type: 'love', emoji: '❤️', label: 'حب', activeBg: 'bg-[#B05252]/15', activeText: 'text-[#B05252]' },
  { type: 'haha', emoji: '😂', label: 'ضحك', activeBg: 'bg-[#F9D71C]/20', activeText: 'text-[#F9D71C]' },
  { type: 'wow', emoji: '😮', label: 'مثير', activeBg: 'bg-[#F9A825]/20', activeText: 'text-[#F9A825]' },
  { type: 'sad', emoji: '😢', label: 'حزن', activeBg: 'bg-[#5C6BC0]/20', activeText: 'text-[#5C6BC0]' },
  { type: 'angry', emoji: '😠', label: 'غضب', activeBg: 'bg-[#B05252]/20', activeText: 'text-[#B05252]' },
];

// Turn #hashtags, @mentions, and URLs into interactive elements.
function renderWithHashtags(text: string) {
  if (!text) return text;
  const URL_RE = /\bhttps?:\/\/[^\s<>"')]+/gi;
  const TRAILING = /[.,;:!?)]+$/;
  const parts = text.split(/(#[\p{L}0-9_]+|@[a-zA-Z0-9_]+|\bhttps?:\/\/[^\s<>"')]+)/gu);
  return parts.map((part, i) => {
    if (/^#[\p{L}0-9_]+$/u.test(part)) {
      return <Link key={i} href={`/search?q=${encodeURIComponent(part)}`} className="text-[var(--primary)] font-medium hover:underline">{part}</Link>;
    }
    if (/^@[a-zA-Z0-9_]+$/.test(part)) {
      return <Link key={i} href={`/${part.slice(1)}`} className="text-[var(--primary)] font-medium hover:underline">{part}</Link>;
    }
    if (/^\bhttps?:\/\//i.test(part)) {
      const url = part.replace(TRAILING, '');
      return <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="text-[var(--primary)] underline break-all hover:opacity-80" dir="ltr" onClick={(e) => e.stopPropagation()}>{url}</a>;
    }
    return part;
  });
}

function timeAgo(date: string | Date) {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'الآن';
  if (mins < 60) return `${mins} د`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} س`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} ي`;
  return new Date(date).toLocaleDateString('ar-EG');
}

function ReactionPicker({ onSelect, onClose }: { onSelect: (type: string) => void; onClose: () => void }) {
  return (
    <div className="absolute bottom-full mb-2 left-0 bg-[var(--card)] rounded-2xl shadow-glow-lg border border-[var(--border)]/60 p-3 animate-scale-in z-20">
      <div className="flex gap-2">
        {REACTIONS.map((r) => (
          <button
            key={r.type}
            onClick={() => { onSelect(r.type); onClose(); }}
            className="text-2xl p-2 hover:bg-[var(--muted)]/50 rounded-full transition-transform hover:scale-125 hover:shadow-soft"
            title={r.label}
          >
            {r.emoji}
          </button>
        ))}
      </div>
    </div>
  );
}

function ReactionDisplay({ postId }: { postId: string }) {
  const { data } = useReactions(postId);
  const toggle = useToggleReaction();
  const [showPicker, setShowPicker] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);
  
  const reactionData = data?.data;
  const counts: Record<string, number> = reactionData?.counts ?? {};
  const userReaction = reactionData?.userReaction as string | undefined;
  const total: number = reactionData?.total ?? 0;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) setShowPicker(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const currentReaction = REACTIONS.find(r => r.type === userReaction);
  const defaultEmoji = '👍';

  return (
    <div className="relative" ref={pickerRef}>
      <div className="flex items-center gap-1">
        <button
          onClick={() => setShowPicker(!showPicker)}
          className={cn(
            'flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-300 active:scale-95',
            'hover:-translate-y-0.5 hover:shadow-soft',
            currentReaction ? `${currentReaction.activeBg} ${currentReaction.activeText}` : 'bg-[var(--muted)]/60 text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]'
          )}
        >
          <span className="text-base">{currentReaction?.emoji || defaultEmoji}</span>
          <span>{currentReaction?.label || 'إعجاب'}</span>
        </button>
        {total > 0 && <span className="text-xs text-[var(--muted-foreground)] font-medium shadow-soft rounded-full px-2 py-0.5">{total}</span>}
      </div>
      {showPicker && <ReactionPicker onSelect={(type) => toggle.mutate({ postId, type })} onClose={() => setShowPicker(false)} />}
    </div>
  );
}

function CommentSection({ postId }: { postId: string }) {
  const [text, setText] = useState('');
  const { data, isLoading } = useComments(postId);
  const addComment = useAddComment();
  const comments: any[] = data?.data ?? [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    await addComment.mutateAsync({ postId, content: text.trim() });
    setText('');
  };

  return (
    <div className="mt-4 pt-4 border-t border-[var(--border)]/40 animate-slide-down">
      {isLoading ? (
        <div className="space-y-3 mb-4">{[1, 2].map(i => <div key={i} className="flex gap-3"><div className="h-8 w-8 rounded-full bg-[var(--muted)] animate-pulse" /><div className="flex-1 h-12 bg-[var(--muted)] rounded-2xl animate-pulse" /></div>)}</div>
      ) : comments.length > 0 ? (
        <div className="space-y-3 mb-4 max-h-72 overflow-y-auto scrollbar-thin">
          {comments.map((c: any) => (
            <div key={c.id} className="flex gap-3 group">
              <div className="h-8 w-8 shrink-0 rounded-full flex items-center justify-center text-[var(--foreground)] text-xs font-bold ring-2 ring-[var(--card)] shadow-soft" style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)' }}>
                {(c.user?.profile?.fullName || c.user?.email || '?').charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 rounded-2xl px-4 py-2.5 shadow-card-hover group-hover:shadow-glow transition-all duration-300" style={{ backgroundColor: 'var(--muted)' }}>
                <div className="flex items-center gap-2">
                  {c.user?.id ? (
                    <Link href={c.user?.username ? `/${c.user.username}` : `/profile/${c.user.id}`} className="text-xs font-bold text-[var(--foreground)] hover:underline">{displayName(c.user)}</Link>
                  ) : (
                    <p className="text-xs font-bold text-[var(--foreground)]">{displayName(c.user)}</p>
                  )}
                  <span className="text-[10px] text-[var(--muted-foreground)]">{timeAgo(c.createdAt)}</span>
                </div>
                <p className="text-sm text-[var(--foreground)] mt-0.5 leading-relaxed">{c.content}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-4 mb-3">
          <ChatCircle size={32} className="text-[var(--muted-foreground)] mb-1" />
          <p className="text-xs text-[var(--muted-foreground)]">لا توجد تعليقات بعد — كن أول من يعلق</p>
        </div>
      )}
      <form onSubmit={handleSubmit} className="flex gap-2 items-center">
        <div className="h-8 w-8 shrink-0 rounded-full flex items-center justify-center text-[var(--foreground)] text-xs font-bold shadow-soft" style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)' }}>أ</div>
        <input type="text" value={text} onChange={(e) => setText(e.target.value)} placeholder="اكتب تعليقاً..."