'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useViewStory, useStoryViewers, useAddToHighlight, useReactToStory } from '../hooks';
import { cn, displayName } from '@/lib/utils';
import { resolveMediaUrl } from '@/lib/media';
import { useToast } from '@/components/ui/Toast';
import { chatApi } from '@/features/chat/api';

function resolveMedia(url?: string): string | undefined {
  return resolveMediaUrl(url) ?? undefined;
}

interface StoryItem {
  id: string;
  user: { id: string; profile?: { fullName?: string }; email?: string };
  mediaUrl?: string;
  mediaType?: string;
  text?: string;
  bgColor?: string;
  createdAt: string;
  viewCount?: number;
}

interface StoryGroup {
  user: { id: string; profile?: { fullName?: string }; email?: string };
  stories: StoryItem[];
}

interface StoryViewerProps {
  stories: StoryGroup[];
  initialUserIndex: number;
  onClose: () => void;
}

export function StoryViewer({ stories, initialUserIndex, onClose }: StoryViewerProps) {
  const [userIndex, setUserIndex] = useState(initialUserIndex);
  const [storyIndex, setStoryIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [showViewers, setShowViewers] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
  const [showReactions, setShowReactions] = useState(false);

  const currentUser = stories[userIndex];
  const currentStory = currentUser?.stories[storyIndex];
  const viewStory = useViewStory();
  const { data: viewersData } = useStoryViewers(currentStory?.id || '');
  const addToHighlight = useAddToHighlight();
  const reactToStory = useReactToStory();
  const { showToast } = useToast() as any;
  const router = useRouter();
  const viewers = viewersData?.data || [];

  const REACTIONS = ['❤️', '😍', '😂', '😮', '😢', '🔥'];

  const handleReaction = (emoji: string) => {
    if (!currentStory?.id) return;
    setShowReactions(false);
    reactToStory.mutate(
      { storyId: currentStory.id, emoji },
      {
        onSuccess: () => showToast(`أرسلت ${emoji}`, 'success'),
        onError: () => showToast('تعذّر إرسال التفاعل', 'error'),
      },
    );
  };

  const handleSendReply = async () => {
    if (!replyText.trim() || !currentUser?.user?.id) return;
    setSendingReply(true);
    try {
      const convRes = await chatApi.createConversation(currentUser.user.id);
      const convId = convRes.data?.id;
      if (convId) {
        await chatApi.sendMessage(convId, replyText.trim());
        setReplyText('');
        showToast('تم إرسال الرد', 'success');
      }
    } catch {
      showToast('تعذّر إرسال الرد', 'error');
    } finally {
      setSendingReply(false);
    }
  };

  const navigateToOwnerProfile = () => {
    if (!currentUser?.user) return;
    const user = currentUser.user as any;
    const slug = user.username || user.id;
    onClose();
    router.push(`/${slug}`);
  };

  const goNext = useCallback(() => {
    if (storyIndex < currentUser.stories.length - 1) {
      setStoryIndex(storyIndex + 1);
      setProgress(0);
    } else if (userIndex < stories.length - 1) {
      setUserIndex(userIndex + 1);
      setStoryIndex(0);
      setProgress(0);
    } else {
      onClose();
    }
  }, [storyIndex, userIndex, currentUser.stories.length, stories.length, onClose]);

  const goPrev = useCallback(() => {
    if (storyIndex > 0) {
      setStoryIndex(storyIndex - 1);
      setProgress(0);
    } else if (userIndex > 0) {
      setUserIndex(userIndex - 1);
      setStoryIndex(stories[userIndex - 1].stories.length - 1);
      setProgress(0);
    }
  }, [storyIndex, userIndex, stories]);

  // Body scroll lock
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);

  useEffect(() => {
    if (currentStory?.id) viewStory.mutate(currentStory.id);
  }, [currentStory?.id]);

  useEffect(() => {
    setIsPaused(showViewers || showMenu || showReactions || !!replyText);
  }, [showViewers, showMenu, showReactions, replyText]);

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setProgress(p => {
        if (p >= 100) { goNext(); return 0; }
        return p + 100 / 50;
      });
    }, 100);
    return () => clearInterval(timer);
  }, [goNext, isPaused]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'ArrowLeft') goPrev();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose, goNext, goPrev]);

  const userName = displayName(currentUser?.user);
  const minutesAgo = Math.floor((Date.now() - new Date(currentStory?.createdAt).getTime()) / 60000);
  const timeLabel =
    minutesAgo < 1    ? 'الآن'
    : minutesAgo < 60 ? `منذ ${minutesAgo} دقيقة`
    : minutesAgo < 1440 ? `منذ ${Math.floor(minutesAgo / 60)} ساعة`
    : `منذ ${Math.floor(minutesAgo / 1440)} يوم`;

  const mediaUrl = resolveMedia(currentStory?.mediaUrl);
  const [mediaError, setMediaError] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Reset error state when story changes
  useEffect(() => { setMediaError(false); }, [currentStory?.id]);

  // Sync muted state to video DOM property (React's muted prop is unreliable)
  useEffect(() => {
    if (videoRef.current) videoRef.current.muted = isMuted;
  }, [isMuted]);

  return (
    <div className="fixed inset-0 z-[200] bg-black flex items-center justify-center" dir="rtl">
      {/* Backdrop — closes viewer when clicking outside the 9:16 frame */}
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative w-full max-w-[420px] h-full flex items-center mx-auto">
        <div className="relative w-full aspect-[9/16] max-h-screen overflow-hidden sm:rounded-2xl bg-black">

          {/* ── Story content ── */}
          {currentStory?.bgColor ? (
            <div className="absolute inset-0 flex items-center justify-center p-10" style={{ backgroundColor: currentStory.bgColor }}>
              <p
                className="font-bold text-center drop-shadow-lg leading-snug"
                style={{
                  color: currentStory.bgColor === 'var(--card)' || currentStory.bgColor === '#FFEAA7' ? 'var(--foreground)' : 'white',
                  fontSize: `clamp(1.1rem, ${Math.max(1.5, 3 - (currentStory.text?.length || 0) / 40)}rem, 2.25rem)`,
                }}
              >
                {currentStory.text}
              </p>
            </div>
          ) : mediaError ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-[var(--primary)] gap-3 p-10">
              <svg className="h-12 w-12 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
              <p className="text-sm text-white/40 text-center">تعذّر تحميل الوسائط</p>
            </div>
          ) : currentStory?.mediaType === 'video' ? (
            <>
              <video
                ref={videoRef}
                src={mediaUrl}
                className="absolute inset-0 w-full h-full object-cover"
                autoPlay
                muted
                loop
                playsInline
                onError={() => setMediaError(true)}
              />
              {/* Mute/unmute button — bottom-left, above tap zones */}
              <button
                onClick={() => setIsMuted(m => !m)}
                className="absolute bottom-6 left-4 z-20 h-9 w-9 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/70 transition-colors"
                aria-label={isMuted ? 'تشغيل الصوت' : 'كتم الصوت'}
              >
                {isMuted ? (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 9.75L19.5 12m0 0l2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25m-10.5-6l4.72-4.72a.75.75 0 011.28.531V19.94a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.506-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.395C2.806 8.757 3.63 8.25 4.51 8.25H6.75z" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53L6.75 15.75H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.395C2.806 8.757 3.63 8.25 4.51 8.25H6.75z" />
                  </svg>
                )}
              </button>
            </>
          ) : mediaUrl ? (
            <img
              src={mediaUrl}
              alt="Story"
              className="absolute inset-0 w-full h-full object-cover"
              onError={() => setMediaError(true)}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-[var(--primary)] p-10">
              <p className="text-xl font-bold text-white text-center drop-shadow-lg">{currentStory?.text}</p>
            </div>
          )}

          {/* Top gradient */}
          <div className="absolute inset-x-0 top-0 h-36 bg-gradient-to-b from-black/70 to-transparent pointer-events-none" />
          {/* Bottom gradient */}
          <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />

          {/* Progress bars — z-10 */}
          <div className="absolute top-4 inset-x-3 flex gap-[3px] z-10">
            {currentUser?.stories.map((_, i) => (
              <div key={i} className="flex-1 h-[3px] rounded-full overflow-hidden bg-white/30">
                <div
                  className="h-full rounded-full bg-[var(--card)]"
                  style={{ width: i < storyIndex ? '100%' : i === storyIndex ? `${progress}%` : '0%' }}
                />
              </div>
            ))}
          </div>

          {/* Header — z-20 so it sits above the tap zones (z-10) */}
          <div className="absolute top-9 inset-x-3 flex items-center gap-2.5 z-20">
            <button
              onClick={navigateToOwnerProfile}
              className="h-9 w-9 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0 ring-2 ring-white/70 hover:opacity-80 transition-opacity"
              style={{ background: 'linear-gradient(135deg, var(--primary), var(--secondary))' }}
              aria-label={`الانتقال لملف ${userName}`}
            >
              {userName.charAt(0)}
            </button>
            <button onClick={navigateToOwnerProfile} className="flex-1 min-w-0 text-right hover:opacity-80 transition-opacity">
              <p className="text-sm font-bold text-white leading-tight truncate">{userName}</p>
              <p className="text-[11px] text-white/60 leading-tight">{timeLabel}</p>
            </button>
            <span className="text-[11px] text-white/50 tabular-nums flex-shrink-0">
              {storyIndex + 1} / {currentUser.stories.length}
            </span>

            {/* 3-dot menu — anchored right-0 to stay on-screen in RTL */}
            <div className="relative flex-shrink-0">
              <button
                onClick={() => setShowMenu(v => !v)}
                className="p-1.5 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <circle cx="5" cy="12" r="1.8" /><circle cx="12" cy="12" r="1.8" /><circle cx="19" cy="12" r="1.8" />
                </svg>
              </button>
              {showMenu && (
                <div className="absolute right-0 top-9 w-44 bg-[#1a2a3a] rounded-xl shadow-2xl border border-white/10 py-1 z-30">
                  <button
                    onClick={() => { setShowViewers(true); setShowMenu(false); }}
                    className="w-full px-4 py-2.5 text-right text-sm text-white/90 hover:bg-white/10 flex items-center gap-2.5 transition-colors"
                  >
                    <svg className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    المشاهدون
                  </button>
                  <button
                    onClick={() => {
                      // Save the story to the user's "الأهم" (Highlights/Favorites)
                      // via the existing POST /stories/:id/highlights endpoint, with
                      // toast feedback so the action isn't silent (#22).
                      if (currentStory?.id) {
                        addToHighlight.mutate(
                          { storyId: currentStory.id, name: 'الأهم' },
                          {
                            onSuccess: () => showToast('تمت الإضافة إلى الأهم', 'success'),
                            onError: () => showToast('تعذّرت الإضافة إلى الأهم', 'error'),
                          },
                        );
                      }
                      setShowMenu(false);
                    }}
                    className="w-full px-4 py-2.5 text-right text-sm text-white/90 hover:bg-white/10 flex items-center gap-2.5 transition-colors"
                  >
                    <svg className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                    إضافة للأهم
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors flex-shrink-0"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Tap zones — z-10, below header (z-20) */}
          <button className="absolute left-0 top-0 w-[40%] h-full z-10" onClick={goPrev} aria-label="السابق" />
          <button className="absolute right-0 top-0 w-[40%] h-full z-10" onClick={goNext} aria-label="التالي" />

          {/* Reply + reactions bar — z-20, above tap zones */}
          <div className="absolute bottom-0 inset-x-0 px-3 pb-4 z-20 flex items-center gap-2">
            {/* Reactions picker */}
            <div className="relative">
              <button
                onClick={() => setShowReactions(v => !v)}
                className="h-9 w-9 flex items-center justify-center rounded-full bg-black/40 text-white/80 hover:text-white hover:bg-black/60 transition-colors text-lg"
                aria-label="تفاعل"
              >
                😊
              </button>
              {showReactions && (
                <div className="absolute bottom-11 left-0 flex gap-1 bg-black/80 rounded-2xl px-2 py-1.5 shadow-xl">
                  {REACTIONS.map(emoji => (
                    <button
                      key={emoji}
                      onClick={() => handleReaction(emoji)}
                      className="text-2xl hover:scale-125 transition-transform"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {/* Reply input */}
            <div className="flex-1 flex items-center gap-2 rounded-full bg-black/40 px-4 py-2 border border-white/20">
              <input
                type="text"
                value={replyText}
                onChange={e => setReplyText(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleSendReply(); }}
                placeholder="أرسل ردًا..."
                className="flex-1 bg-transparent text-sm text-white placeholder:text-white/40 outline-none"
                dir="rtl"
              />
              {replyText.trim() && (
                <button
                  onClick={handleSendReply}
                  disabled={sendingReply}
                  className="text-white/80 hover:text-white transition-colors disabled:opacity-50"
                  aria-label="إرسال"
                >
                  <svg className="h-5 w-5 rotate-180" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Viewers bottom sheet */}
      {showViewers && (
        <div className="absolute inset-0 z-30 flex items-end justify-center" dir="rtl">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowViewers(false)} />
          <div className="relative w-full max-w-[420px] bg-[#1a2a3a] rounded-t-2xl border-t border-white/10 shadow-2xl">
            <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-white/10">
              <h3 className="text-sm font-bold text-white">
                المشاهدون{viewers.length > 0 && <span className="text-white/50 font-normal mr-1">({viewers.length})</span>}
              </h3>
              <button onClick={() => setShowViewers(false)} className="p-1 text-white/50 hover:text-white transition-colors">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="overflow-y-auto max-h-60 pb-6">
              {viewers.length === 0 ? (
                <p className="py-8 text-sm text-white/30 text-center">لا يوجد مشاهدون بعد</p>
              ) : (
                viewers.map((viewer: any, i: number) => (
                  <div key={i} className="flex items-center gap-3 px-4 py-2.5 hover:bg-white/5 transition-colors">
                    <div
                      className="h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                      style={{ background: 'linear-gradient(135deg, var(--primary), var(--secondary))' }}
                    >
                      {displayName(viewer.user).charAt(0)}
                    </div>
                    <span className="text-sm text-white/80">{displayName(viewer.user)}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
