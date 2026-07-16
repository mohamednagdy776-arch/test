'use client';

import { useState } from 'react';
import Image from 'next/image';
import { formatDistanceToNow } from '@/lib/utils';
import { resolveMediaUrl } from '@/lib/media';
import type { Memory } from '../types';

interface MemoryCardProps {
  memory: Memory;
  onClick?: () => void;
}

export function MemoryCard({ memory, onClick }: MemoryCardProps) {
  const [mediaErrored, setMediaErrored] = useState(false);
  const resolvedSrc = resolveMediaUrl(memory.mediaUrl);
  const showPlaceholder = mediaErrored || !resolvedSrc;

  return (
    <div
      className="relative rounded-lg overflow-hidden cursor-pointer group"
      onClick={onClick}
    >
      <div className="aspect-square relative bg-[var(--muted)]">
        {showPlaceholder ? (
          // No fallback existed at all -- a failed/missing media URL (or a
          // video whose element errors, e.g. an unsupported codec) rendered
          // a blank box instead of a placeholder (#420).
          <div className="w-full h-full flex items-center justify-center text-3xl">
            {memory.mediaType === 'video' ? '🎬' : '🖼️'}
          </div>
        ) : memory.mediaType === 'image' ? (
          <Image
            src={resolvedSrc ?? ''}
            alt={memory.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            onError={() => setMediaErrored(true)}
          />
        ) : (
          // This endpoint has no separate poster/thumbnail field -- only the
          // raw `mediaUrl` -- so videos are pointed at a <video> element
          // rather than <Image>, which can't decode a video file at all.
          // `preload="metadata"` + `muted`/`playsInline` make the browser
          // actually paint the first frame as a static thumbnail instead of
          // leaving the box blank until playback starts (#420).
          <video
            src={resolvedSrc ?? ''}
            preload="metadata"
            muted
            playsInline
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={() => setMediaErrored(true)}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
        <p className="font-semibold text-sm truncate">{memory.title}</p>
        <p className="text-xs text-[var(--border)]">
          {formatDistanceToNow(new Date(memory.createdAt))}
        </p>
      </div>
    </div>
  );
}
