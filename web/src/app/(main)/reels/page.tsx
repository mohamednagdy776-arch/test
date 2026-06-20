'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Heart, ChatCircle, ShareFat, DotsThreeVertical } from '@phosphor-icons/react';

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

function ReelCard({ reel, isActive }: { reel: Reel; isActive: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(reel.likesCount ?? 0);

  useEffect(() => {
    if (!videoRef.current) return;
    if (isActive) {
      videoRef.current.play().catch(() => {});
    } else {
      videoRef.current.pause();
    }
  }, [isActive]);

  const handleLike = () => {
    setLiked((v) => !v);
    setLikes((v) => (liked ? v - 1 : v + 1));
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
          src={reel.videoUrl}
          poster={reel.thumbnailUrl}
          className="w-full h-full object-cover"
          loop
          muted
          playsInline
        />
      ) : (
        <div
          className="w-full h-full flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #065F46, #10B981)' }}
        >
          {reel.thumbnailUrl ? (
            <img src={reel.thumbnailUrl} alt="" className="w-full h-full object-cover" />
          ) : (
            <span className="text-6xl">🎬</span>
          )}
        </div>
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none" />

      <div className="absolute bottom-20 right-4 flex flex-col gap-5 items-center">
        <button onClick={handleLike} className="flex flex-col items-center gap-1">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center backdrop-blur-sm ${liked ? 'bg-red-500' : 'bg-black/40'}`}>
            <Heart size={24} weight={liked ? 'fill' : 'regular'} className="text-white" />
          </div>
          <span className="text-white text-xs font-semibold">{likes}</span>
        </button>

        <button className="flex flex-col items-center gap-1">
          <div className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center">
            <ChatCircle size={24} className="text-white" />
          </div>
          <span className="text-white text-xs font-semibold">{reel.commentsCount ?? 0}</span>
        </button>

        <button className="flex flex-col items-center gap-1">
          <div className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center">
            <ShareFat size={24} className="text-white" />
          </div>
          <span className="text-white text-xs font-semibold">مشاركة</span>
        </button>

        <button className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center">
          <DotsThreeVertical size={24} className="text-white" />
        </button>
      </div>

      <div className="absolute bottom-20 left-4 max-w-[65%]">
        <p className="text-white font-bold text-sm mb-1">@{reel.user?.username ?? authorName}</p>
        {caption && (
          <p className="text-white/90 text-sm leading-relaxed line-clamp-3">{caption}</p>
        )}
      </div>
    </div>
  );
}

export default function ReelsPage() {
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
          <div className="w-16 h-16 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin mx-auto mb-4" />
          <p className="text-white text-sm">جار تحميل الريلز...</p>
        </div>
      </div>
    );
  }

  if (isError || reels.length === 0) {
    return (
      <div className="fixed inset-0 flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #065F46, #10B981)' }}>
        <div className="text-center text-white px-8">
          <div className="text-7xl mb-4">🎬</div>
          <h2 className="text-2xl font-bold mb-2">لا توجد ريلز حالياً</h2>
          <p className="text-white/70 text-sm">كن أول من ينشر مقطعاً قصيراً!</p>
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
      {reels.map((reel, i) => (
        <ReelCard key={reel.id ?? i} reel={reel} isActive={i === activeIndex} />
      ))}
    </div>
  );
}
