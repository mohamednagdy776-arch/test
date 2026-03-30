'use client';
import { PostFeed } from '@/features/posts/components/PostFeed';

export default function DashboardPage() {
  return (
    <div>
      <h1 className="mb-4 text-xl font-bold text-gray-900">الرئيسية</h1>
      <PostFeed />
    </div>
  );
}
