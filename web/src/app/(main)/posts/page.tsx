'use client';
import { PostFeed } from '@/features/posts/components/PostFeed';
import { PostComposer } from '@/features/posts/components/PostComposer';

export default function PostsPage() {
  return (
    <div className="space-y-5">
      <div className="rounded-3xl bg-gradient-to-br from-[#ECFDF5] to-[#F0FDF4] border border-emerald-100 shadow-soft p-5">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 shrink-0 rounded-2xl bg-gradient-to-br from-emerald-400 to-amber-400 flex items-center justify-center text-xl shadow-lg shadow-emerald-500/25">
            ✍️
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#059669]">المنشورات</h1>
            <p className="text-xs text-[#10B981]">شارك أفكارك وأخبارك مع مجتمعك</p>
          </div>
        </div>
      </div>
      <PostComposer />
      <PostFeed />
    </div>
  );
}
