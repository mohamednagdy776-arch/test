'use client';
import Link from 'next/link';
import { createPortal } from 'react-dom';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useReactions, useToggleReaction, useComments, useAddComment, useSavePost, useSharePost, useHidePost, useDeletePost, useUpdatePost } from '../hooks';
import { useDeleteComment } from '@/features/comments/hooks';
import { useMyProfile } from '@/features/profile/hooks';
import { apiClient } from '@/lib/api-client';
import { cn, displayName } from '@/lib/utils';
import { resolveMediaUrl } from '@/lib/media';
import { useToast } from '@/components/ui/Toast';
import { Modal } from '@/components/ui/Modal';
import { Avatar } from '@/components/ui/Avatar';
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
  const [showBreakdown, setShowBreakdown] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  const reactionData = data?.data;
  const counts: Record<string, number> = reactionData?.counts ?? {};
  const userReaction = reactionData?.userReaction as string | undefined;
  const total: number = reactionData?.total ?? 0;
  const reactionList: any[] = reactionData?.reactions ?? [];

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) setShowPicker(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Without the viewer's own reaction, this always fell back to the generic
  // 👍/"إعجاب" placeholder regardless of what reactions the post actually
  // received (e.g. an all-Love post still showed a plain Like icon) --
  // show the most-picked reaction type instead (#328).
  const topType = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0];
  const currentReaction = REACTIONS.find(r => r.type === userReaction) ?? REACTIONS.find(r => r.type === topType);
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
        {/* The count was flat, unresponsive text -- no way to see who reacted
            or with what, for anyone including the post owner (#329). */}
        {total > 0 && (
          <button
            onClick={() => setShowBreakdown(true)}
            className="text-xs text-[var(--muted-foreground)] font-medium shadow-soft rounded-full px-2 py-0.5 hover:bg-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
          >
            {total}
          </button>
        )}
      </div>
      {showPicker && <ReactionPicker onSelect={(type) => toggle.mutate({ postId, type })} onClose={() => setShowPicker(false)} />}
      {showBreakdown && (
        <ReactionBreakdownModal
          reactions={reactionList}
          counts={counts}
          onClose={() => setShowBreakdown(false)}
        />
      )}
    </div>
  );
}

