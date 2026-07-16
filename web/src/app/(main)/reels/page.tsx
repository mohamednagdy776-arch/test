'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createPortal } from 'react-dom';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Heart, ChatCircle, ShareFat, DotsThreeVertical, SpeakerHigh, SpeakerSlash, Plus, Flag, LinkSimple, PaperPlaneTilt } from '@phosphor-icons/react';
import { resolveMediaUrl } from '@/lib/media';
// Reels are just Video entities with isReel=true (see ReelsController /
// VideosController in backend/src/videos), so the existing video
// comments/reactions endpoints (GET/POST /videos/:id/comments) already work
// for a reel id -- reuse those hooks instead of inventing a parallel API.
import { useVideoComments, useAddVideoComment } from '@/features/videos/hooks';
import { Avatar } from '@/components/ui/Avatar';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { useT } from '@/i18n/I18nProvider';

interface Reel {
  id: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  caption?: string;
  content?: string;
  likesCount?: number;
  commentsCount?: number;
  user?: { username?: string; displayName?: string; firstName?: string; lastName?: string };
}

// Comments panel for a reel (#434). No comments UI existed at all -- the
// button had no onClick. Reuses the video comments hooks (GET/POST
// /videos/:id/comments) since a reel IS a video row, and the shared Modal
// component (portal to document.body) for consistent stacking-context-safe
// positioning, same as PostCard's CommentSection/ShareModal.
function ReelCommentsModal({ reel, onClose }: { reel: Reel; onClose: () => void }) {
  const { t } = useT();
  const { showToast } = useToast();
  const [text, setText] = useState('');
  const { data, isLoading } = useVideoComments(reel.id);
  const addComment = useAddVideoComment();
  const comments: any[] = data?.data ?? [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    const content = text.trim();
    setText('');
    addComment.mutate(
      { videoId: reel.id, content },
      { onError: () => showToast(t('reel.comment.error'), 'error') },
    );
  };

  return (
    <Modal open onClose={onClose} title={t('reel.comment.title')}>
      <div className="space-y-4">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="flex gap-3">
                <div className="h-8 w-8 rounded-full bg-[var(--muted)] animate-pulse" />
                <div className="flex-1 h-12 bg-[var(--muted)] rounded-2xl animate-pulse" />
              </div>
            ))}
          </div>
        ) : comments.length === 0 ? (
          <p className="text-sm text-[var(--muted-foreground)] text-center py-6">{t('reel.comment.empty')}</p>
        ) : (
          <div className="space-y-3 max-h-80 overflow-y-auto scrollbar-thin">
            {comments.map((c: any) => (
              <div key={c.id} className="flex gap-3">
                <Avatar src={c.user?.avatarUrl} name={c.user?.name} size="sm" />
                <div className="flex-1 rounded-2xl px-4 py-2.5" style={{ backgroundColor: 'var(--muted)' }}>
                  <p className="text-xs font-bold text-[var(--foreground)]">{c.user?.name ?? t('reel.comment.defaultUser')}</p>
                  <p className="text-sm text-[var(--foreground)] mt-0.5 leading-relaxed break-words">{c.content}</p>
                </div>
              </div>
            ))}
          </div>
        )}
        <form onSubmit={handleSubmit} className="flex gap-2 items-center">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={t('reel.comment.placeholder')}
            className="flex-1 rounded-full border border-[var(--border)] bg-[var(--muted)] px-4 py-2.5 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]/20 focus:border-[var(--ring)] transition-all duration-300"
          />
          <button
            type="submit"
            disabled={!text.trim() || addComment.isPending}
            aria-label={t('reel.comment.send')}
            className="h-9 w-9 shrink-0 rounded-full text-[var(--card)] flex items-center justify-center disabled:opacity-40 transition-all duration-300 active:scale-95"
            style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)' }}
          >
            <PaperPlaneTilt size={18} />
          </button>
        </form>
      </div>
    </Modal>
  );
}

