'use client';
import Link from 'next/link';
import { createPortal } from 'react-dom';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useReactions, useToggleReaction, useComments, useAddComment, useSavePost, useSharePost, useHidePost, useDeletePost, useUpdatePost, useArchivePost } from '../hooks';
import { useDeleteComment } from '@/features/comments/hooks';
import { useMyProfile } from '@/features/profile/hooks';
import { useFriends } from '@/features/friends/hooks';
import { chatApi } from '@/features/chat/api';
import { apiClient } from '@/lib/api-client';
import { cn, displayName } from '@/lib/utils';
import { resolveMediaUrl } from '@/lib/media';
import { useToast } from '@/components/ui/Toast';
import { Modal } from '@/components/ui/Modal';
import { Avatar } from '@/components/ui/Avatar';
import { ChatCircle, ShareNetwork, MapPin, BookmarkSimple, EyeSlash, Clock, Trash, X, DotsThreeVertical, PaperPlaneTilt, PencilSimple, Archive } from '@phosphor-icons/react';

import { REACTIONS, ReactionPicker } from '@/features/reactions/ReactionPicker';
import { useT } from '@/i18n/I18nProvider';

// Splits post text into plain-text chunks and #hashtag/@mention/url tokens.
// Shared by renderWithHashtags() and truncateContent() so truncation always
// agrees with the tokens the renderer treats as atomic (#398).
const HASHTAG_MENTION_URL_RE = /(#[\p{L}0-9_]+|@[a-zA-Z0-9_]+|\bhttps?:\/\/[^\s<>"')]+)/gu;
const SPECIAL_TOKEN_RE = /^(#[\p{L}0-9_]+|@[a-zA-Z0-9_]+|https?:\/\/)/u;

// Turn #hashtags, @mentions, and URLs into interactive elements.
function renderWithHashtags(text: string) {
  if (!text) return text;
  const TRAILING = /[.,;:!?)]+$/;
  const parts = text.split(HASHTAG_MENTION_URL_RE);
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

const CONTENT_TRUNCATE_LIMIT = 280;

// Truncates near `limit` characters WITHOUT ever slicing a #hashtag,
// @mention, or URL token in half, and without cutting a plain word in half
// either -- backs off to the nearest earlier word boundary/token boundary
// instead (#398).
function truncateContent(text: string, limit: number): string {
  if (!text || text.length <= limit) return text;
  const tokens = text.split(HASHTAG_MENTION_URL_RE);
  let out = '';
  for (const token of tokens) {
    if (!token || out.length >= limit) break;
    const remaining = limit - out.length;
    if (token.length <= remaining) {
      out += token;
      continue;
    }
    // Token doesn't fully fit. A hashtag/mention/url is atomic -- drop it
    // whole rather than slice it; a plain-text chunk backs off to its last
    // whitespace within the remaining budget.
    if (SPECIAL_TOKEN_RE.test(token)) break;
    const slice = token.slice(0, remaining);
    const lastSpace = slice.lastIndexOf(' ');
    out += lastSpace > 0 ? slice.slice(0, lastSpace) : slice;
    break;
  }
  return out.replace(/\s+$/, '');
}

// Post content used to always render in full with no way to collapse a long
// post, forcing every reader to scroll past it (#398). Truncates to a
// preview with a "See More" toggle that expands the SAME rendered content
// (hashtags/mentions/links stay clickable in both states) in place -- no
// navigation, just local component state.
function PostContent({ content, className }: { content: string; className?: string }) {
  const { t } = useT();
  const [expanded, setExpanded] = useState(false);
  if (!content) return null;
  const isLong = content.length > CONTENT_TRUNCATE_LIMIT;
  const shown = !isLong || expanded ? content : truncateContent(content, CONTENT_TRUNCATE_LIMIT);

  return (
    <>
      <p dir="auto" className={className}>
        {renderWithHashtags(shown)}
        {isLong && !expanded && '…'}
      </p>
      {isLong && (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); setExpanded((v) => !v); }}
          className="mt-1 text-xs font-semibold underline opacity-90 hover:opacity-100 transition-opacity"
        >
          {expanded ? t('post.content.seeLess') : t('post.content.seeMore')}
        </button>
      )}
    </>
  );
}

