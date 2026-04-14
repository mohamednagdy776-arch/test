'use client';
import { useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useGroup, useJoinGroup, useLeaveGroup } from '@/features/groups/hooks';
import { useGroupPosts, useCreatePostWithMedia, useCreatePost } from '@/features/posts/hooks';
import { PostCard } from '@/features/posts/components/PostCard';

export default function GroupDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data, isLoading, error } = useGroup(id);
  const { data: postsData, isLoading: isLoadingPosts } = useGroupPosts(id, 1, 50);
  const joinGroup = useJoinGroup();
  const leaveGroup = useLeaveGroup();
  const createPost = useCreatePost();
  const createPostWithMedia = useCreatePostWithMedia();

  const [content, setContent] = useState('');
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');
    if (!isImage && !isVideo) {
      alert('الملف غير مدعوم. يرجى اختيار صورة أو فيديو');
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      alert('حجم الملف كبير جداً. الحد الأقصى 50 ميا');
      return;
    }

    setMediaFile(file);
    const url = URL.createObjectURL(file);
    setMediaPreview(url);
  };

  const removeMedia = () => {
    setMediaFile(null);
    setMediaPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && !mediaFile) return;

    try {
      if (mediaFile) {
        await createPostWithMedia.mutateAsync({ groupId: id, content: content.trim() || '', file: mediaFile });
      } else {
        await createPost.mutateAsync({ groupId: id, content: content.trim() });
      }
      setContent('');
      removeMedia();
      setShowForm(false);
    } catch (err) {
      console.error('Failed to create post:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto space-y-4">
        <div className="h-48 rounded-2xl bg-gradient-to-br from-emerald-100/50 to-amber-100/30 animate-pulse" />
        <div className="h-48 rounded-2xl bg-gradient-to-br from-[#ECFDF5] to-[#F0FDF4] animate-pulse" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <p className="text-3xl mb-3">⚠️</p>
        <p className="text-emerald-700">حدث خطأ في تحميل المجتمع</p>
        <button
          onClick={() => router.push('/groups')}
          className="mt-5 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/30 transition-all"
        >
          العودة للمجتمعات
        </button>
      </div>
    );
  }

  const group = data.data || data;
  const posts: any[] = postsData?.data ?? [];

  return (
    <div className="max-w-2xl mx-auto">
      <button
        onClick={() => router.push('/groups')}
        className="mb-4 flex items-center gap-2 text-sm text-emerald-600/70 hover:text-emerald-700 transition-colors font-medium"
      >
        <svg className="w-4 h-4 rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        عودة للمجتمعات
      </button>

      <div className="bg-gradient-to-br from-[#ECFDF5] to-[#F0FDF4] rounded-2xl p-6 shadow-lg shadow-emerald-500/10 border border-emerald-100 mb-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <h1 className="text-xl font-bold text-emerald-900">{group.name}</h1>
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                group.privacy === 'public' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
              }`}>
                {group.privacy === 'public' ? 'عام' : 'خاص'}
              </span>
            </div>
            <p className="text-sm text-emerald-700/70">{group.description || 'لا يوجد وصف'}</p>
            <p className="mt-2 text-xs text-emerald-600/50">{group.memberCount ?? 0} عضو · {posts.length} منشور</p>
          </div>
          <div className="shrink-0">
            {group.isMember ? (
              <button
                onClick={() => leaveGroup.mutate(id)}
                disabled={leaveGroup.isPending}
                className="rounded-xl border border-emerald-200/50 px-4 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-50 transition-colors disabled:opacity-50"
              >
                مغادرة
              </button>
            ) : (
              <button
                onClick={() => joinGroup.mutate(id)}
                disabled={joinGroup.isPending}
                className="rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/30 transition-all disabled:opacity-50"
              >
                انضم
              </button>
            )}
          </div>
        </div>
      </div>

      {group.isMember && (
        <div className="mb-5">
          {!showForm ? (
            <button
              onClick={() => setShowForm(true)}
              className="w-full rounded-2xl bg-gradient-to-br from-[#ECFDF5] to-[#F0FDF4] p-4 text-right text-sm text-emerald-600/60 shadow-lg shadow-emerald-500/10 border border-emerald-100 hover:border-emerald-200 transition-colors font-medium"
            >
              ✏️ شارك شيئاً في هذا المجتمع...
            </button>
          ) : (
            <form onSubmit={handleSubmit} className="rounded-2xl bg-gradient-to-br from-[#ECFDF5] to-[#F0FDF4] p-5 shadow-lg shadow-emerald-500/10 border border-emerald-100">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="ماذا تفكر؟"
                rows={3}
                className="w-full resize-none rounded-xl border border-emerald-200/50 px-4 py-3 text-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 bg-white/80 text-emerald-900 placeholder-emerald-400/50"
              />

              {mediaPreview && (
                <div className="relative mt-3 inline-block">
                  {mediaFile?.type.startsWith('video/') ? (
                    <video src={mediaPreview} controls className="rounded-xl max-h-48 max-w-full" />
                  ) : (
                    <img src={mediaPreview} alt="" className="rounded-xl max-h-48 max-w-full object-cover" />
                  )}
                  <button
                    type="button"
                    onClick={removeMedia}
                    className="absolute -top-2 -left-2 h-7 w-7 rounded-full bg-rose-500 text-white text-sm flex items-center justify-center hover:bg-rose-600 transition-colors"
                  >
                    ✕
                  </button>
                </div>
              )}

              <div className="mt-4 flex items-center justify-between">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 rounded-xl border border-emerald-200/50 px-4 py-2 text-sm text-emerald-700 hover:bg-emerald-50 transition-colors"
                  >
                    🖼️ صورة
                  </button>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 rounded-xl border border-emerald-200/50 px-4 py-2 text-sm text-emerald-700 hover:bg-emerald-50 transition-colors"
                  >
                    🎬 فيديو
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,video/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => { setShowForm(false); setContent(''); removeMedia(); }}
                    className="rounded-xl px-4 py-2 text-sm text-emerald-600/70 hover:bg-emerald-50 transition-colors"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    disabled={(!content.trim() && !mediaFile) || createPost.isPending || createPostWithMedia.isPending}
                    className="rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/30 transition-all disabled:opacity-50"
                  >
                    {createPost.isPending || createPostWithMedia.isPending ? 'جاري النشر...' : 'نشر'}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      )}

      <div className="space-y-4">
        {isLoadingPosts ? (
          [1, 2, 3].map((i) => (
            <div key={i} className="h-40 rounded-2xl bg-gradient-to-br from-[#ECFDF5] to-[#F0FDF4] animate-pulse border border-emerald-100" />
          ))
        ) : posts.length === 0 ? (
          <div className="rounded-2xl bg-gradient-to-br from-[#ECFDF5] to-[#F0FDF4] p-8 text-center text-emerald-600/60 border border-emerald-100">
            <p className="text-3xl mb-2">📝</p>
            <p className="text-sm font-medium">لا توجد منشورات بعد</p>
            <p className="text-xs mt-1 text-emerald-500/50">كن أول من يشارك في هذا المجتمع</p>
          </div>
        ) : (
          posts.map((p: any) => <PostCard key={p.id} post={p} showGroupLink={false} />)
        )}
      </div>
    </div>
  );
}