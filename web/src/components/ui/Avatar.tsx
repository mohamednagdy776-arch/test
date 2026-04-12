'use client';
import { cn } from '@/lib/utils';

interface AvatarProps {
  src?: string | null;
  name?: string | null;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
  online?: boolean;
}

const sizes = { 
  xs: 'h-6 w-6 text-[10px]', 
  sm: 'h-8 w-8 text-xs', 
  md: 'h-10 w-10 text-sm', 
  lg: 'h-16 w-16 text-lg', 
  xl: 'h-24 w-24 text-2xl',
  '2xl': 'h-32 w-32 text-3xl'
};
const statusSizes = { 
  xs: 'h-1.5 w-1.5 right-0 bottom-0', 
  sm: 'h-2 w-2 right-0 bottom-0', 
  md: 'h-2.5 w-2.5 right-0.5 bottom-0.5', 
  lg: 'h-3.5 w-3.5 right-1 bottom-1', 
  xl: 'h-4 w-4 right-1 bottom-1',
  '2xl': 'h-5 w-5 right-1.5 bottom-1.5'
};

export function Avatar({ src, name, size = 'md', className, online }: AvatarProps) {
  const initials = name ? name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() : '?';
  return (
    <div className={cn('relative inline-flex shrink-0', className)}>
      {src ? (
        <img 
          src={src} 
          alt={name || 'صورة شخصية'} 
          className={cn(
            'rounded-full object-cover ring-2 ring-[#FDFAF5] shadow-soft',
            'ring-[#D4E8EE] ring-offset-2 ring-offset-[#FDFAF5]',
            'transition-all duration-300 hover:scale-105 hover:shadow-glow',
            sizes[size]
          )} 
        />
      ) : (
        <div 
          className={cn(
            'rounded-full flex items-center justify-center ring-2 ring-[#FDFAF5] font-bold shadow-soft',
            'bg-gradient-to-br from-[#D4E8EE] via-[#94B4C1] to-[#547792]',
            'text-[#213448] transition-all duration-300 hover:scale-105 hover:shadow-glow',
            sizes[size]
          )}
        >
          {initials}
        </div>
      )}
      {online !== undefined && (
        <span className={cn(
          'absolute rounded-full ring-2 ring-[#FDFAF5] shadow-soft',
          statusSizes[size], 
          online 
            ? 'bg-[#4A8C6F] shadow-[0_0_8px_rgba(74,140,111,0.5)] animate-pulse-online' 
            : 'bg-[#BFB9AD]'
        )} />
      )}
    </div>
  );
}
