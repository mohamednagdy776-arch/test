'use client';
import { useState } from 'react';
import { useFeed, useComments, useAddComment, useReactions, useToggleReaction } from '../hooks';

// ─── Comment Section ──────────────────────────────────────────
export function CommentSection({ postId }: { postId: string }) {
  const [text, setText] = useState('');
  const { data, isLoading } = useComments(postId);
  const addComment = useAddComment();

  const comments: any[] = data?.data ?? [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    await addComment.mutateAsync({ postId, content: text.trim() });
    setText('');
  };

  return (
    <div className="mt-3 border-t pt-3">
      {isLoading ? (
        <div className="space-y-2 mb-3">
          {[1, 2].map((i) => <div key={i} className="h-10 bg-gray-50 rounded-lg animate-pulse" />)}
        </div>
      ) : comments.length > 0 ? (
        <div className="space-y-2 mb-3 max-h-60 overflow-y-auto">
          {comments.map((c: any) => (
            <div key={c.id} className="flex gap-2">
              <div className="h-7 w-7 shrink-0 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 text-xs font-bold">
                {(c.user?.profile?.fullName || c.user?.email || '?').charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 bg-gray-50 rounded-lg px-3 py-2">
                <p className="text-xs font-medium text-gray-700">
                  {c.user?.profile?.fullName || c.user?.email?.split('@')[0] || 'مستخدم'}
                </p>
                <p className="text-sm text-gray-600">{c.content}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {new Date(c.createdAt).toLocaleDateString('ar-EG')}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-gray-400 mb-3">لا توجد تعليقات بعد</p>
      )}

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="اكتب تعليقاً..."
          className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
        <button
          type="submit"
          disabled={!text.trim() || addComment.isPending}
          className="rounded-lg bg-primary px-3 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {addComment.isPending ? '...' : 'إرسال'}
        </button>
      </form>
    </div>
  );
}

// ─── Reaction Bar ─────────────────────────────────────────────
export function ReactionBar({ postId }: { postId: string }) {
  const { data } = useReactions(postId);
  const toggle = useToggleReaction();

  const reactionData = data?.data;
  const counts: Record<string, number> = reactionData?.counts ?? {};
  const total: number = reactionData?.total ?? 0;

  const handleReact = (type: string) => {
    toggle.mutate({ postId, type });
  };

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => handleReact('like')}
        disabled={toggle.isPending}
        className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs transition-colors ${
          counts.like ? 'bg-blue-50 text-primary' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
        }`}
      >
        👍 {counts.like || ''}
      </button>
      <button
        onClick={() => handleReact('love')}
        disabled={toggle.isPending}
        className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs transition-colors ${
          counts.love ? 'bg-red-50 text-red-500' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
        }`}
      >
        ❤️ {counts.love || ''}
      </button>
      <button
        onClick={() => handleReact('support')}
        disabled={toggle.isPending}
        className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs transition-colors ${
          counts.support ? 'bg-green-50 text-green-600' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
        }`}
      >
        🤝 {counts.support || ''}
      </button>
      {total > 0 && (
        <span className="mr-auto text-xs text-gray-400">{total} إعجاب</span>
      )}
    </div>
  );
}

// ─── Post Card ────────────────────────────────────────────────
export function PostCard({ post, showGroupLink = true }: { post: any; showGroupLink?: boolean }) {
  const [showComments, setShowComments] = useState(false);

  const userName = post.user?.profile?.fullName || post.user?.email?.split('@')[0] || 'مستخدم';
  const userInitial = userName.charAt(0).toUpperCase();
  const groupName = post.group?.name;
  const groupId = post.group?.id;

  const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://localhost:3000';
  const mediaUrl = post.mediaUrl?.startsWith('/uploads/') ? `${apiUrl}${post.mediaUrl}` : post.mediaUrl;

  return (
    <div className="rounded-xl bg-white p-5 shadow-sm border border-gray-100">
      <div className="mb-3 flex items-center gap-3">
        <div className="h-10 w-10 shrink-0 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
          {userInitial}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900">{userName}</p>
          <div className="flex items-center gap-2">
            {showGroupLink && groupName && (
              <a href={`/groups/${groupId}`} className="text-xs text-primary hover:underline truncate">
                في {groupName}
              </a>
            )}
            <span className="text-xs text-gray-400">
              {new Date(post.createdAt).toLocaleDateString('ar-EG', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </span>
          </div>
        </div>
      </div>

      <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">{post.content}</p>

      {mediaUrl && post.mediaType === 'image' && (
        <img src={mediaUrl} alt="" className="mt-3 rounded-lg w-full object-cover max-h-80" />
      )}
      {mediaUrl && post.mediaType === 'video' && (
        <video src={mediaUrl} controls className="mt-3 rounded-lg w-full max-h-80" />
      )}
      {mediaUrl && !post.mediaType && (
        <img src={mediaUrl} alt="" className="mt-3 rounded-lg w-full object-cover max-h-80" />
      )}

      <div className="mt-3 pt-3 border-t">
        <ReactionBar postId={post.id} />
      </div>

      <div className="mt-2">
        <button
          onClick={() => setShowComments(!showComments)}
          className="text-xs text-gray-500 hover:text-primary transition-colors"
        >
          💬 {showComments ? 'إخفاء التعليقات' : 'عرض التعليقات'}
        </button>
      </div>

      {showComments && <CommentSection postId={post.id} />}
    </div>
  );
}

// ─── Post Feed ────────────────────────────────────────────────
export const PostFeed = () => {
  const { data, isLoading, isError } = useFeed();

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-40 rounded-xl bg-white animate-pulse border border-gray-100" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-xl bg-red-50 p-4 text-sm text-red-600">فشل تحميل المنشورات</div>
    );
  }

  const posts: any[] = data?.data ?? [];

  return (
    <div className="space-y-4">
      {posts.length === 0 ? (
        <div className="rounded-xl bg-white p-8 text-center text-gray-400 border border-gray-100">
          <p className="text-3xl mb-2">📝</p>
          <p className="text-sm font-medium">لا توجد منشورات بعد</p>
          <p className="text-xs mt-1 text-gray-300">انضم لمجتمعات وشارك منشورات</p>
        </div>
      ) : (
        posts.map((p) => <PostCard key={p.id} post={p} />)
      )}
    </div>
  );
};