// Report dialog for a reel (#436, part of the three-dot menu). Posts a
// generic content report the same way the existing /watch/[id] video player
// does (POST /reports with entityType: 'video') -- there's no reel-specific
// report endpoint, but a reel id IS a video id so the existing one applies.
function ReportReelModal({ reel, isOpen, onClose }: { reel: Reel; isOpen: boolean; onClose: () => void }) {
  const { t } = useT();
  const { showToast } = useToast();
  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');
  const [loading, setLoading] = useState(false);

  const reasons = [
    { id: 'inappropriate', label: t('reel.report.reason.inappropriate') },
    { id: 'harassment', label: t('reel.report.reason.harassment') },
    { id: 'scam', label: t('reel.report.reason.scam') },
    { id: 'off_platform', label: t('reel.report.reason.spam') },
    { id: 'other', label: t('reel.report.reason.other') },
  ];

  const handleClose = () => {
    setReason('');
    setDetails('');
    onClose();
  };

  const handleSubmit = async () => {
    if (!reason) return;
    setLoading(true);
    try {
      await apiClient.post('/reports', {
        entityType: 'video',
        entityId: reel.id,
        reason,
        details: details.trim() || undefined,
      });
      showToast(t('reel.report.success'), 'success');
      handleClose();
    } catch {
      showToast(t('reel.report.error'), 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={isOpen} onClose={handleClose} title={t('reel.report.title')}>
      <div className="space-y-4">
        <div className="space-y-2">
          {reasons.map((r) => (
            <button
              key={r.id}
              onClick={() => setReason(r.id)}
              className={`w-full text-right px-4 py-2.5 rounded-xl text-sm border transition-all ${
                reason === r.id
                  ? 'border-[var(--destructive)]/50 bg-[var(--destructive)]/10 text-[var(--destructive)] font-semibold'
                  : 'border-[var(--border)] bg-[var(--muted)] text-[var(--foreground)] hover:border-[var(--border)]'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
        {reason === 'other' && (
          <textarea
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            placeholder={t('reel.report.detailsPlaceholder')}
            rows={3}
            maxLength={500}
            className="w-full px-3 py-2.5 rounded-xl text-sm outline-none resize-none"
            style={{ backgroundColor: 'var(--muted)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
          />
        )}
        <div className="flex gap-3 pt-1">
          <button onClick={handleClose} className="flex-1 px-4 py-2.5 rounded-xl text-sm border border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors">
            {t('reel.report.cancel')}
          </button>
          <button
            onClick={handleSubmit}
            disabled={!reason || loading}
            className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold bg-[var(--destructive)] text-white hover:bg-[var(--destructive)]/90 disabled:opacity-50 transition-colors"
          >
            {loading ? '...' : t('reel.report.submit')}
          </button>
        </div>
      </div>
    </Modal>
  );
}

// Three-dot "more options" dropdown (#436). No onClick existed at all before.
// Rendered through a portal at fixed coordinates computed from the trigger
// button, same overflow-safe pattern PostCard.tsx's PostMenu uses for #241 --
// anchored above/right of the button since it sits near the bottom of a
// fullscreen viewport here, not below it.
function ReelMenu({
  reel,
  onClose,
  anchorRef,
  onReport,
}: {
  reel: Reel;
  onClose: () => void;
  anchorRef: React.RefObject<HTMLButtonElement>;
  onReport: () => void;
}) {
  const { t } = useT();
  const { showToast } = useToast();
  const [coords, setCoords] = useState<{ bottom: number; right: number } | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const rect = anchorRef.current?.getBoundingClientRect();
    if (rect) setCoords({ bottom: window.innerHeight - rect.top + 8, right: window.innerWidth - rect.right });
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (anchorRef.current?.contains(target) || menuRef.current?.contains(target)) return;
      onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCopyLink = async () => {
    const url = `${window.location.origin}/watch/${reel.id}`;
    try {
      await navigator.clipboard.writeText(url);
      showToast(t('reel.menu.linkCopied'), 'success');
    } catch {
      showToast(t('reel.share.error'), 'error');
    }
    onClose();
  };

  if (!coords) return null;

  return createPortal(
    <div
      ref={menuRef}
      className="fixed w-52 bg-[var(--card)] rounded-xl shadow-glow-lg border border-[var(--border)]/60 py-2 animate-scale-in z-[60] overflow-hidden"
      style={{ bottom: coords.bottom, right: coords.right }}
    >
      <button
        onClick={() => { onReport(); onClose(); }}
        className="w-full px-4 py-2.5 text-right text-sm hover:bg-[var(--muted)] flex items-center gap-3 text-[var(--destructive)] transition-all duration-200"
      >
        <Flag size={18} weight="fill" />
        {t('reel.menu.report')}
      </button>
      <button
        onClick={handleCopyLink}
        className="w-full px-4 py-2.5 text-right text-sm hover:bg-[var(--muted)] flex items-center gap-3 text-[var(--foreground)] transition-all duration-200"
      >
        <LinkSimple size={18} />
        {t('reel.menu.copyLink')}
      </button>
    </div>,
    document.body,
  );
}

function ReelCard({ reel, isActive }: { reel: Reel; isActive: boolean }) {
  const { t } = useT();
  const { showToast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(reel.likesCount ?? 0);
  // Start muted (autoplay-without-gesture browser policy) with a toggle to
  // unmute, same pattern as StoryViewer.tsx — Reels had no way to hear audio
  // at all (#155).
  const [isMuted, setIsMuted] = useState(true);
  // Comment/share/more-options were all dead buttons with no onClick and the
  // username had no profile link at all (#433-#437).
  const [showComments, setShowComments] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showReport, setShowReport] = useState(false);

  useEffect(() => {
    if (!videoRef.current) return;
    if (isActive) {
      videoRef.current.play().catch(() => {});
    } else {
      videoRef.current.pause();
    }
  }, [isActive]);

  // React's `muted` prop is unreliable after mount — sync imperatively.
  useEffect(() => {
    if (videoRef.current) videoRef.current.muted = isMuted;
  }, [isMuted]);

  const handleLike = () => {
    setLiked((v) => !v);
    setLikes((v) => (liked ? v - 1 : v + 1));
  };

  // Share (#435): native share sheet where available, else copy the video
  // player permalink to the clipboard -- there is no /reels/:id page, but
  // /watch/:id already plays any video by id (a reel is just a video row),
  // same fallback pattern already used for videos on /watch/[id]/page.tsx.
  const handleShare = async () => {
    const url = `${window.location.origin}/watch/${reel.id}`;
    if (typeof navigator !== 'undefined' && (navigator as any).share) {
      try {
        await (navigator as any).share({ url });
      } catch {
        // user cancelled the native share sheet -- not an error
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      showToast(t('reel.share.copied'), 'success');
    } catch {
      showToast(t('reel.share.error'), 'error');
    }
  };

  const caption = reel.caption ?? reel.content ?? '';
  const authorName =
    reel.user?.displayName ??
    [reel.user?.firstName, reel.user?.lastName].filter(Boolean).join(' ') ??
    reel.user?.username ??
    'مستخدم';

  return (
    <div className="relative w-full h-screen bg-black snap-start flex-shrink-0">
      {reel.videoUrl ? (
        <video
          ref={videoRef}
          src={resolveMediaUrl(reel.videoUrl) ?? ''}
          poster={resolveMediaUrl(reel.thumbnailUrl) ?? undefined}
          className="w-full h-full object-cover"
          loop
          muted={isMuted}
          playsInline
        />
      ) : (
        <div
          className="w-full h-full flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, var(--foreground), var(--primary))' }}
        >
          {reel.thumbnailUrl ? (
            <img src={resolveMediaUrl(reel.thumbnailUrl) ?? ''} alt="" className="w-full h-full object-cover" />
          ) : (
            <span className="text-6xl">🎬</span>
          )}
        </div>
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none" />

      <div className="absolute bottom-20 right-4 flex flex-col gap-5 items-center">
        <button onClick={handleLike} className="flex flex-col items-center gap-1">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center backdrop-blur-sm ${liked ? 'bg-[var(--destructive)]' : 'bg-black/40'}`}>
            <Heart size={24} weight={liked ? 'fill' : 'regular'} className="text-white" />
          </div>
          <span className="text-white text-xs font-semibold">{likes}</span>
        </button>

        <button onClick={() => setShowComments(true)} className="flex flex-col items-center gap-1">
          <div className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center">
            <ChatCircle size={24} className="text-white" />
          </div>
          <span className="text-white text-xs font-semibold">{reel.commentsCount ?? 0}</span>
        </button>

        <button onClick={handleShare} className="flex flex-col items-center gap-1">
          <div className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center">
            <ShareFat size={24} className="text-white" />
          </div>
          <span className="text-white text-xs font-semibold">{t('reel.share.label')}</span>
        </button>

        <button
          ref={menuButtonRef}
          onClick={() => setShowMenu((v) => !v)}
          aria-label={t('reel.menu.aria')}
          className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center"
        >
          <DotsThreeVertical size={24} className="text-white" />
        </button>
        {showMenu && (
          <ReelMenu reel={reel} onClose={() => setShowMenu(false)} anchorRef={menuButtonRef} onReport={() => setShowReport(true)} />
        )}

        {reel.videoUrl && (
          <button
            onClick={() => setIsMuted((v) => !v)}
            className="flex flex-col items-center gap-1"
            aria-label={isMuted ? 'تشغيل الصوت' : 'كتم الصوت'}
          >
            <div className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center">
              {isMuted ? (
                <SpeakerSlash size={24} className="text-white" />
              ) : (
                <SpeakerHigh size={24} className="text-white" />
              )}
            </div>
          </button>
        )}
      </div>

      <div className="absolute bottom-20 left-4 max-w-[65%]">
        {/* Was plain text with no way to reach the creator's profile (#437). */}
        {reel.user?.username ? (
          <Link href={`/${reel.user.username}`} className="text-white font-bold text-sm mb-1 block hover:underline w-fit">
            @{reel.user.username}
          </Link>
        ) : (
          <p className="text-white font-bold text-sm mb-1">@{authorName}</p>
        )}
        {caption && (
          <p className="text-white/90 text-sm leading-relaxed line-clamp-3">{caption}</p>
        )}
      </div>

      {showComments && <ReelCommentsModal reel={reel} onClose={() => setShowComments(false)} />}
      <ReportReelModal reel={reel} isOpen={showReport} onClose={() => setShowReport(false)} />
    </div>
  );
}

export default function ReelsPage() {
  const router = useRouter();
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['reels-feed'],
    queryFn: () => apiClient.get('/reels', { params: { page: 1, limit: 50 } }).then((r) => r.data),
    staleTime: 60_000,
  });

  const reels: Reel[] = data?.data ?? data?.videos ?? data?.items ?? [];

  const handleScroll = useCallback(() => {
    if (!containerRef.current) return;
    const { scrollTop, clientHeight } = containerRef.current;
    const idx = Math.round(scrollTop / clientHeight);
    setActiveIndex(idx);
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener('scroll', handleScroll, { passive: true });
    return () => el.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full border-4 border-[var(--ring)] border-t-transparent animate-spin mx-auto mb-4" />
          <p className="text-white text-sm">جار تحميل الريلز...</p>
        </div>
      </div>
    );
  }

  if (isError || reels.length === 0) {
    return (
      <div className="fixed inset-0 flex items-center justify-center" style={{ background: 'linear-gradient(135deg, var(--foreground), var(--primary))' }}>
        <div className="text-center text-white px-8">
          <div className="text-7xl mb-4">🎬</div>
          <h2 className="text-2xl font-bold mb-2">لا توجد ريلز حالياً</h2>
          <p className="text-white/70 text-sm mb-6">كن أول من ينشر مقطعاً قصيراً!</p>
          {/* No button anywhere let a user actually upload a reel (#367). */}
          <button
            onClick={() => router.push('/videos/upload?reel=1')}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold text-sm bg-white text-[var(--foreground)] hover:opacity-90 transition-opacity"
          >
            <Plus size={18} weight="bold" /> نشئ ريلز
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 overflow-y-scroll snap-y snap-mandatory"
      style={{ scrollbarWidth: 'none' }}
    >
      <button
        onClick={() => router.push('/videos/upload?reel=1')}
        aria-label="إنشاء ريل"
        className="fixed top-4 left-4 z-30 w-11 h-11 rounded-full bg-black/40 backdrop-blur-sm text-white flex items-center justify-center hover:bg-black/60 transition-colors"
      >
        <Plus size={22} weight="bold" />
      </button>
      {reels.map((reel, i) => (
        <ReelCard key={reel.id ?? i} reel={reel} isActive={i === activeIndex} />
      ))}
    </div>
  );
}
