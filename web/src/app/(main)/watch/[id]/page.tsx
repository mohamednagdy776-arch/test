'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useVideo, useVideoComments, useAddVideoComment, useLikeVideo, useUnlikeVideo, useRecommendedVideos } from '@/features/videos/hooks';
import { Avatar } from '@/components/ui/Avatar';
import { Spinner } from '@/components/ui/Spinner';

function VideoPlayer({ video }: { video: any }) {
  const [liked, setLiked] = useState<boolean>(() => !!video?.isLiked);
  const [shared, setShared] = useState(false);
  const likeVideo = useLikeVideo();
  const unlikeVideo = useUnlikeVideo();

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title: video.title, url }).catch(() => {});
    } else {
      await navigator.clipboard.writeText(url);
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    }
  };

  const handleLike = () => {
    if (liked) {
      unlikeVideo.mutate(video.id);
      setLiked(false);
    } else {
      likeVideo.mutate(video.id);
      setLiked(true);
    }
  };

  const formatViews = (count: number) => {
    if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}م`;
    if (count >= 1_000) return `${(count / 1_000).toFixed(1)}الف`;
    return String(count);
  };

  return (
    <div className="space-y-4">
      <div className="relative aspect-video rounded-2xl overflow-hidden bg-black shadow-xl">
        {video.url ? (
          <video
            src={video.url}
            controls
            className="w-full h-full"
            poster={video.thumbnail}
          />
        ) : video.thumbnail ? (
          <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-6xl">🎬</div>
        )}
      </div>

      <div>
        <h1 className="text-lg font-bold text-[#065F46]">{video.title}</h1>
        <div className="flex items-center justify-between mt-2 flex-wrap gap-3">
          <p className="text-sm text-[#10B981]">
            {formatViews(video.viewCount ?? 0)} مشاهدة
            {video.createdAt ? ` · ${new Date(video.createdAt).toLocaleDateString('ar-SA', { day: 'numeric', month: 'long', year: 'numeric' })}` : ''}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={handleLike}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all ${
                liked
                  ? 'bg-red-50 text-red-500 border border-red-200'
                  : 'bg-[#DCFCE7]/40 text-[#10B981] hover:bg-[#DCFCE7]/70 border border-emerald-100'
              }`}
            >
              {liked ? '❤️' : '🤍'} {liked ? 'أعجبني' : 'إعجاب'}
            </button>
            <button
              onClick={handleShare}
              className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold bg-[#DCFCE7]/40 text-[#10B981] hover:bg-[#DCFCE7]/70 border border-emerald-100 transition-all"
            >
              {shared ? '✓ تم النسخ' : '🔗 مشاركة'}
            </button>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 py-3 border-y border-emerald-100">
        <Avatar src={video.user?.avatar} name={video.user?.name} size="md" />
        <div>
          <p className="font-semibold text-[#065F46] text-sm">{video.user?.name ?? 'مستخدم'}</p>
          {video.user?.username && (
            <p className="text-xs text-[#10B981]">@{video.user.username}</p>
          )}
        </div>
      </div>

      {video.description && (
        <p className="text-sm text-[#10B981] leading-relaxed">{video.description}</p>
      )}

      {video.tags?.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {video.tags.map((tag: string) => (
            <span key={tag} className="text-xs px-3 py-1 bg-[#DCFCE7]/60 text-[#059669] rounded-full">
              #{tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function CommentsSection({ videoId }: { videoId: string }) {
  const { data, isLoading } = useVideoComments(videoId);
  const addComment = useAddVideoComment();
  const [text, setText] = useState('');

  const comments: any[] = data?.data ?? [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    addComment.mutate({ videoId, content: text.trim() });
    setText('');
  };

  return (
    <div className="space-y-4">
      <h3 className="font-bold text-[#065F46]">التعليقات {comments.length > 0 ? `(${comments.length})` : ''}</h3>

      <form onSubmit={handleSubmit} className="flex gap-3">
        <input
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="أضف تعليقاً..."
          className="flex-1 rounded-xl border border-emerald-200 px-4 py-2.5 text-sm text-[#065F46] focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 bg-[#FFFBEB]"
        />
        <button
          type="submit"
          disabled={!text.trim() || addComment.isPending}
          className="rounded-xl px-4 py-2.5 text-sm font-semibold bg-[#10B981] text-white hover:bg-[#059669] disabled:opacity-50 transition-colors shadow-lg shadow-emerald-500/25"
        >
          إرسال
        </button>
      </form>

      {isLoading ? (
        <div className="flex justify-center py-6"><Spinner /></div>
      ) : comments.length === 0 ? (
        <p className="text-center text-sm text-[#10B981] py-6">لا توجد تعليقات بعد. كن أول من يعلّق!</p>
      ) : (
        <div className="space-y-3">
          {comments.map((c: any) => (
            <div key={c.id} className="flex gap-3">
              <Avatar src={c.user?.avatar} name={c.user?.name} size="sm" />
              <div className="flex-1 rounded-2xl bg-[#ECFDF5] border border-emerald-100 px-4 py-3">
                <p className="text-xs font-semibold text-[#065F46] mb-1">{c.user?.name ?? 'مستخدم'}</p>
                <p className="text-sm text-[#10B981]">{c.content}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function RecommendedSidebar({ currentId }: { currentId: string }) {
  const router = useRouter();
  const { data, isLoading } = useRecommendedVideos();
  const videos: any[] = (data?.data ?? []).filter((v: any) => v.id !== currentId).slice(0, 8);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-20 rounded-xl bg-[#DCFCE7]/30 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="font-bold text-[#065F46] text-sm">فيديوهات مقترحة</h3>
      {videos.map((v: any) => (
        <div
          key={v.id}
          onClick={() => router.push(`/watch/${v.id}`)}
          className="flex gap-3 cursor-pointer rounded-xl p-2 hover:bg-[#DCFCE7]/40 transition-colors"
        >
          <div className="w-28 h-16 shrink-0 rounded-lg bg-[#DCFCE7] overflow-hidden">
            {v.thumbnail ? (
              <img src={v.thumbnail} alt={v.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xl">🎬</div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-[#065F46] line-clamp-2">{v.title}</p>
            <p className="text-[11px] text-[#10B981] mt-1">{v.user?.name ?? 'مستخدم'}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function VideoPlayerPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data, isLoading, isError } = useVideo(id);
  const video = data?.data;

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isError || !video) {
    return (
      <div className="text-center py-20">
        <div className="text-4xl mb-3">🎬</div>
        <p className="text-[#10B981] font-medium mb-4">لم يُعثر على الفيديو</p>
        <button
          onClick={() => router.push('/watch')}
          className="rounded-xl px-5 py-2.5 text-sm font-semibold bg-[#10B981] text-white hover:bg-[#059669] transition-colors shadow-lg shadow-emerald-500/25"
        >
          تصفّح الفيديوهات
        </button>
      </div>
    );
  }

  return (
    <div className="flex gap-6">
      <div className="flex-1 min-w-0 space-y-6">
        <VideoPlayer video={video} />
        <CommentsSection videoId={id} />
      </div>
      <aside className="hidden xl:block w-80 shrink-0">
        <div className="sticky top-[5.5rem]">
          <RecommendedSidebar currentId={id} />
        </div>
      </aside>
    </div>
  );
}
