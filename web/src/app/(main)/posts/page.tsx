'use client';
import { PostFeed } from '@/features/posts/components/PostFeed';

export default function PostsPage() {
  return (
    <div className="space-y-5">
      <div className="rounded-3xl bg-[var(--card)] border border-[var(--border)] shadow-soft p-5">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 shrink-0 rounded-2xl bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] flex items-center justify-center text-xl shadow-lg shadow-black/10">
            ✍️
          </div>
          <div>
            <h1 className="text-xl font-bold text-[var(--primary)]">المنشورات</h1>
            <p className="text-xs text-[var(--primary)]">شارك أفكارك وأخبارك مع مجتمعك</p>
          </div>
        </div>
      </div>
      {/* PostFeed already renders its own PostComposer internally -- this
          extra one caused the composer to appear twice (#233, #311). */}
      <PostFeed />
    </div>
  );
}
