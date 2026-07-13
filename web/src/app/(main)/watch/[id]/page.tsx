'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useVideo, useVideoComments, useAddVideoComment, useUpdateVideoComment, useDeleteVideoComment, useVideoReactions, useReactToVideo, useRecommendedVideos } from '@/features/videos/hooks';
import { Avatar } from '@/components/ui/Avatar';
import { Spinner } from '@/components/ui/Spinner';
import { Modal } from '@/components/ui/Modal';
import { resolveMediaUrl } from '@/lib/media';
import { getCurrentUserId } from '@/lib/socket-client';
import { PencilSimple, Trash, Check, X, Play, Pause } from '@phosphor-icons/react';
import { REACTIONS, ReactionPicker } from '@/features/reactions/ReactionPicker';

function VideoPlayer({ video }: { video: any }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  // isPlaying only ever reflects what the <video> element itself reports
  // via its own play/pause/waiting/ended events -- never set optimistically
  // from the click handler. Native `controls` used to freeze intermittently
  // on rapid clicks (#368); reading the DOM's real `.paused` state at click
  // time (instead of trusting a React state var that can go stale) and
  // swallowing a rejected play() promise (e.g. AbortError from an
  // interrupted play/pause race) keeps the UI from ever getting stuck.
  const [isPlaying, setIsPlaying] = useState(false);
  const [shared, setShared] = useState(false);
  const [saved, setSaved] = useState(false);
  const [savingVideo, setSavingVideo] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportDetails, setReportDetails] = useState('');
  const [reportSent, setReportSent] = useState(false);
  const [reportLoading, setReportLoading] = useState(false);
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const reactionPickerRef = useRef<HTMLDivElement>(null);
  const { data: reactionsData } = useVideoReactions(video?.id);
  const reactToVideo = useReactToVideo();
  const userReaction: string | null = reactionsData?.data?.userReaction ?? null;
  const reactionCounts: Record<string, number> = reactionsData?.data?.counts ?? {};
  const reactionTotal = Object.values(reactionCounts).reduce((s, n) => s + n, 0);
  const activeReaction = REACTIONS.find((r) => r.type === userReaction);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (reactionPickerRef.current && !reactionPickerRef.current.contains(e.target as Node)) setShowReactionPicker(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // The save button had no way to learn its own state, so refreshing the page
  // always showed "not saved" regardless of the real DB state (#133).
  useEffect(() => {
    if (!video?.id) return;
    let cancelled = false;
    (async () => {
      try {
        const { apiClient } = await import('@/lib/api-client');
        const res = await apiClient.get(`/saved/check/video/${video.id}`);
        if (!cancelled) setSaved(!!res.data?.data?.isSaved);
      } catch {
        // leave as not-saved on error
      }
    })();
    return () => { cancelled = true; };
  }, [video?.id]);

  const handleSave = async () => {
    setSavingVideo(true);
    try {
      const { apiClient } = await import('@/lib/api-client');
      await apiClient.post('/saved', { entityType: 'video', entityId: video.id });
      setSaved(true);
    } catch {
      // already saved or error — treat as success
      setSaved(true);
    } finally {
      setSavingVideo(false);
    }
  };

  const handleReport = async () => {
    if (!reportReason.trim()) return;
    setReportLoading(true);
    try {
      const { apiClient } = await import('@/lib/api-client');
      await apiClient.post('/reports', {
        entityType: 'video',
        entityId: video.id,
        reason: reportReason,
        details: reportDetails.trim() || undefined,
      });
      setReportSent(true);
      setTimeout(() => { setShowReport(false); setReportSent(false); setReportReason(''); setReportDetails(''); }, 2000);
    } catch {
      setShowReport(false);
    } finally {
      setReportLoading(false);
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title: video.title, url }).catch(() => {});
    } else {
      await navigator.clipboard.writeText(url);
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    }
  };

  const handleReact = (type: string) => {
    reactToVideo.mutate({ videoId: video.id, type });
  };

  const handleTogglePlay = () => {
    const el = videoRef.current;
    if (!el) return;
    if (el.paused) {
      el.play().catch((err) => {
        // AbortError etc. from a play() interrupted by a competing pause()
        // -- isPlaying is only ever driven by onPlay/onPause below, so a
        // rejected promise here can't leave the button stuck showing the
        // wrong icon.
        console.error('Video play() failed:', err);
      });
    } else {
      el.pause();
    }
  };

  const formatViews = (count: number) => {
    if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}م`;
    if (count >= 1_000) return `${(count / 1_000).toFixed(1)}الف`;
    return String(count);
  };

  return (
    <div className="space-y-4">
      <div className="relative aspect-video rounded-2xl overflow-hidden bg-black shadow-xl group">
        {video.url ? (
          <>
            <video
              ref={videoRef}
              src={resolveMediaUrl(video.url) ?? ''}
              className="w-full h-full"
              // .thumbnail is the raw storage key; resolveMediaUrl re-anchors
              // it onto the API origin, not the CDN the backend actually
              // serves it from (#274) -- .thumbnailUrl is already a full,
              // correct CDN URL.
              poster={video.thumbnailUrl ?? undefined}
              playsInline
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onWaiting={() => setIsPlaying(false)}
              onEnded={() => setIsPlaying(false)}
            />
            {/* Custom play/pause overlay replaces native `controls`, which
                could intermittently stop responding to clicks (#368).
                Always in the DOM (not conditionally rendered) so it's a
                stable click target; visibility/opacity is what changes. */}
            <button
              type="button"
              onClick={handleTogglePlay}
              aria-label={isPlaying ? 'إيقاف مؤقت' : 'تشغيل'}
              className={`absolute inset-0 flex items-center justify-center transition-colors duration-200 ${
                isPlaying
                  ? 'bg-transparent opacity-0 group-hover:opacity-100 group-hover:bg-black/10'
                  : 'bg-black/20 opacity-100'
              }`}
            >
              <span className="w-16 h-16 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center transition-transform duration-150 group-hover:scale-105">
                {isPlaying ? (
                  <Pause size={30} weight="fill" className="text-white" />
                ) : (
                  <Play size={30} weight="fill" className="text-white ms-0.5" />
                )}
              </span>
            </button>
          </>
        ) : video.thumbnailUrl ? (
          <img src={video.thumbnailUrl} alt={video.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-6xl">🎬</div>
        )}
      </div>

      <div>
        <h1 className="text-lg font-bold text-[var(--foreground)]">{video.title}</h1>
        <div className="flex items-center justify-between mt-2 flex-wrap gap-3">
          <p className="text-sm text-[var(--primary)]">
            {formatViews(video.viewCount ?? 0)} مشاهدة
            {video.createdAt ? ` · ${new Date(video.createdAt).toLocaleDateString('ar-SA', { day: 'numeric', month: 'long', year: 'numeric' })}` : ''}
          </p>
          <div className="flex items-center gap-2 flex-wrap">
            {/* Only supported a single boolean Like -- now a full reaction
                picker like posts have (#151). Long-press/click opens the
                picker; clicking the button itself toggles the current (or
                default 'like') reaction. */}
            <div className="relative" ref={reactionPickerRef}>
              {showReactionPicker && (
                <ReactionPicker onSelect={handleReact} onClose={() => setShowReactionPicker(false)} />
              )}
              <button
                onClick={() => (activeReaction ? handleReact(activeReaction.type) : setShowReactionPicker(!showReactionPicker))}
                className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all border ${
                  activeReaction
                    ? `${activeReaction.activeBg} ${activeReaction.activeText} border-transparent`
                    : 'bg-[var(--muted)] text-[var(--primary)] hover:bg-[var(--muted)] border-[var(--border)]'
                }`}
              >
                {activeReaction?.emoji ?? '🤍'} {activeReaction?.label ?? 'إعجاب'}{reactionTotal > 0 ? ` (${reactionTotal})` : ''}
              </button>
            </div>
            <button
              onClick={handleShare}
              className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold bg-[var(--muted)] text-[var(--primary)] hover:bg-[var(--muted)] border border-[var(--border)] transition-all"
            >
              {shared ? '✓ تم النسخ' : '🔗 مشاركة'}
            </button>
            <button
              onClick={handleSave}
              disabled={saved || savingVideo}
              className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold bg-[var(--muted)] text-[var(--primary)] hover:bg-[var(--muted)] border border-[var(--border)] transition-all disabled:opacity-50"
            >
              {saved ? '✓ محفوظ' : savingVideo ? '...' : '🔖 حفظ'}
            </button>
            <button
              onClick={() => setShowReport(true)}
              className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold bg-[var(--destructive)]/10 text-[var(--destructive)] hover:bg-[var(--destructive)]/15 border border-[var(--destructive)]/20 transition-all"
            >
              🚩 إبلاغ
            </button>
          </div>
        </div>
      </div>

      <Modal open={showReport} onClose={() => setShowReport(false)} title="الإبلاغ عن الفيديو">
        <div className="space-y-4">
          {reportSent ? (
            <p className="text-sm text-[var(--primary)] text-center py-2">✓ تم إرسال البلاغ. شكراً لك.</p>
          ) : (
            <>
              <p className="text-sm text-[var(--primary)]">حدد سبب الإبلاغ:</p>
              <div className="space-y-2">
                {/* Send the reason *id* the backend catalog expects (#79) — it
                    previously sent the Arabic label, which the API rejects. */}
                {[
                  { id: 'inappropriate', label: 'محتوى غير لائق' },
                  { id: 'harassment', label: 'تحرّش أو إساءة' },
                  { id: 'scam', label: 'احتيال أو معلومات مضللة' },
                  { id: 'off_platform', label: 'محتوى مزعج / غير مرغوب' },
                  { id: 'other', label: 'سبب آخر' },
                ].map((r) => (
                  <button key={r.id} onClick={() => setReportReason(r.id)}
                    className={`w-full text-right px-4 py-2.5 rounded-xl text-sm border transition-all ${reportReason === r.id ? 'border-[var(--destructive)]/50 bg-[var(--destructive)]/10 text-[var(--destructive)] font-semibold' : 'border-[var(--border)] bg-[var(--muted)] text-[var(--foreground)] hover:border-[var(--border)]'}`}>
                    {r.label}
                  </button>
                ))}
              </div>
              {/* Selecting "سبب آخر" did nothing -- no way to add custom
                  detail, forcing a bare generic submission (#369). */}
              {reportReason === 'other' && (
                <textarea
                  value={reportDetails}
                  onChange={(e) => setReportDetails(e.target.value)}
                  placeholder="اكتب التفاصيل هنا (اختياري)"
                  rows={3}
                  maxLength={500}
                  className="w-full px-3 py-2.5 rounded-xl text-sm outline-none resize-none"
                  style={{ backgroundColor: 'var(--muted)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
                />
              )}
              <div className="flex gap-3 pt-1">
                <button onClick={() => setShowReport(false)} className="flex-1 px-4 py-2.5 rounded-xl text-sm border border-[var(--border)] text-[var(--primary)] hover:bg-[var(--muted)] transition-colors">إلغاء</button>
                <button onClick={handleReport} disabled={!reportReason || reportLoading}
                  className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold bg-[var(--destructive)] text-white hover:bg-[var(--destructive)]/90 disabled:opacity-50 transition-colors">
                  {reportLoading ? '...' : 'إرسال البلاغ'}
                </button>
              </div>
            </>
          )}
        </div>
      </Modal>

      <div className="flex items-center gap-3 py-3 border-y border-[var(--border)]">
        <Avatar src={video.user?.avatarUrl} name={video.user?.name} size="md" />
        <div>
          <p className="font-semibold text-[var(--foreground)] text-sm">{video.user?.name ?? 'مستخدم'}</p>
          {video.user?.username && (
            <p className="text-xs text-[var(--primary)]">@{video.user.username}</p>
          )}
        </div>
      </div>

      {video.description && (
        <p className="text-sm text-[var(--primary)] leading-relaxed">{video.description}</p>
      )}

      {video.tags?.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {video.tags.map((tag: string) => (
            <span key={tag} className="text-xs px-3 py-1 bg-[var(--muted)] text-[var(--primary)] rounded-full">
              #{tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function CommentsSection({ videoId }: { videoId: string }) {
  const { data, isLoading } = useVideoComments(videoId);
  const addComment = useAddVideoComment();
  const updateComment = useUpdateVideoComment();
  const deleteComment = useDeleteVideoComment();
  const [text, setText] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const myUserId = getCurrentUserId();

  const comments: any[] = data?.data ?? [];

  const startEdit = (c: any) => { setEditingId(c.id); setEditText(c.content); };
  const saveEdit = (commentId: string) => {
    if (!editText.trim()) return;
    updateComment.mutate({ videoId, commentId, content: editText.trim() });
    setEditingId(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    addComment.mutate({ videoId, content: text.trim() });
    setText('');
  };

  return (
    <div className="space-y-4">
      <h3 className="font-bold text-[var(--foreground)]">التعليقات {comments.length > 0 ? `(${comments.length})` : ''}</h3>

      <form onSubmit={handleSubmit} className="flex gap-3">
        <input
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="أضف تعليقاً..."
          className="flex-1 rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm text-[var(--foreground)] focus:outline-none focus:border-[var(--ring)] focus:ring-2 focus:ring-[var(--primary)]/20 bg-[var(--card)]"
        />
        <button
          type="submit"
          disabled={!text.trim() || addComment.isPending}
          className="rounded-xl px-4 py-2.5 text-sm font-semibold bg-[var(--primary)] text-white hover:bg-[var(--primary)] disabled:opacity-50 transition-colors shadow-lg shadow-black/10"
        >
          إرسال
        </button>
      </form>

      {isLoading ? (
        <div className="flex justify-center py-6"><Spinner /></div>
      ) : comments.length === 0 ? (
        <p className="text-center text-sm text-[var(--primary)] py-6">لا توجد تعليقات بعد. كن أول من يعلّق!</p>
      ) : (
        <div className="space-y-3">
          {comments.map((c: any) => (
            <div key={c.id} className="flex gap-3 group">
              <Avatar src={c.user?.avatarUrl} name={c.user?.name} size="sm" />
              <div className="flex-1 rounded-2xl bg-[var(--muted)] border border-[var(--border)] px-4 py-3">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-xs font-semibold text-[var(--foreground)] mb-1">{c.user?.name ?? 'مستخدم'}</p>
                  {/* No edit/delete existed for video comments at all (#303). */}
                  {c.user?.id === myUserId && editingId !== c.id && (
                    <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      <button onClick={() => startEdit(c)} aria-label="تعديل التعليق" className="text-[var(--muted-foreground)] hover:text-[var(--primary)]">
                        <PencilSimple size={13} />
                      </button>
                      <button onClick={() => deleteComment.mutate({ videoId, commentId: c.id })} aria-label="حذف التعليق" className="text-[var(--muted-foreground)] hover:text-[var(--destructive)]">
                        <Trash size={13} />
                      </button>
                    </div>
                  )}
                </div>
                {editingId === c.id ? (
                  <div className="flex items-center gap-2 mt-1">
                    <input
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      className="flex-1 rounded-lg border border-[var(--border)] px-2 py-1 text-sm text-[var(--foreground)] bg-[var(--card)] focus:outline-none focus:border-[var(--ring)]"
                      autoFocus
                    />
                    <button onClick={() => saveEdit(c.id)} aria-label="حفظ" className="text-[var(--primary)]"><Check size={16} /></button>
                    <button onClick={() => setEditingId(null)} aria-label="إلغاء" className="text-[var(--muted-foreground)]"><X size={16} /></button>
                  </div>
                ) : (
                  <p className="text-sm text-[var(--primary)]">{c.content}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function RecommendedSidebar({ currentId }: { currentId: string }) {
  const router = useRouter();
  const { data, isLoading } = useRecommendedVideos();
  const videos: any[] = (data?.data ?? []).filter((v: any) => v.id !== currentId).slice(0, 8);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-20 rounded-xl bg-[var(--muted)] animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="font-bold text-[var(--foreground)] text-sm">فيديوهات مقترحة</h3>
      {videos.map((v: any) => (
        <div
          key={v.id}
          onClick={() => router.push(`/watch/${v.id}`)}
          className="flex gap-3 cursor-pointer rounded-xl p-2 hover:bg-[var(--muted)] transition-colors"
        >
          <div className="w-28 h-16 shrink-0 rounded-lg bg-[var(--muted)] overflow-hidden">
            {/* Same wrong-field bug as the main player above (#274). */}
            {v.thumbnailUrl ? (
              <img src={v.thumbnailUrl} alt={v.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xl">🎬</div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-[var(--foreground)] line-clamp-2">{v.title}</p>
            <p className="text-[11px] text-[var(--primary)] mt-1">{v.user?.name ?? 'مستخدم'}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function VideoPlayerPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data, isLoading, isError } = useVideo(id);
  const video = data?.data;

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isError || !video) {
    return (
      <div className="text-center py-20">
        <div className="text-4xl mb-3">🎬</div>
        <p className="text-[var(--primary)] font-medium mb-4">لم يُعثر على الفيديو</p>
        <button
          onClick={() => router.push('/watch')}
          className="rounded-xl px-5 py-2.5 text-sm font-semibold bg-[var(--primary)] text-white hover:bg-[var(--primary)] transition-colors shadow-lg shadow-black/10"
        >
          تصفّح الفيديوهات
        </button>
      </div>
    );
  }

  return (
    <div className="flex gap-6">
      <div className="flex-1 min-w-0 space-y-6">
        <VideoPlayer video={video} />
        <CommentsSection videoId={id} />
      </div>
      <aside className="hidden xl:block w-80 shrink-0">
        <div className="sticky top-[5.5rem]">
          <RecommendedSidebar currentId={id} />
        </div>
      </aside>
    </div>
  );
}
