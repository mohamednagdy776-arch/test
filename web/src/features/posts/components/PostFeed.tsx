'use client';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type { Post } from '@/types';

const PostCard = ({ post }: { post: Post }) => (
  <div className="rounded-xl bg-white p-5 shadow-sm">
    <div className="mb-3 flex items-center gap-3">
      <div className="h-9 w-9 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
        {post.userId?.slice(0, 2).toUpperCase()}
      </div>
      <div>
        <p className="text-sm font-medium text-gray-900">{post.userId?.slice(0, 8)}…</p>
        <p className="text-xs text-gray-400">{new Date(post.createdAt).toLocaleDateString('ar-EG')}</p>
      </div>
    </div>
    <p className="text-sm text-gray-800 leading-relaxed">{post.content}</p>
    {post.mediaUrl && (
      <img src={post.mediaUrl} alt="post media" className="mt-3 rounded-lg w-full object-cover max-h-64" />
    )}
    <div className="mt-3 flex gap-4 border-t pt-3">
      <button className="text-xs text-gray-500 hover:text-primary">❤️ إعجاب</button>
      <button className="text-xs text-gray-500 hover:text-primary">💬 تعليق</button>
    </div>
  </div>
);

export const PostFeed = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['posts-feed'],
    queryFn: () => apiClient.get('/feed', { params: { page: 1, limit: 20 } }).then((r) => r.data),
  });

  if (isLoading) return <div className="space-y-4">{[1,2,3].map((i) => <div key={i} className="h-32 rounded-xl bg-white animate-pulse" />)}</div>;
  if (isError) return <div className="rounded-xl bg-red-50 p-4 text-sm text-red-600">فشل تحميل المنشورات</div>;

  const posts: Post[] = data?.data ?? [];

  return (
    <div className="space-y-4">
      {posts.length === 0
        ? <div className="rounded-xl bg-white p-8 text-center text-gray-400">لا توجد منشورات بعد</div>
        : posts.map((p) => <PostCard key={p.id} post={p} />)
      }
    </div>
  );
};
