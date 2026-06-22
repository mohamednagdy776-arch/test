import Image from 'next/image';
import { formatDistanceToNow } from '@/lib/utils';
import { resolveMediaUrl } from '@/lib/media';
import type { Memory } from '../types';

interface MemoryCardProps {
  memory: Memory;
  onClick?: () => void;
}

export function MemoryCard({ memory, onClick }: MemoryCardProps) {
  return (
    <div 
      className="relative rounded-lg overflow-hidden cursor-pointer group"
      onClick={onClick}
    >
      <div className="aspect-square relative">
        {memory.mediaType === 'image' ? (
          <Image
            src={resolveMediaUrl(memory.mediaUrl) ?? ''}
            alt={memory.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <video
            src={resolveMediaUrl(memory.mediaUrl) ?? ''}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
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
