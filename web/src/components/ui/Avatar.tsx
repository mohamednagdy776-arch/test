'use client';

import { cn } from '@/lib/utils';
import NextImage from 'next/image';
import { resolveMediaUrl } from '@/lib/media';

interface AvatarProps {
  src?: string | null;
  name?: string | null;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
  online?: boolean;
  shape?: 'circle' | 'rounded';
}

const pxSizes = { xs: 24, sm: 32, md: 40, lg: 64, xl: 96, '2xl': 128 };
const textSizes = { xs: 'text-[10px]', sm: 'text-xs', md: 'text-sm', lg: 'text-lg', xl: 'text-2xl', '2xl': 'text-3xl' };
const statusSizes = {
  xs:  'h-1.5 w-1.5 -right-0.5 -bottom-0.5',
  sm:  'h-2 w-2 -right-0.5 -bottom-0.5',
  md:  'h-2.5 w-2.5 right-0 bottom-0',
  lg:  'h-3.5 w-3.5 right-0.5 bottom-0.5',
  xl:  'h-4 w-4 right-1 bottom-1',
  '2xl': 'h-5 w-5 right-1.5 bottom-1.5',
};

export function Avatar({ src, name, size = 'md', className, online, shape = 'circle' }: AvatarProps) {
  const px = pxSizes[size];
  const initials = name ? name.split(' ').filter(Boolean).map((n) => n[0]).join('').slice(0, 2).toUpperCase() : '?';
  const shapeClass = shape === 'rounded' ? 'rounded-xl' : 'rounded-full';
  const resolvedSrc = resolveMediaUrl(src);

  return (
    <div className={cn('relative inline-flex shrink-0', className)} style={{ width: px, height: px }}>
      {resolvedSrc ? (
        <NextImage
          src={resolvedSrc}
          alt={name || 'صورة شخصية'}
          width={px}
          height={px}
          className={cn(
            'object-cover ring-2 ring-[color-mix(in_srgb,var(--primary)_25%,transparent)] shadow-sm transition-all duration-200 hover:scale-105',
            shapeClass,
          )}
        />
      ) : (
        <div
          className={cn(
            'flex items-center justify-center font-bold shadow-sm transition-all duration-200 hover:scale-105',
            'ring-2',
            shapeClass,
            textSizes[size],
          )}
          style={{
            width: px, height: px,
            background: 'linear-gradient(135deg, var(--primary), var(--accent))',
            color: 'var(--primary-foreground)',
          }}
        >
          {initials}
        </div>
      )}
      {online !== undefined && (
        <span
          className={cn('absolute rounded-full ring-2 ring-[var(--card)]', statusSizes[size])}
          style={{ background: online ? '#22c55e' : 'var(--muted-foreground)', boxShadow: online ? '0 0 6px #22c55e80' : undefined }}
        />
      )}
    </div>
  );
}
