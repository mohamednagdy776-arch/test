'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useRecommendedVideos, useTrendingVideos, useVideos, useContinueWatching } from '@/features/videos/hooks';
import { Card, CardContent } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { PlayCircle, Fire, Users, Clock } from '@phosphor-icons/react';

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
      className="rounded-2xl overflow-hidden cursor-pointer group transition-all duration-200"
      style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onPlay}
    >
      {/* Thumbnail */}
      <div className="relative aspect-video" style={{ backgroundColor: 'var(--muted)' }}>
        {video.thumbnail ? (
          <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <PlayCircle size={40} className="opacity-30" style={{ color: 'var(--muted-foreground)' }} />
          </div>
        )}

        <div
          className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded text-[11px] font-medium text-white"
          style={{ backgroundColor: 'rgba(0,0,0,0.72)' }}
        >
          {formatDuration(video.duration || 0)}
        </div>

        {isHovered && (
          <div className="absolute inset-0 flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.25)' }}>
            <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
              <PlayCircle size={28} weight="fill" style={{ color: 'var(--primary)' }} />
            </div>
          </div>
        )}
      </div>

      {/* Meta */}
      <div className="p-3">
        <div className="flex gap-3">
          <Avatar src={video.user?.avatar} name={video.user?.name || 'م'} size="md" />
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
          <div key={video.id} className="w-72 shrink-0">
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
  const [activeTab, setActiveTab] = useState<'recommended' | 'trending' | 'following'>('recommended');

  const { data: recommendedData, isLoading: rLoading } = useRecommendedVideos(activeTab === 'recommended');
  const { data: trendingData,   isLoading: tLoading } = useTrendingVideos(activeTab === 'trending');
  const { data: followingData,  isLoading: fLoading } = useVideos(1, 20, activeTab === 'following');

  const getCurrentVideos = () => {
    if (activeTab === 'recommended') return recommendedData?.data;
    if (activeTab === 'trending')    return trendingData?.data;
    return followingData?.data;
  };

  const isLoading = activeTab === 'recommended' ? rLoading : activeTab === 'trending' ? tLoading : fLoading;

  return (
    <div className="max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>الفيديوهات</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--muted-foreground)' }}>اكتشف فيديوهات جديدة من مجتمعاتك</p>
      </div>

      {/* Tabs */}
      <div
        className="flex gap-1 mb-6 rounded-2xl p-1"
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
