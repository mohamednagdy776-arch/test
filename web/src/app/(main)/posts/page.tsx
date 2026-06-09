'use client';
import { PostFeed } from '@/features/posts/components/PostFeed';
import { PostComposer } from '@/features/posts/components/PostComposer';

export default function PostsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#ECFDF5] via-[#F0FDF4] to-amber-50/30">
      <div className="mb-5">
        <h1 className="text-xl font-bold text-emerald-900">المنشورات</h1>
        <p className="text-sm text-emerald-600">شارك أفكارك مع مجتمعك</p>
      </div>
      <PostComposer />
      <div className="mt-5">
        <PostFeed />
      </div>
    </div>
  );
}
