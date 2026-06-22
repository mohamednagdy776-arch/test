'use client';
import { useLinkPreview } from '@/lib/useLinkPreview';

// Compact Open Graph preview rendered under a chat bubble. `isOwn` flips the
// palette so it reads well on the gradient (sent) vs. muted (received) bubble.
export function LinkPreviewCard({ url, isOwn }: { url: string; isOwn?: boolean }) {
  const { data, isLoading } = useLinkPreview(url);

  // Nothing worth showing — the URL itself is already linkified in the text.
  if (!isLoading && (!data || (!data.title && !data.description && !data.image))) {
    return null;
  }

  const surface = isOwn ? 'rgba(255,255,255,0.15)' : 'var(--card)';
  const border = isOwn ? 'rgba(255,255,255,0.25)' : 'var(--border)';
  const titleColor = isOwn ? 'white' : 'var(--foreground)';
  const subColor = isOwn ? 'rgba(255,255,255,0.7)' : 'var(--muted-foreground)';

  if (isLoading) {
    return (
      <div className="mt-2 rounded-xl overflow-hidden animate-pulse"
        style={{ background: surface, border: `1px solid ${border}` }}>
        <div className="h-24 w-full" style={{ background: isOwn ? 'rgba(255,255,255,0.12)' : 'var(--muted)' }} />
        <div className="p-2.5 space-y-1.5">
          <div className="h-3 w-2/3 rounded" style={{ background: isOwn ? 'rgba(255,255,255,0.2)' : 'var(--muted)' }} />
          <div className="h-2.5 w-1/2 rounded" style={{ background: isOwn ? 'rgba(255,255,255,0.15)' : 'var(--muted)' }} />
        </div>
      </div>
    );
  }

  return (
    <a href={data!.url} target="_blank" rel="noopener noreferrer"
      onClick={(e) => e.stopPropagation()}
      className="block mt-2 rounded-xl overflow-hidden transition-all hover:opacity-90 max-w-[260px]"
      style={{ background: surface, border: `1px solid ${border}` }}>
      {data!.image && (
        <div className="w-full aspect-video overflow-hidden" style={{ background: isOwn ? 'rgba(255,255,255,0.1)' : 'var(--muted)' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={data!.image} alt="" loading="lazy" className="w-full h-full object-cover"
            onError={(e) => { (e.currentTarget.parentElement as HTMLElement).style.display = 'none'; }} />
        </div>
      )}
      <div className="p-2.5">
        {data!.siteName && (
          <p className="text-[10px] truncate uppercase tracking-wide" dir="ltr" style={{ color: subColor }}>
            {data!.siteName}
          </p>
        )}
        {data!.title && (
          <p className="text-xs font-bold leading-snug line-clamp-2 mt-0.5" style={{ color: titleColor }}>
            {data!.title}
          </p>
        )}
        {data!.description && (
          <p className="text-[11px] leading-snug line-clamp-2 mt-1" style={{ color: subColor }}>
            {data!.description}
          </p>
        )}
      </div>
    </a>
  );
}