function ReactionBreakdownModal({ reactions, counts, onClose }: { reactions: any[]; counts: Record<string, number>; onClose: () => void }) {
  const [activeTab, setActiveTab] = useState<'all' | string>('all');
  const presentTypes = REACTIONS.filter(r => counts[r.type] > 0);
  const filtered = activeTab === 'all' ? reactions : reactions.filter(r => r.type === activeTab);

  return (
    <Modal open onClose={onClose} title="التفاعلات">
      <div className="space-y-3">
        <div className="flex gap-2 flex-wrap border-b border-[var(--border)] pb-2">
          <button
            onClick={() => setActiveTab('all')}
            className={cn('px-3 py-1.5 rounded-full text-xs font-semibold transition-colors', activeTab === 'all' ? 'bg-[var(--muted)] text-[var(--foreground)]' : 'text-[var(--muted-foreground)] hover:bg-[var(--muted)]/50')}
          >
            الكل ({reactions.length})
          </button>
          {presentTypes.map(r => (
            <button
              key={r.type}
              onClick={() => setActiveTab(r.type)}
              className={cn('flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors', activeTab === r.type ? `${r.activeBg} ${r.activeText}` : 'text-[var(--muted-foreground)] hover:bg-[var(--muted)]/50')}
            >
              <span>{r.emoji}</span> {counts[r.type]}
            </button>
          ))}
        </div>
        <div className="max-h-80 overflow-y-auto space-y-2">
          {filtered.length === 0 ? (
            <p className="text-sm text-[var(--muted-foreground)] text-center py-6">لا يوجد تفاعلات</p>
          ) : filtered.map((r) => {
            const meta = REACTIONS.find(x => x.type === r.type);
            return (
              <Link
                key={r.id}
                href={r.user?.username ? `/${r.user.username}` : `/profile/${r.user?.id}`}
                onClick={onClose}
                className="flex items-center gap-3 p-2 rounded-xl hover:bg-[var(--muted)]/50 transition-colors"
              >
                <span className="text-lg shrink-0">{meta?.emoji ?? '👍'}</span>
                <span className="text-sm font-medium text-[var(--foreground)]">{displayName(r.user)}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </Modal>
  );
}

function CommentSection({ postId, myUserId, isOwnPost }: { postId: string; myUserId?: string; isOwnPost?: boolean }) {
  const [text, setText] = useState('');
  const { data, isLoading } = useComments(postId);
  const addComment = useAddComment();
  const deleteComment = useDeleteComment();
  const { showToast } = useToast();
  const comments: any[] = data?.data ?? [];
  const { data: myProfileData } = useMyProfile();
  const myProfile = (myProfileData as any)?.data;

  // Only the comment's own author could ever delete it here -- the post
  // owner had no way to moderate/remove other people's comments on their
  // own post at all (#327).
  const handleDeleteComment = (commentId: string) => {
    deleteComment.mutate({ postId, commentId }, {
      onError: (err: any) => showToast(err?.response?.data?.message || 'تعذّر حذف التعليق', 'error'),
    });
  };

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
              {/* Was always an initials-only div, never a real avatar even
                  when the commenter had one uploaded (#265). */}
              <Avatar src={c.user?.profile?.avatarUrl} name={displayName(c.user)} size="sm" className="ring-2 ring-[var(--card)] shadow-soft" />
              <div className="flex-1 rounded-2xl px-4 py-2.5 shadow-card-hover group-hover:shadow-glow transition-all duration-300" style={{ backgroundColor: 'var(--muted)' }}>
                <div className="flex items-center gap-2">
                  {c.user?.id ? (
                    <Link href={c.user?.username ? `/${c.user.username}` : `/profile/${c.user.id}`} className="text-xs font-bold text-[var(--foreground)] hover:underline">{displayName(c.user)}</Link>
                  ) : (
                    <p className="text-xs font-bold text-[var(--foreground)]">{displayName(c.user)}</p>
                  )}
                  <span className="text-[10px] text-[var(--muted-foreground)]">{timeAgo(c.createdAt)}</span>
                  {(isOwnPost || (!!myUserId && c.user?.id === myUserId)) && (
                    <button
                      onClick={() => handleDeleteComment(c.id)}
                      disabled={deleteComment.isPending}
                      aria-label="حذف التعليق"
                      className="mr-auto opacity-0 group-hover:opacity-100 transition-opacity text-[var(--muted-foreground)] hover:text-[var(--destructive)] disabled:opacity-40"
                    >
                      <Trash size={13} />
                    </button>
                  )}
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
        {/* Was a hardcoded static "أ" placeholder, never the signed-in
            user's real avatar (#265). */}
        <Avatar src={myProfile?.avatarUrl} name={myProfile?.fullName} size="sm" className="shadow-soft" />
        <input type="text" value={text} onChange={(e) => setText(e.target.value)} placeholder="اكتب تعليقاً..."
          className="flex-1 rounded-full border border-[var(--border)] bg-[var(--muted)] px-4 py-2.5 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]/20 focus:border-[var(--ring)] focus:bg-[var(--card)] focus:shadow-[0_0_0_4px_rgba(184,137,42,0.08)] transition-all duration-300 hover:border-[var(--ring)]" />
        <button type="submit" disabled={!text.trim() || addComment.isPending}
          className="h-9 w-9 rounded-full text-[var(--card)] flex items-center justify-center hover:shadow-glow-lg disabled:opacity-40 transition-all duration-300 active:scale-95 hover:-translate-y-0.5"
          style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)' }}>
          <PaperPlaneTilt size={18} />
        </button>
      </form>
    </div>
  );
}

function ShareModal({ isOpen, onClose, postId, postContent }: { isOpen: boolean; onClose: () => void; postId: string; postContent: string }) {
  const [content, setContent] = useState('');
  const sharePost = useSharePost();
  const { showToast } = useToast() as any;

  // Was a hand-rolled `fixed inset-0` div nested inside the post <article>,
  // whose `hover:-translate-y-1` gives it a live transform while the cursor
  // (still over the card, since the Share button is inside it) is on it --
  // that transform makes the article the containing block for this modal's
  // `position: fixed`, so it rendered squeezed into the card instead of
  // centered on the viewport (#95). The shared Modal component already
  // solves this via a document.body portal (see its own comment re #106).
  return (
    <Modal open={isOpen} onClose={onClose} title="مشاركة المنشور">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="ما الذي يدور في ذهنك؟"
        className="w-full rounded-xl border border-[var(--border)] bg-[var(--muted)] px-4 py-3 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]/20 focus:border-[var(--ring)] focus:shadow-[0_0_0_4px_rgba(184,137,42,0.08)] mb-4 transition-all duration-300"
        rows={3}
      />
      <div className="bg-[var(--muted)] rounded-xl p-3 mb-4 shadow-inner-soft">
        <p className="text-xs text-[var(--muted-foreground)] line-clamp-2">{postContent}</p>
      </div>
      <button
        onClick={async () => {
          try {
            await sharePost.mutateAsync({ postId, content });
            showToast('تمت المشاركة بنجاح', 'success');
            onClose();
          } catch {
            showToast('فشلت المشاركة، حاول مجدداً', 'error');
          }
        }}
        disabled={sharePost.isPending}
        className="w-full py-3 rounded-xl text-[var(--card)] font-medium hover:shadow-glow-lg disabled:opacity-40 transition-all hover:-translate-y-0.5 duration-300"
        style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)' }}
      >
        {sharePost.isPending ? 'جاري النشر...' : 'مشاركة'}
      </button>
    </Modal>
  );
}

function EditPostModal({ isOpen, onClose, post }: { isOpen: boolean; onClose: () => void; post: any }) {
  const [content, setContent] = useState(post.content || '');
  const updatePost = useUpdatePost();
  const { showToast } = useToast() as any;

  // Same hand-rolled `fixed inset-0` bug as ShareModal above (#243) -- this
  // one was never migrated when ShareModal got fixed for #95/#106. A hover
  // transform on the ancestor <article> made this dialog's position depend
  // on whether the cursor happened to be over the card when it opened.
  return (
    <Modal open={isOpen} onClose={onClose} title="تعديل المنشور">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="w-full rounded-xl border border-[var(--border)] bg-[var(--muted)] px-4 py-3 text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]/20 focus:border-[var(--ring)] mb-4 transition-all duration-300 min-h-[100px]"
        rows={4}
      />
      <button
        onClick={async () => {
          try {
            await updatePost.mutateAsync({ postId: post.id, data: { content } });
            showToast('تم تعديل المنشور', 'success');
            onClose();
          } catch {
            showToast('فشل تعديل المنشور', 'error');
          }
        }}
        disabled={updatePost.isPending || !content.trim()}
        className="w-full py-3 rounded-xl text-[var(--card)] font-medium hover:shadow-glow-lg disabled:opacity-40 transition-all duration-300"
        style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)' }}
      >
        {updatePost.isPending ? 'جاري الحفظ...' : 'حفظ التعديلات'}
      </button>
    </Modal>
  );
}