function timeAgo(date: string | Date, t: (key: string, vars?: Record<string, string | number>) => string, locale: string) {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return t('post.time.now');
  if (mins < 60) return t('post.time.minutesAgo', { mins });
  const hours = Math.floor(mins / 60);
  if (hours < 24) return t('post.time.hoursAgo', { hours });
  const days = Math.floor(hours / 24);
  if (days < 7) return t('post.time.daysAgo', { days });
  return new Date(date).toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en-US');
}

function ReactionDisplay({ postId }: { postId: string }) {
  const { t } = useT();
  const { data } = useReactions(postId);
  const toggle = useToggleReaction();
  const [showPicker, setShowPicker] = useState(false);
  const [showBreakdown, setShowBreakdown] = useState(false);
  const reactionBtnRef = useRef<HTMLButtonElement>(null);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressFiredRef = useRef(false);

  const reactionData = data?.data;
  const counts: Record<string, number> = reactionData?.counts ?? {};
  const userReaction = reactionData?.userReaction as string | undefined;
  const total: number = reactionData?.total ?? 0;
  const reactionList: any[] = reactionData?.reactions ?? [];

  useEffect(() => () => {
    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    if (longPressTimeoutRef.current) clearTimeout(longPressTimeoutRef.current);
  }, []);

  // Opening required a full click, and (see ReactionPicker.tsx) it rendered
  // anchored to the wrong element in the app's default RTL layout (#388).
  // Hovering the button now reveals the picker immediately; leaving it
  // schedules a short-delayed close so the cursor has time to travel onto
  // the (portaled) picker itself, which cancels the pending close below.
  const openPicker = () => {
    if (closeTimeoutRef.current) { clearTimeout(closeTimeoutRef.current); closeTimeoutRef.current = null; }
    setShowPicker(true);
  };
  const scheduleClosePicker = () => {
    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    closeTimeoutRef.current = setTimeout(() => setShowPicker(false), 250);
  };
  const closePicker = () => {
    if (closeTimeoutRef.current) { clearTimeout(closeTimeoutRef.current); closeTimeoutRef.current = null; }
    setShowPicker(false);
  };

  // Touch has no hover -- long-pressing the button is the equivalent reveal
  // gesture. The trailing click that follows a touch release must NOT also
  // toggle the reaction underneath the freshly-opened picker.
  const handleTouchStart = () => {
    longPressFiredRef.current = false;
    longPressTimeoutRef.current = setTimeout(() => {
      longPressFiredRef.current = true;
      openPicker();
    }, 450);
  };
  const handleTouchEnd = () => {
    if (longPressTimeoutRef.current) { clearTimeout(longPressTimeoutRef.current); longPressTimeoutRef.current = null; }
  };

  // A plain click no longer opens any menu -- it immediately toggles the
  // default Like reaction (or removes/switches the viewer's existing
  // reaction, same semantics the backend already applies for a repeated
  // toggle of the same type) (#388).
  const handleClick = () => {
    if (longPressFiredRef.current) { longPressFiredRef.current = false; return; }
    toggle.mutate({ postId, type: userReaction ?? 'like' });
  };

  // Previously fell back to the most-picked reaction type across ALL users
  // whenever the viewer had no reaction of their own, which visually read as
  // the viewer having reacted with whatever was globally popular (e.g. an
  // all-Love post highlighted the button as "loved" for someone who never
  // reacted at all), and that phantom reaction was never actually counted
  // as theirs either (#397). The active/highlighted state must reflect ONLY
  // the current viewer's own reaction; no reaction means the neutral
  // default appearance.
  const currentReaction = REACTIONS.find(r => r.type === userReaction);
  const defaultEmoji = '👍';

  return (
    <div className="relative">
      <div className="flex items-center gap-1">
        <button
          ref={reactionBtnRef}
          onClick={handleClick}
          onMouseEnter={openPicker}
          onMouseLeave={scheduleClosePicker}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onTouchCancel={handleTouchEnd}
          className={cn(
            'flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-300 active:scale-95',
            'hover:-translate-y-0.5 hover:shadow-soft',
            currentReaction ? `${currentReaction.activeBg} ${currentReaction.activeText}` : 'bg-[var(--muted)]/60 text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]'
          )}
        >
          <span className="text-base">{currentReaction?.emoji || defaultEmoji}</span>
          <span>{currentReaction?.label || t('post.reaction.like')}</span>
        </button>
        {/* Was a single blended total with no per-type breakdown at all --
            users had no way to tell a Like from a Love without opening the
            modal (#330). Show up to 3 top reaction-type emoji+count pairs
            inline; still opens the full breakdown modal on click. */}
        {total > 0 && (
          <button
            onClick={() => setShowBreakdown(true)}
            className="flex items-center gap-1.5 text-xs text-[var(--muted-foreground)] font-medium shadow-soft rounded-full px-2 py-0.5 hover:bg-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
          >
            {Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([type, count]) => (
              <span key={type} className="flex items-center gap-0.5">
                <span>{REACTIONS.find(r => r.type === type)?.emoji ?? '👍'}</span>
                <span>{count}</span>
              </span>
            ))}
            {Object.keys(counts).length > 3 && <span>+{total - Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 3).reduce((s, [, c]) => s + c, 0)}</span>}
          </button>
        )}
      </div>
      {showPicker && (
        <div onMouseEnter={openPicker} onMouseLeave={scheduleClosePicker}>
          <ReactionPicker onSelect={(type) => toggle.mutate({ postId, type })} onClose={closePicker} anchorRef={reactionBtnRef} />
        </div>
      )}
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
  const { t } = useT();
  const [activeTab, setActiveTab] = useState<'all' | string>('all');
  const presentTypes = REACTIONS.filter(r => counts[r.type] > 0);
  const filtered = activeTab === 'all' ? reactions : reactions.filter(r => r.type === activeTab);

  return (
    <Modal open onClose={onClose} title={t('post.reaction.title')}>
      <div className="space-y-3">
        <div className="flex gap-2 flex-wrap border-b border-[var(--border)] pb-2">
          <button
            onClick={() => setActiveTab('all')}
            className={cn('px-3 py-1.5 rounded-full text-xs font-semibold transition-colors', activeTab === 'all' ? 'bg-[var(--muted)] text-[var(--foreground)]' : 'text-[var(--muted-foreground)] hover:bg-[var(--muted)]/50')}
          >
            {t('post.reaction.allCount', { count: reactions.length })}
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
            <p className="text-sm text-[var(--muted-foreground)] text-center py-6">{t('post.reaction.none')}</p>
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

// Owner-only voter breakdown per poll option -- the poll UI only ever showed
// a blended percentage with no way to see who voted for what (#326).
function PollVotersModal({ postId, onClose }: { postId: string; onClose: () => void }) {
  const { t } = useT();
  const { data, isLoading } = useQuery({
    queryKey: ['poll-voters', postId],
    queryFn: () => apiClient.get(`/posts/${postId}/poll/voters`).then((r) => r.data),
  });
  const options: { text: string; votes: number; voters: any[] }[] = data?.data ?? [];

  return (
    <Modal open onClose={onClose} title={t('post.poll.votersTitle')}>
      {isLoading ? (
        <p className="text-sm text-[var(--muted-foreground)] text-center py-6">{t('post.loading')}</p>
      ) : (
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {options.map((opt, i) => (
            <div key={i}>
              <p className="text-sm font-bold text-[var(--foreground)] mb-2">{opt.text} ({opt.votes})</p>
              {opt.voters.length === 0 ? (
                <p className="text-xs text-[var(--muted-foreground)]">{t('post.poll.noVoters')}</p>
              ) : (
                <div className="space-y-1.5">
                  {opt.voters.map((v: any) => (
                    <Link key={v.id} href={v.username ? `/${v.username}` : `/profile/${v.id}`} onClick={onClose}
                      className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-[var(--muted)]/50 transition-colors">
                      <Avatar src={v.avatarUrl} name={v.name} size="sm" />
                      <span className="text-sm text-[var(--foreground)]">{v.name}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
}

function CommentSection({ postId, myUserId, isOwnPost }: { postId: string; myUserId?: string; isOwnPost?: boolean }) {
  const { t, locale } = useT();
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
      onError: (err: any) => showToast(err?.response?.data?.message || t('post.comment.deleteError'), 'error'),
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
                  <span className="text-[10px] text-[var(--muted-foreground)]">{timeAgo(c.createdAt, t, locale)}</span>
                  {(isOwnPost || (!!myUserId && c.user?.id === myUserId)) && (
                    <button
                      onClick={() => handleDeleteComment(c.id)}
                      disabled={deleteComment.isPending}
                      aria-label={t('post.comment.deleteAria')}
                      className="mr-auto opacity-0 group-hover:opacity-100 transition-opacity text-[var(--muted-foreground)] hover:text-[var(--destructive)] disabled:opacity-40"
                    >
                      <Trash size={13} />
                    </button>
                  )}
                </div>
                <p className="text-sm text-[var(--foreground)] mt-0.5 leading-relaxed break-words">{c.content}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-4 mb-3">
          <ChatCircle size={32} className="text-[var(--muted-foreground)] mb-1" />
          <p className="text-xs text-[var(--muted-foreground)]">{t('post.comment.empty')}</p>
        </div>
      )}
      <form onSubmit={handleSubmit} className="flex gap-2 items-center">
        {/* Was a hardcoded static "أ" placeholder, never the signed-in
            user's real avatar (#265). */}
        <Avatar src={myProfile?.avatarUrl} name={myProfile?.fullName} size="sm" className="shadow-soft" />
        <input type="text" value={text} onChange={(e) => setText(e.target.value)} placeholder={t('post.comment.placeholder')}
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
  const { t } = useT();
  const [content, setContent] = useState('');
  const [mode, setMode] = useState<'feed' | 'friend'>('feed');
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
    <Modal open={isOpen} onClose={onClose} title={t('post.share.title')}>
      {/* Only offered "share to my feed" with no way to send directly to a
          friend in chat -- the only alternative was external apps (#157). */}
      <div className="flex gap-2 mb-4 border-b border-[var(--border)] pb-2">
        <button onClick={() => setMode('feed')} className={cn('px-3 py-1.5 rounded-full text-xs font-semibold transition-colors', mode === 'feed' ? 'bg-[var(--muted)] text-[var(--foreground)]' : 'text-[var(--muted-foreground)] hover:bg-[var(--muted)]/50')}>
          {t('post.share.toFeed')}
        </button>
        <button onClick={() => setMode('friend')} className={cn('px-3 py-1.5 rounded-full text-xs font-semibold transition-colors', mode === 'friend' ? 'bg-[var(--muted)] text-[var(--foreground)]' : 'text-[var(--muted-foreground)] hover:bg-[var(--muted)]/50')}>
          {t('post.share.toFriend')}
        </button>
      </div>
      {mode === 'feed' ? (
        <>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={t('post.share.placeholder')}
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
                showToast(t('post.share.success'), 'success');
                onClose();
              } catch {
                showToast(t('post.share.error'), 'error');
              }
            }}
            disabled={sharePost.isPending}
            className="w-full py-3 rounded-xl text-[var(--card)] font-medium hover:shadow-glow-lg disabled:opacity-40 transition-all hover:-translate-y-0.5 duration-300"
            style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)' }}
          >
            {sharePost.isPending ? t('post.share.posting') : t('post.share.submit')}
          </button>
        </>
      ) : (
        <SendToFriendPicker postId={postId} onSent={onClose} />
      )}
    </Modal>
  );
}

// "Send to a friend" -- there was no way to share a post directly into a
// chat with a specific friend, only external apps or reposting to your own
// feed (#157). Sends a message containing the post's permalink, which
// already renders as a rich link-preview card in chat.
function SendToFriendPicker({ postId, onSent }: { postId: string; onSent: () => void }) {
  const { t } = useT();
  const { data: friendsData, isLoading } = useFriends();
  const { showToast } = useToast() as any;
  const [sendingTo, setSendingTo] = useState<string | null>(null);
  const friends: any[] = friendsData?.data ?? [];

  const handleSend = async (friendId: string) => {
    setSendingTo(friendId);
    try {
      const conv = await chatApi.createConversation(friendId);
      const conversationId = conv?.data?.id ?? conv?.id;
      const url = `${window.location.origin}/posts/${postId}`;
      await chatApi.sendMessage(conversationId, url);
      showToast(t('post.share.sendSuccess'), 'success');
      onSent();
    } catch {
      showToast(t('post.share.sendError'), 'error');
    } finally {
      setSendingTo(null);
    }
  };

  if (isLoading) return <p className="text-sm text-[var(--muted-foreground)] text-center py-6">{t('post.loading')}</p>;
  if (friends.length === 0) return <p className="text-sm text-[var(--muted-foreground)] text-center py-6">{t('post.share.noFriends')}</p>;

  return (
    <div className="space-y-1.5 max-h-72 overflow-y-auto">
      {friends.map((f: any) => (
        <div key={f.id} className="flex items-center justify-between gap-3 p-2 rounded-xl hover:bg-[var(--muted)]/50 transition-colors">
          <div className="flex items-center gap-3">
            <Avatar src={f.avatar ?? f.profile?.avatarUrl} name={f.fullName || f.username} size="sm" />
            <span className="text-sm font-medium text-[var(--foreground)]">{f.fullName || f.username}</span>
          </div>
          <button
            onClick={() => handleSend(f.id)}
            disabled={sendingTo === f.id}
            className="rounded-xl px-3 py-1.5 text-xs font-bold text-white transition-all disabled:opacity-50"
            style={{ background: 'var(--primary)' }}
          >
            {sendingTo === f.id ? '...' : t('post.share.send')}
          </button>
        </div>
      ))}
    </div>
  );
}

function EditPostModal({ isOpen, onClose, post }: { isOpen: boolean; onClose: () => void; post: any }) {
  const { t } = useT();
  const [content, setContent] = useState(post.content || '');
  const updatePost = useUpdatePost();
  const { showToast } = useToast() as any;

  // Same hand-rolled `fixed inset-0` bug as ShareModal above (#243) -- this
  // one was never migrated when ShareModal got fixed for #95/#106. A hover
  // transform on the ancestor <article> made this dialog's position depend
  // on whether the cursor happened to be over the card when it opened.
  return (
    <Modal open={isOpen} onClose={onClose} title={t('post.edit.title')}>
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
            showToast(t('post.edit.success'), 'success');
            onClose();
          } catch {
            showToast(t('post.edit.error'), 'error');
          }
        }}
        disabled={updatePost.isPending || !content.trim()}
        className="w-full py-3 rounded-xl text-[var(--card)] font-medium hover:shadow-glow-lg disabled:opacity-40 transition-all duration-300"
        style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)' }}
      >
        {updatePost.isPending ? t('post.edit.saving') : t('post.edit.save')}
      </button>
    </Modal>
  );
}

function PostMenu({ postId, post, isOwnPost, savePost, onClose, onEdit, onHide, anchorRef }: { postId: string; post: any; isOwnPost?: boolean; savePost: ReturnType<typeof useSavePost>; onClose: () => void; onEdit?: () => void; onHide?: () => void; anchorRef: React.RefObject<HTMLButtonElement> }) {
  const { t } = useT();
  const { showToast } = useToast() as any;
  // The dropdown used to be a plain absolutely-positioned div nested inside
  // the post <article>, which has overflow-hidden -- any menu near a
  // viewport/container edge (very common on the narrower Profile -> Posts
  // tab layout) got clipped (#241). Render it through a portal at fixed
  // coordinates computed from the trigger button instead.
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  // w-56 below.
  const MENU_WIDTH = 224;
  useEffect(() => {
    const rect = anchorRef.current?.getBoundingClientRect();
    if (rect) {
      // Was anchored purely from the viewport's right edge (`right: innerWidth
      // - rect.right`), which stays on-screen when the trigger sits near the
      // right edge but overflows off the LEFT edge whenever it doesn't --
      // including the common case of a 3-dot button positioned near the left
      // in this app's default RTL layout, or any menu near the narrower
      // Profile -> Posts tab column (#412). Compute an explicit `left` and
      // clamp it to the viewport on both sides instead.
      let left = rect.right - MENU_WIDTH;
      left = Math.min(left, window.innerWidth - MENU_WIDTH - 8);
      left = Math.max(left, 8);
      setCoords({ top: rect.bottom + 8, left });
    }
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
  const archivePost = useArchivePost();

  const menuItems = [
    ...(isOwnPost && onEdit ? [{ label: t('post.edit.title'), icon: PencilSimple, action: () => { onEdit(); } }] : []),
    { label: t('post.menu.save'), icon: BookmarkSimple, action: () => savePost.mutate(postId) },
    ...(isOwnPost ? [
      // Pin/unpin uses the MapPin (pushpin) icon. It persists via PATCH /posts
      // (isPinned is whitelisted) and reorders the feed; the toast makes the
      // action visibly responsive instead of feeling dead (#11).
      { label: post.isPinned ? t('post.menu.unpin') : t('post.menu.pin'), icon: MapPin, action: () => pinPost.mutate({ postId, data: { isPinned: !post.isPinned } }, { onSuccess: () => showToast(post.isPinned ? t('post.menu.unpinSuccess') : t('post.menu.pinSuccess'), 'success') }) },
      // Archive: POST /posts/:postId/archive (toggle). Excludes the post from
      // the main feed/profile queries; visible again from the new /archive
      // page (#416).
      { label: t('post.menu.archive'), icon: Archive, action: () => archivePost.mutate(postId, { onSuccess: () => { showToast(t('post.menu.archiveSuccess'), 'success'); onHide?.(); } }) },
      // (#12) Removed the duplicate Bookmark "أرشفة المنشور" item: it reused the
      // same icon as "حفظ المنشور" and was dead — isArchived isn't a whitelisted
      // CreatePostDto field, so the global ValidationPipe stripped it and the
      // PATCH did nothing.
      { label: t('post.menu.delete'), icon: Trash, action: () => deletePost.mutate(postId, { onSuccess: () => { showToast(t('post.menu.deleteSuccess'), 'success'); onHide?.(); } }), danger: true },
    ] : [
      { label: t('post.menu.notInterested'), icon: EyeSlash, action: () => hidePost.mutate({ postId, hideType: 'not_interested' }, { onSuccess: () => { showToast(t('post.menu.notInterestedSuccess'), 'success'); onHide?.(); } }) },
      { label: t('post.menu.snooze'), icon: Clock, action: () => hidePost.mutate({ postId, hideType: 'snooze', snoozeDays: 30 }, { onSuccess: () => { showToast(t('post.menu.snoozeSuccess'), 'success'); onHide?.(); } }) },
    ]),
  ];

  if (!coords) return null;

  return createPortal(
    <div
      ref={menuRef}
      // overflow-hidden -- without it, a hovered item's sharp-cornered
      // background bled past the container's own rounded-xl corners at the
      // top/bottom, reading as an inconsistent border radius (#222).
      className="fixed w-56 bg-[var(--card)] rounded-xl shadow-glow-lg border border-[var(--border)]/60 py-2 animate-scale-in z-[60] overflow-hidden"
      style={{ top: coords.top, left: coords.left }}
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

function PollDisplay({ postId, options, myVote, isOwnPost }: { postId: string; options: { text: string; votes: number }[]; myVote?: number | null; isOwnPost?: boolean }) {
  const { t } = useT();
  const [showVoters, setShowVoters] = useState(false);
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
              {/* Only the blended percentage was ever shown, hiding the exact
                  vote count per option (#326). */}
              <span className="text-[var(--muted-foreground)] font-medium">{percentage}% ({opt.votes})</span>
            </div>
          </button>
        );
      })}
      <div className="flex items-center justify-center gap-2 pt-1">
        <p className="text-xs text-[var(--muted-foreground)] font-medium">{t('post.poll.voteCount', { count: totalVotes })}</p>
        {isOwnPost && totalVotes > 0 && (
          <button onClick={() => setShowVoters(true)} className="text-xs text-[var(--primary)] font-semibold hover:underline">
            {t('post.poll.showVoters')}
          </button>
        )}
      </div>
      {showVoters && <PollVotersModal postId={postId} onClose={() => setShowVoters(false)} />}
    </div>
  );
}

