'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useRecommendedVideos, useTrendingVideos, useVideos, useContinueWatching } from '@/features/videos/hooks';
import { Card, CardContent } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { Avatar } from '@/components/ui/Avatar';

function VideoCard({ video, onPlay }: { video: any; onPlay?: () => void }) {
  const [isHovered, setIsHovered] = useState(false);
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatViews = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}م`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}الف`;
    return count.toString();
  };

  return (
    <div
      className="rounded-2xl bg-[#FFFBEB] border border-emerald-100 overflow-hidden hover:shadow-lg hover:shadow-emerald-500/10 transition-all cursor-pointer group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onPlay}
    >
      <div className="relative aspect-video bg-[#DCFCE7]">
        {video.thumbnail ? (
          <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl">🎬</div>
        )}

        <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded">
          {formatDuration(video.duration || 0)}
        </div>

        {isHovered && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
            <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center text-2xl shadow-lg">
              ▶️
            </div>
          </div>
        )}
      </div>

      <div className="p-3">
        <div className="flex gap-3">
          <Avatar src={video.user?.avatar} name={video.user?.name} size="md" />
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-[#065F46] text-sm line-clamp-2 mb-1">{video.title}</h3>
            <p className="text-xs text-[#10B981]">{video.user?.name || 'مستخدم'}</p>
            <p className="text-xs text-emerald-400">
              {formatViews(video.viewCount || 0)} مشاهدة · {video.createdAt ? new Date(video.createdAt).toLocaleDateString('ar-SA', { day: 'numeric', month: 'short' }) : ''}
            </p>
          </div>
        </div>

        <div className="flex gap-2 mt-3">
          {video.tags?.slice(0, 3).map((tag: string, i: number) => (
            <span key={i} className="text-[10px] px-2 py-1 bg-[#DCFCE7]/60 text-[#059669] rounded-full">
              {tag}
            </span>
          ))}
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
        <h2 className="text-lg font-bold text-[#065F46] mb-4 flex items-center gap-2">
          <span>⏯️</span> تابع المشاهدة
        </h2>
        <div className="flex gap-4 overflow-x-auto pb-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="w-64 shrink-0 h-40 bg-[#DCFCE7]/30 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!data?.data || data.data.length === 0) return null;

  return (
    <div className="mb-8">
      <h2 className="text-lg font-bold text-[#065F46] mb-4 flex items-center gap-2">
        <span>⏯️</span> تابع المشاهدة
      </h2>
      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin">
        {data.data.slice(0, 5).map((video: any) => (
          <div key={video.id} className="w-64 shrink-0">
            <VideoCard video={video} onPlay={() => router.push(`/watch/${video.id}`)} />
          </div>
        ))}
      </div>
    </div>
  );
}

function VideoGrid({ videos, isLoading, title, icon }: { videos?: any[]; isLoading: boolean; title: string; icon: string }) {
  const router = useRouter();
  if (isLoading) {
    return (
      <div className="mb-8">
        <h2 className="text-lg font-bold text-[#065F46] mb-4 flex items-center gap-2">
          <span>{icon}</span> {title}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <div key={i} className="h-64 bg-[#DCFCE7]/30 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!videos || videos.length === 0) {
    return (
      <div className="mb-8">
        <h2 className="text-lg font-bold text-[#065F46] mb-4 flex items-center gap-2">
          <span>{icon}</span> {title}
        </h2>
        <Card variant="warm">
          <CardContent className="py-12 text-center">
            <div className="text-4xl mb-3">{icon}</div>
            <p className="text-[#10B981]">لا توجد فيديوهات</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mb-8">
      <h2 className="text-lg font-bold text-[#065F46] mb-4 flex items-center gap-2">
        <span>{icon}</span> {title}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {videos.map((video: any) => (
          <VideoCard key={video.id} video={video} onPlay={() => router.push(`/watch/${video.id}`)} />
        ))}
      </div>
    </div>
  );
}

export default function WatchPage() {
  const [activeTab, setActiveTab] = useState<'recommended' | 'trending' | 'following'>('recommended');

  const { data: recommendedData, isLoading: recommendedLoading } = useRecommendedVideos(activeTab === 'recommended');
  const { data: trendingData,   isLoading: trendingLoading }   = useTrendingVideos(activeTab === 'trending');
  const { data: followingData,  isLoading: followingLoading }  = useVideos(1, 20, activeTab === 'following');

  const getCurrentVideos = () => {
    switch (activeTab) {
      case 'recommended': return recommendedData?.data;
      case 'trending':    return trendingData?.data;
      case 'following':   return followingData?.data;
      default:            return [];
    }
  };

  const isLoading = activeTab === 'recommended' ? recommendedLoading :
                    activeTab === 'trending'    ? trendingLoading    : followingLoading;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#065F46]">الفيديوهات</h1>
        <p className="text-sm text-[#10B981] mt-1">اكتشف فيديوهات جديدة من مجتمعاتك</p>
      </div>

      <div className="flex gap-2 mb-6 border-b border-emerald-100 overflow-x-auto">
        {([
          { id: 'recommended', label: '✨ مقترحة' },
          { id: 'trending',    label: '🔥 الرائجة' },
          { id: 'following',   label: '👥 تتابع' },
        ] as const).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 font-semibold transition-all whitespace-nowrap text-sm ${
              activeTab === tab.id
                ? 'text-[#059669] border-b-2 border-emerald-500'
                : 'text-[#10B981] hover:text-[#059669]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'recommended' && <ContinueWatchingSection />}

      <VideoGrid
        videos={getCurrentVideos()}
        isLoading={isLoading}
        title={activeTab === 'recommended' ? 'مقترحة لك' : activeTab === 'trending' ? 'الفيديوهات الرائجة' : 'من تتابعهم'}
        icon={activeTab === 'recommended' ? '✨' : activeTab === 'trending' ? '🔥' : '👥'}
      />
    </div>
  );
}