function PostMenu({ postId, post, isOwnPost, savePost, onClose, onEdit, onHide, anchorRef }: { postId: string; post: any; isOwnPost?: boolean; savePost: ReturnType<typeof useSavePost>; onClose: () => void; onEdit?: () => void; onHide?: () => void; anchorRef: React.RefObject<HTMLButtonElement> }) {
  const { showToast } = useToast() as any;
  // The dropdown used to be a plain absolutely-positioned div nested inside
  // the post <article>, which has overflow-hidden -- any menu near a
  // viewport/container edge (very common on the narrower Profile -> Posts
  // tab layout) got clipped (#241). Render it through a portal at fixed
  // coordinates computed from the trigger button instead.
  const [coords, setCoords] = useState<{ top: number; right: number } | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const rect = anchorRef.current?.getBoundingClientRect();
    if (rect) setCoords({ top: rect.bottom + 8, right: window.innerWidth - rect.right });
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (anchorRef.current?.contains(target) || menuRef.current?.contains(target)) return;
      onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const hidePost = useHidePost();
  const deletePost = useDeletePost();
  const pinPost = useUpdatePost();

  const menuItems = [
    ...(isOwnPost && onEdit ? [{ label: 'تعديل المنشور', icon: PencilSimple, action: () => { onEdit(); } }] : []),
    { label: 'حفظ المنشور', icon: BookmarkSimple, action: () => savePost.mutate(postId) },
    ...(isOwnPost ? [
      // Pin/unpin uses the MapPin (pushpin) icon. It persists via PATCH /posts
      // (isPinned is whitelisted) and reorders the feed; the toast makes the
      // action visibly responsive instead of feeling dead (#11).
      { label: post.isPinned ? 'إلغاء التثبيت' : 'تثبيت المنشور', icon: MapPin, action: () => pinPost.mutate({ postId, data: { isPinned: !post.isPinned } }, { onSuccess: () => showToast(post.isPinned ? 'تم إلغاء تثبيت المنشور' : 'تم تثبيت المنشور', 'success') }) },
      // (#12) Removed the duplicate Bookmark "أرشفة المنشور" item: it reused the
      // same icon as "حفظ المنشور" and was dead — isArchived isn't a whitelisted
      // CreatePostDto field, so the global ValidationPipe stripped it and the
      // PATCH did nothing.
      { label: 'حذف المنشور', icon: Trash, action: () => deletePost.mutate(postId, { onSuccess: () => { showToast('تم حذف المنشور', 'success'); onHide?.(); } }), danger: true },
    ] : [
      { label: 'عدم الاهتمام', icon: EyeSlash, action: () => hidePost.mutate({ postId, hideType: 'not_interested' }, { onSuccess: () => { showToast('لن تظهر هذه المنشورات بعد الآن', 'success'); onHide?.(); } }) },
      { label: 'إيقاف مؤقت 30 يوم', icon: Clock, action: () => hidePost.mutate({ postId, hideType: 'snooze', snoozeDays: 30 }, { onSuccess: () => { showToast('تم إيقاف المنشورات مؤقتاً', 'success'); onHide?.(); } }) },
    ]),
  ];

  if (!coords) return null;

  return createPortal(
    <div
      ref={menuRef}
      className="fixed w-56 bg-[var(--card)] rounded-xl shadow-glow-lg border border-[var(--border)]/60 py-2 animate-scale-in z-[60]"
      style={{ top: coords.top, right: coords.right }}
    >
      {menuItems.map((item, i) => {
        const Icon = item.icon;
        return (
          <button
            key={i}
            onClick={() => { item.action(); onClose(); }}
            className={cn('w-full px-4 py-2.5 text-right text-sm hover:bg-[var(--muted)] flex items-center gap-3 hover:shadow-soft transition-all duration-200', item.danger ? 'text-[var(--destructive)]' : 'text-[var(--foreground)]')}
          >
            <Icon size={18} weight={item.danger ? 'fill' : 'regular'} />
            {item.label}
          </button>
        );
      })}
    </div>,
    document.body,
  );
}

