'use client';
import { cn } from '@/lib/utils';

interface SpinnerProps { size?: 'sm' | 'md' | 'lg'; className?: string; }
const sizes = { sm: 'h-4 w-4', md: 'h-8 w-8', lg: 'h-12 w-12' };

export function Spinner({ size = 'md', className }: SpinnerProps) {
  return (
    <div className="flex items-center justify-center">
      <svg className={cn('animate-spin', sizes[size], className)} style={{ color: 'var(--muted-foreground)' }} fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
      </svg>
    </div>
  );
}

export function SpinnerOverlay() {
  return (
    <div className="absolute inset-0 bg-[var(--card)]/80 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
      <div className="flex flex-col items-center gap-3">
        <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] flex items-center justify-center shadow-glow-lg">
          <svg className="h-6 w-6 animate-spin text-[var(--card)]" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
          </svg>
        </div>
        <p className="text-sm text-[var(--muted-foreground)] font-medium">جاري التحميل...</p>
      </div>
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('bg-[var(--muted)] rounded-lg animate-pulse', className)} />;
}

export function SkeletonCard() {
  return (
    <div className="rounded-2xl bg-[var(--card)] shadow-card border border-[var(--border)]/60 p-4 space-y-4">
      <div className="flex items-center gap-3">
        <div className="h-11 w-11 rounded-full bg-gradient-to-br from-[var(--muted)] to-[var(--muted-foreground)] animate-pulse" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-32 bg-[var(--muted)] rounded animate-pulse" />
          <div className="h-3 w-20 bg-[var(--muted)] rounded animate-pulse" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-4 bg-[var(--muted)] rounded animate-pulse" />
        <div className="h-4 w-3/4 bg-[var(--muted)] rounded animate-pulse" />
      </div>
      <div className="h-32 bg-[var(--muted)] rounded-xl animate-pulse" />
    </div>
  );
}
