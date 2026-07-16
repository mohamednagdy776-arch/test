'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useRecommendedVideos, useTrendingVideos, useFollowingVideos, useContinueWatching } from '@/features/videos/hooks';
import { Card, CardContent } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { PlayCircle, Fire, Users, Clock, Plus } from '@phosphor-icons/react';
import { PageHeader } from '@/components/ui/PageHeader';

// Suggested/grid video thumbnails had no error fallback -- a broken or
// unresolved thumbnail URL just rendered the raw `alt` text in place of the
// image (#396). Falls back to the same PlayCircle placeholder already used
// for videos with no thumbnail at all.
function VideoThumb({ src, alt }: { src?: string | null; alt: string }) {
  const [errored, setErrored] = useState(false);

  if (!src || errored) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <PlayCircle size={40} className="opacity-30" style={{ color: 'var(--muted-foreground)' }} />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className="w-full h-full object-cover"
      onError={() => setErrored(true)}
    />
  );
}

function VideoCard({ video, onPlay }: { video: any; onPlay?: () => void }) {
  const [isHovered, setIsHovered] = useState(false);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatViews = (count: number) => {
    if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}م`;
    if (count >= 1_000) return `${(count / 1_000).toFixed(1)}ألف`;
    return String(count);
  };

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={video.title || 'تشغيل الفيديو'}
      className="h-full flex flex-col rounded-2xl overflow-hidden cursor-pointer group transition-all duration-200"
      style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={() => setIsHovered(true)}
      onTouchEnd={() => setIsHovered(false)}
      onClick={onPlay}
      onKeyDown={(e) => e.key === 'Enter' && onPlay?.()}
    >
      {/* Thumbnail */}
      <div className="relative aspect-video" style={{ backgroundColor: 'var(--muted)' }}>
        {/* .thumbnailUrl is already a full, resolved CDN URL from the backend
            (see the #274 note in watch/[id]/page.tsx) -- resolveMediaUrl()
            re-anchors relative paths onto the API origin, not the CDN, so
            running the raw `.thumbnail` key through it here produced a
            broken URL that always fell through to onError (#396). */}
        <VideoThumb src={video.thumbnailUrl} alt={video.title} />

        <div
          className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded text-[11px] font-medium text-white"
          style={{ backgroundColor: 'rgba(0,0,0,0.72)' }}
        >
          {formatDuration(video.duration || 0)}
        </div>

        <div
          className="absolute inset-0 flex items-center justify-center transition-opacity duration-200"
          style={{ backgroundColor: 'rgba(0,0,0,0.25)', opacity: isHovered ? 1 : 0, pointerEvents: 'none' }}
        >
          <div className="w-12 h-12 rounded-full bg-[var(--card)]/90 flex items-center justify-center shadow-lg">
            <PlayCircle size={28} weight="fill" style={{ color: 'var(--primary)' }} />
          </div>
        </div>
        {/* Always-visible play icon for touch/mobile */}
        {!isHovered && (
          <div className="absolute inset-0 flex items-center justify-center md:hidden">
            <div className="w-10 h-10 rounded-full bg-black/50 flex items-center justify-center">
              <PlayCircle size={22} weight="fill" className="text-white" />
            </div>
          </div>
        )}
      </div>

      {/* Meta -- flex-1 so this absorbs the leftover space from the card's
          h-full stretch instead of leaving it unfilled, since a 1- vs
          2-line title (line-clamp-2) otherwise varies each card's natural
          content height and misaligns the bottom edges in this
          horizontally-scrolling row (#75). */}
      <div className="p-3 flex-1 flex flex-col">
        <div className="flex gap-3">
          {/* The API returns the uploader's avatar as `user.avatarUrl` (see
              VideosService.format() in the backend) -- `user.avatar` doesn't
              exist on the response, so this always fell back to the default
              initials avatar even when the uploader had a real photo (#426). */}
          <Avatar src={video.user?.avatarUrl} name={video.user?.name || 'م'} size="md" />
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm line-clamp-2 mb-0.5" style={{ color: 'var(--foreground)' }}>
              {video.title}
            </h3>
            <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{video.user?.name || 'مستخدم'}</p>
            <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
              {formatViews(video.viewCount || 0)} مشاهدة
              {video.createdAt
                ? ` · ${new Date(video.createdAt).toLocaleDateString('ar-SA', { day: 'numeric', month: 'short' })}`
                : ''}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ContinueWatchingSection() {
  const router = useRouter();
  const { data, isLoading } = useContinueWatching();

  if (isLoading) {
    return (
      <div className="mb-8">
        <h2 className="text-base font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--foreground)' }}>
          <Clock size={18} style={{ color: 'var(--primary)' }} /> تابع المشاهدة
        </h2>
        <div className="flex gap-4 overflow-x-auto pb-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="w-64 shrink-0 h-40 rounded-2xl animate-pulse" style={{ backgroundColor: 'var(--muted)' }} />
          ))}
        </div>
      </div>
    );
  }

  if (!data?.data || data.data.length === 0) return null;

  return (
    <div className="mb-8">
      <h2 className="text-base font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--foreground)' }}>
        <Clock size={18} style={{ color: 'var(--primary)' }} /> تابع المشاهدة
      </h2>
      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin">
        {data.data.slice(0, 5).map((video: any) => (
          <div key={video.id} className="w-72 shrink-0 h-full">
            <VideoCard video={video} onPlay={() => router.push(`/watch/${video.id}`)} />
          </div>
        ))}
      </div>
    </div>
  );
}

function VideoGrid({ videos, isLoading, title, icon }: {
  videos?: any[];
  isLoading: boolean;
  title: string;
  icon: React.ReactNode;
}) {
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="mb-8">
        <h2 className="text-base font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--foreground)' }}>
          {icon} {title}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="h-56 rounded-2xl animate-pulse" style={{ backgroundColor: 'var(--muted)' }} />
          ))}
        </div>
      </div>
    );
  }

  if (!videos || videos.length === 0) {
    return (
      <div className="mb-8">
        <h2 className="text-base font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--foreground)' }}>
          {icon} {title}
        </h2>
        <div
          className="rounded-2xl p-12 text-center"
          style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}
        >
          <div className="mb-2 opacity-30">{icon}</div>
          <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>لا توجد فيديوهات</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-8">
      <h2 className="text-base font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--foreground)' }}>
        {icon} {title}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {videos.map((video: any) => (
          <VideoCard key={video.id} video={video} onPlay={() => router.push(`/watch/${video.id}`)} />
        ))}
      </div>
    </div>
  );
}

const TABS = [
  { id: 'recommended' as const, label: 'مقترحة', icon: <PlayCircle size={16} /> },
  { id: 'trending'    as const, label: 'الرائجة', icon: <Fire size={16} /> },
  { id: 'following'   as const, label: 'تتابع',   icon: <Users size={16} /> },
] as const;

export default function WatchPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'recommended' | 'trending' | 'following'>('recommended');

  useEffect(() => {
    document.title = 'الفيديوهات | طيبت';
    return () => { document.title = 'طيبت'; };
  }, []);

  const { data: recommendedData, isLoading: rLoading } = useRecommendedVideos(activeTab === 'recommended');
  const { data: trendingData,   isLoading: tLoading } = useTrendingVideos(activeTab === 'trending');
  const { data: followingData,  isLoading: fLoading } = useFollowingVideos(activeTab === 'following');

  const getCurrentVideos = () => {
    if (activeTab === 'recommended') return recommendedData?.data;
    if (activeTab === 'trending')    return trendingData?.data;
    return followingData?.data;
  };

  const isLoading = activeTab === 'recommended' ? rLoading : activeTab === 'trending' ? tLoading : fLoading;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <PageHeader
        icon={PlayCircle}
        eyebrow="المشاهدة"
        title="الفيديوهات"
        subtitle="اكتشف فيديوهات جديدة من مجتمعاتك"
        action={
          <button
            onClick={() => router.push('/videos/upload')}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-bold transition-all hover:scale-105 active:scale-95"
            style={{ background: 'rgba(255,255,255,0.2)', color: 'white', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.3)' }}
          >
            <Plus size={15} weight="bold" /> رفع فيديو
          </button>
        }
      />

      {/* Tabs */}
      <div
        className="flex gap-1 rounded-2xl p-1"
        style={{ backgroundColor: 'var(--muted)' }}
      >
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200"
            style={
              activeTab === tab.id
                ? { backgroundColor: 'var(--card)', color: 'var(--primary)', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }
                : { color: 'var(--muted-foreground)' }
            }
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'recommended' && <ContinueWatchingSection />}

      <VideoGrid
        videos={getCurrentVideos()}
        isLoading={isLoading}
        title={
          activeTab === 'recommended' ? 'مقترحة لك' :
          activeTab === 'trending'    ? 'الفيديوهات الرائجة' :
          'من تتابعهم'
        }
        icon={
          activeTab === 'recommended' ? <PlayCircle size={18} style={{ color: 'var(--primary)' }} /> :
          activeTab === 'trending'    ? <Fire size={18} style={{ color: 'var(--primary)' }} /> :
          <Users size={18} style={{ color: 'var(--primary)' }} />
        }
      />
    </div>
  );
}