function LinkPreview({ url, title, description, image }: { url: string; title?: string; description?: string; image?: string }) {
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className="block mt-3 rounded-xl overflow-hidden border border-[var(--border)]/60 hover:border-[var(--ring)] hover:shadow-glow transition-all duration-300 hover:-translate-y-0.5">
      {image && <div className="aspect-video bg-[var(--muted)]"><img src={image} alt={title} className="w-full h-full object-cover" /></div>}
      <div className="p-3 bg-[var(--muted)]">
        <p className="text-xs text-[var(--muted-foreground)] truncate">{url}</p>
        {title && <p className="text-sm font-semibold text-[var(--foreground)] mt-1 line-clamp-1">{title}</p>}
        {description && <p className="text-xs text-[var(--muted-foreground)] mt-1 line-clamp-2">{description}</p>}
      </div>
    </a>
  );
}

function PollDisplay({ postId, options, myVote }: { postId: string; options: { text: string; votes: number }[]; myVote?: number | null }) {
  // Previously always started at null, so a vote "disappeared" on refresh —
  // the backend now tells us which option (if any) this viewer already
  // picked (#167).
  const [voted, setVoted] = useState<number | null>(myVote ?? null);
  const [updatedOptions, setUpdatedOptions] = useState(options);

  const totalVotes = updatedOptions.reduce((sum, opt) => sum + opt.votes, 0);

  // Backend now supports changing an existing vote to a different option
  // (#219) -- only the option the viewer already picked stays disabled, not
  // every option in the poll.
  const handleVote = async (index: number) => {
    if (voted === index) return;
    try {
      const res = await apiClient.post(`/posts/${postId}/poll/${index}/vote`);
      if (res.data?.data?.pollOptions) {
        setUpdatedOptions(res.data.data.pollOptions);
      }
      setVoted(index);
    } catch (err) {
      console.error('Vote failed', err);
    }
  };

  return (
    <div className="mt-3 space-y-2">
      {updatedOptions.map((opt, i) => {
        const percentage = totalVotes > 0 ? Math.round((opt.votes / totalVotes) * 100) : 0;
        return (
          <button
            key={i}
            onClick={() => handleVote(i)}
            disabled={voted === i}
            className={cn(
              'w-full relative overflow-hidden rounded-lg text-sm text-right transition-all duration-300',
              'hover:-translate-y-0.5 hover:shadow-soft',
              voted === i ? 'ring-2 ring-[var(--muted-foreground)] shadow-glow cursor-default' : 'hover:ring-1 hover:ring-[var(--muted-foreground)]'
            )}
          >
            {/* bg-[var(--x)]/NN never compiled (Tailwind can't decompose a
                CSS custom property for an opacity modifier) -- the voted-fill
                bar had literally no background at all (#229). */}
            <div
              className="absolute inset-0 transition-all duration-500"
              style={{
                width: `${percentage}%`,
                background: voted === i
                  ? 'color-mix(in srgb, var(--primary) 35%, var(--muted))'
                  : 'var(--muted)',
              }}
            />
            <div className="relative flex items-center justify-between px-3 py-2.5">
              <span className="text-[var(--foreground)]">{opt.text}</span>
              <span className="text-[var(--muted-foreground)] font-medium">{percentage}%</span>
            </div>
          </button>
        );
      })}
      <p className="text-xs text-[var(--muted-foreground)] text-center pt-1 font-medium">{totalVotes} صوت</p>
    </div>
  );
}

