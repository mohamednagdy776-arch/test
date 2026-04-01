'use client';
import { cn } from '@/lib/utils';

interface AvatarProps {
  src?: string | null;
  name?: string | null;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  online?: boolean;
}

const sizes = { xs: 'h-6 w-6 text-[10px]', sm: 'h-8 w-8 text-xs', md: 'h-10 w-10 text-sm', lg: 'h-16 w-16 text-lg', xl: 'h-24 w-24 text-2xl' };
const statusSizes = { xs: 'h-1.5 w-1.5 right-0 bottom-0', sm: 'h-2 w-2 right-0 bottom-0', md: 'h-2.5 w-2.5 right-0.5 bottom-0.5', lg: 'h-3.5 w-3.5 right-1 bottom-1', xl: 'h-4 w-4 right-1 bottom-1' };

export function Avatar({ src, name, size = 'md', className, online }: AvatarProps) {
  const initials = name ? name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() : '?';
  return (
    <div className={cn('relative inline-flex shrink-0', className)}>
      {src ? (
        <img src={src} alt={name || 'صورة شخصية'} className={cn('rounded-full object-cover ring-2 ring-[#FDFAF5]', sizes[size])} />
      ) : (
        <div className={cn('rounded-full flex items-center justify-center ring-2 ring-[#FDFAF5] font-bold', sizes[size])} style={{ background: 'linear-gradient(135deg, #D4E8EE, #94B4C1)', color: '#213448' }}>
          {initials}
        </div>
      )}
      {online !== undefined && (
        <span className={cn('absolute rounded-full ring-2 ring-[#FDFAF5]', statusSizes[size], online ? 'bg-[#4A8C6F]' : 'bg-[#BFB9AD]')} />
      )}
    </div>
  );
}