// Each PostCard tracked its own `showMenu` state with zero coordination
// between cards, so opening a second post's menu never closed the first
// one -- multiple menus stayed open simultaneously (#221). A single shared
// event lets every card close itself when a DIFFERENT card's menu opens.
const POST_MENU_OPENED_EVENT = 'post-menu-opened';

export function PostCard({ post, showGroupLink = true }: { post: any; showGroupLink?: boolean }) {
  const { t, locale } = useT();
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
    onSuccess: () => showToast(t('post.save.success'), 'success'),
    onError: (err: any) => showToast(err?.response?.data?.message === 'Already saved' ? t('post.save.alreadySaved') : t('post.save.error'), 'error'),
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
            {post.feeling && <span className="text-xs text-[var(--muted-foreground)] font-medium">{t('post.feelingLabel', { feeling: post.feeling })}</span>}
            {showGroupLink && post.group?.name && <><span className="text-xs text-[var(--muted-foreground)]">{t('post.inGroupPrefix')}</span><a href={`/groups/${post.group.id}`} className="text-xs font-semibold text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:underline hover:shadow-soft px-1 rounded transition-all">{post.group.name}</a></>}
            {/* Pinning had a working mutation but no visible effect anywhere
                -- neither a badge here nor a sort change on the Profile Posts
                tab, so it looked completely dead (#400). */}
            {post.isPinned && (
              <span className="flex items-center gap-1 text-xs font-semibold text-[var(--primary)]">
                <MapPin size={12} weight="fill" />
                {t('post.pinned')}
              </span>
            )}
          </div>
          <p className="text-[11px] text-[var(--muted-foreground)]">
            {timeAgo(post.createdAt, t, locale)}
            {post.editedAt && <span className="mr-1">{t('post.edited')}</span>}
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
            <PostContent content={post.content} className="text-lg text-[var(--card)] font-medium whitespace-pre-wrap" />
          </div>
        </div>
      ) : (
        <div className="px-4 py-3">
          <PostContent content={post.content} className="text-sm text-[var(--foreground)]/85 leading-relaxed whitespace-pre-wrap" />
        </div>
      )}
      {isShared && post.originalPost && (
        <div className="px-4 pt-1 pb-2">
          <div className="p-3 rounded-xl bg-[var(--muted)] border border-[var(--border)]/40 shadow-card-hover transition-all duration-300 hover:shadow-glow">
            <div className="flex items-center gap-2 mb-2">
              {/* Always rendered the initials circle, never the original
                  author's real avatar even when one existed (#413) -- same
                  resolveMediaUrl() pattern the primary post author avatar
                  above uses, initials-only as the no-picture fallback. */}
              <div className="h-6 w-6 shrink-0 rounded-full overflow-hidden bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] text-[var(--card)] text-xs flex items-center justify-center shadow-soft">
                {resolveMediaUrl(post.originalPost.user?.profile?.avatarUrl) ? (
                  <img src={resolveMediaUrl(post.originalPost.user?.profile?.avatarUrl) ?? ''} alt={displayName(post.originalPost.user)} className="h-full w-full object-cover" />
                ) : (
                  displayName(post.originalPost.user).charAt(0)
                )}
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
      {post.pollOptions && <div className="px-4"><PollDisplay postId={post.id} options={post.pollOptions} myVote={post.myVote} isOwnPost={isOwnPost} /></div>}
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
            {t('post.comments')}
          </button>
          {!isOwnPost && (
            <button onClick={() => setShowShareModal(true)} className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-[var(--muted-foreground)] hover:bg-[var(--muted)]/50 hover:-translate-y-0.5 hover:shadow-soft transition-all duration-300 flex-1 justify-center">
              <ShareNetwork size={18} />
              {t('post.share.submit')}
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