// Each PostCard tracked its own `showMenu` state with zero coordination
// between cards, so opening a second post's menu never closed the first
// one -- multiple menus stayed open simultaneously (#221). A single shared
// event lets every card close itself when a DIFFERENT card's menu opens.
const POST_MENU_OPENED_EVENT = 'post-menu-opened';

export function PostCard({ post, showGroupLink = true }: { post: any; showGroupLink?: boolean }) {
  const [showComments, setShowComments] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const menuInstanceId = useRef(Math.random()).current;
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      if ((e as CustomEvent).detail !== menuInstanceId) setShowMenu(false);
    };
    window.addEventListener(POST_MENU_OPENED_EVENT, handler);
    return () => window.removeEventListener(POST_MENU_OPENED_EVENT, handler);
  }, [menuInstanceId]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [hidden, setHidden] = useState(false);
  const { data: myProfileData } = useMyProfile();
  const { showToast } = useToast() as any;
  const savePost = useSavePost({
    onSuccess: () => showToast('تم حفظ المنشور', 'success'),
    onError: (err: any) => showToast(err?.response?.data?.message === 'Already saved' ? 'المنشور محفوظ بالفعل' : 'فشل حفظ المنشور', 'error'),
  });
  // `GET /users/me` returns a PROFILE object with both `id` (profile id) and
  // `userId` (the user id). `post.user.id` is a USER id, so we must compare
  // against `userId` — using the profile `id` made isOwnPost always false and
  // hid the owner menu (edit/pin/archive/delete) on your own posts (#828).
  const myUserId =
    (myProfileData as any)?.data?.userId ??
    (myProfileData as any)?.data?.user?.id ??
    (myProfileData as any)?.data?.id ??
    null;
  const isOwnPost = myUserId && post.user?.id && myUserId === post.user.id;

  const userName = displayName(post.user);
  const userInitial = userName.charAt(0).toUpperCase();
  const authorAvatar = resolveMediaUrl(post.user?.profile?.avatarUrl);
  const mediaUrl = resolveMediaUrl(post.mediaUrl) ?? undefined;
  const isShared = post.postType === 'shared' || post.originalPostId;

  // Once hidden ("not interested"/snooze) remove the card from view immediately,
  // even though the feed query may not refetch it out (#829).
  if (hidden) return null;

  return (
    <article className="rounded-2xl bg-[var(--card)] shadow-card-hover border border-[var(--border)]/60 overflow-hidden transition-all duration-300 hover:shadow-glow-lg hover:-translate-y-1 relative group">
      <div className="flex items-center gap-3 p-4 pb-0">
        <div className="relative">
          <div className="h-11 w-11 shrink-0 rounded-full overflow-hidden text-[var(--card)] font-bold text-sm ring-2 ring-[var(--card)] shadow-soft flex items-center justify-center" style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)' }}>
            {authorAvatar ? <img src={authorAvatar} alt={userName} className="h-full w-full object-cover" /> : userInitial}
          </div>
          <div className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-[var(--secondary)] ring-2 ring-[var(--card)] shadow-[0_0_6px_rgba(74,140,111,0.5)]" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            {post.user?.id ? (
              <Link href={post.user?.username ? `/${post.user.username}` : `/profile/${post.user.id}`} className="text-sm font-bold text-[var(--foreground)] hover:underline">{userName}</Link>
            ) : (
              <p className="text-sm font-bold text-[var(--foreground)]">{userName}</p>
            )}
            {post.feeling && <span className="text-xs text-[var(--muted-foreground)] font-medium">شعور {post.feeling}</span>}
            {showGroupLink && post.group?.name && <><span className="text-xs text-[var(--muted-foreground)]">في</span><a href={`/groups/${post.group.id}`} className="text-xs font-semibold text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:underline hover:shadow-soft px-1 rounded transition-all">{post.group.name}</a></>}
          </div>
          <p className="text-[11px] text-[var(--muted-foreground)]">
            {timeAgo(post.createdAt)}
            {post.editedAt && <span className="mr-1">(تم التعديل)</span>}
            {post.location && <> · <MapPin size={12} className="inline" /> {post.location}</>}
          </p>
        </div>
        <div className="relative">
          <button ref={menuButtonRef} onClick={() => {
            if (!showMenu) window.dispatchEvent(new CustomEvent(POST_MENU_OPENED_EVENT, { detail: menuInstanceId }));
            setShowMenu(!showMenu);
          }} className="rounded-lg p-1.5 text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:shadow-soft transition-all duration-200 hover:scale-110">
            <DotsThreeVertical size={20} />
          </button>
          {showMenu && <PostMenu postId={post.id} post={post} isOwnPost={!!isOwnPost} savePost={savePost} onClose={() => setShowMenu(false)} onEdit={() => { setShowMenu(false); setShowEditModal(true); }} onHide={() => { setShowMenu(false); setHidden(true); }} anchorRef={menuButtonRef} />}
        </div>
      </div>

      {/* Content. The colored-text background and the poll/image are rendered
          independently so a post can have BOTH a coloured background AND a poll
          (#18) or AND an image (#19) — previously the coloured branch returned
          early and dropped everything else. */}
      {post.bgColor ? (
        <div className="px-4 pt-3">
          <div className="px-4 py-6 rounded-xl text-center shadow-card-hover" style={{ backgroundColor: post.bgColor }}>
            <p dir="auto" className="text-lg text-[var(--card)] font-medium whitespace-pre-wrap">{renderWithHashtags(post.content)}</p>
          </div>
        </div>
      ) : (
        <div className="px-4 py-3">
          <p dir="auto" className="text-sm text-[var(--foreground)]/85 leading-relaxed whitespace-pre-wrap">{renderWithHashtags(post.content)}</p>
        </div>
      )}
      {isShared && post.originalPost && (
        <div className="px-4 pt-1 pb-2">
          <div className="p-3 rounded-xl bg-[var(--muted)] border border-[var(--border)]/40 shadow-card-hover transition-all duration-300 hover:shadow-glow">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-6 w-6 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] text-[var(--card)] text-xs flex items-center justify-center shadow-soft">
                {displayName(post.originalPost.user).charAt(0)}
              </div>
              {post.originalPost.user?.id ? (
                <Link href={post.originalPost.user?.username ? `/${post.originalPost.user.username}` : `/profile/${post.originalPost.user.id}`} className="text-xs font-medium text-[var(--foreground)] hover:underline">{displayName(post.originalPost.user)}</Link>
              ) : (
                <span className="text-xs font-medium text-[var(--foreground)]">{displayName(post.originalPost.user)}</span>
              )}
            </div>
            {post.originalPost.content && <p className="text-sm text-[var(--muted-foreground)] whitespace-pre-wrap">{post.originalPost.content}</p>}
            {resolveMediaUrl(post.originalPost.mediaUrl) && (
              <img src={resolveMediaUrl(post.originalPost.mediaUrl) ?? ''} alt="" className="mt-2 w-full max-h-80 object-cover rounded-lg" loading="lazy" />
            )}
          </div>
        </div>
      )}
      {post.linkUrl && <div className="px-4"><LinkPreview url={post.linkUrl} title={post.linkTitle} description={post.linkDescription} image={post.linkImage} /></div>}
      {post.pollOptions && <div className="px-4"><PollDisplay postId={post.id} options={post.pollOptions} myVote={post.myVote} /></div>}
      {mediaUrl && (
        <div className="mt-3">
          {post.mediaType === 'video' ? (
            <video src={mediaUrl} controls className="w-full max-h-[480px] object-cover shadow-inner-soft" />
          ) : post.mediaUrls?.length > 1 ? (
            <div className="grid grid-cols-2 gap-1">
              {post.mediaUrls.map((url: string, i: number) => (
                <img key={i} src={resolveMediaUrl(url) ?? ''} alt="" className="w-full h-48 object-cover hover:scale-105 transition-transform duration-300" />
              ))}
            </div>
          ) : (
            <img src={mediaUrl} alt="" className="w-full max-h-[600px] object-contain bg-[var(--muted)]/30 hover:scale-[1.02] transition-transform duration-300" loading="lazy" />
          )}
        </div>
      )}

      <div className="px-4 py-3 space-y-3">
        <ReactionDisplay postId={post.id} />
        <div className="flex items-center gap-4 pt-2 border-t border-[var(--border)]/40">
          <button onClick={() => setShowComments(!showComments)} className={cn(
            'flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-all duration-300 flex-1 justify-center',
            'hover:-translate-y-0.5 hover:shadow-soft',
            showComments ? 'bg-[var(--muted)] text-[var(--foreground)] shadow-soft' : 'text-[var(--muted-foreground)] hover:bg-[var(--muted)]/50'
          )}>
            <ChatCircle size={18} />
            تعليقات
          </button>
          {!isOwnPost && (
            <button onClick={() => setShowShareModal(true)} className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-[var(--muted-foreground)] hover:bg-[var(--muted)]/50 hover:-translate-y-0.5 hover:shadow-soft transition-all duration-300 flex-1 justify-center">
              <ShareNetwork size={18} />
              مشاركة
            </button>
          )}
        </div>
      </div>
      {showComments && <div className="px-4 pb-4"><CommentSection postId={post.id} myUserId={myUserId} isOwnPost={isOwnPost} /></div>}
      
      <ShareModal isOpen={showShareModal} onClose={() => setShowShareModal(false)} postId={post.id} postContent={post.content} />
      <EditPostModal isOpen={showEditModal} onClose={() => setShowEditModal(false)} post={post} />
    </article>
  );
}