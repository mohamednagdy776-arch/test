import { useState } from 'react';
import Image from 'next/image';
import { videosApi } from '../api';
import { useVideos } from '../hooks';
import { Spinner } from '@/components/ui/Spinner';
import { resolveMediaUrl } from '@/lib/media';

export function VideoGrid() {
  const { data, isLoading, error } = useVideos();

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 text-[var(--destructive)]">
        Failed to load videos
      </div>
    );
  }

  if (!data?.data?.length) {
    return (
      <div className="text-center py-12 text-[var(--muted-foreground)]">
        No videos yet
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {data.data.map((video: any) => (
        <VideoCard key={video.id} video={video} />
      ))}
    </div>
  );
}

export function VideoCard({ video, onClick }: { video: any; onClick?: () => void }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="relative rounded-xl overflow-hidden cursor-pointer group"
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="aspect-video relative bg-[var(--foreground)]">
        {video.thumbnailUrl ? (
          <Image
            src={resolveMediaUrl(video.thumbnailUrl) ?? ''}
            alt={video.title}
            fill
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-[var(--muted-foreground)]">
            ▶️
          </div>
        )}
        {video.duration && (
          <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded">
            {video.duration}
          </div>
        )}
        {isHovered && video.previewUrl && (
          <video
            src={resolveMediaUrl(video.previewUrl) ?? ''}
            autoPlay
            muted
            loop
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}
      </div>
      <div className="p-2">
        <h3 className="font-semibold text-sm line-clamp-2">{video.title}</h3>
        <p className="text-xs text-[var(--muted-foreground)] mt-1">
          {video.viewsCount || 0} views • {video.createdAt ? new Date(video.createdAt).toLocaleDateString() : ''}
        </p>
      </div>
    </div>
  );
}
