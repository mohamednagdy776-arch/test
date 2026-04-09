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
      alert('حجم الملف كبير جداً. الحد الأقصى 50 ميجا');
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
        <div className="h-40 rounded-xl bg-white animate-pulse" />
        <div className="h-40 rounded-xl bg-white animate-pulse" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <p className="text-2xl mb-2">⚠️</p>
        <p className="text-gray-500">حدث خطأ في تحميل المجتمع</p>
        <button
          onClick={() => router.push('/groups')}
          className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
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
      {/* Back button */}
      <button
        onClick={() => router.push('/groups')}
        className="mb-4 flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
      >
        <svg className="h-4 w-4 rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        عودة للمجتمعات
      </button>

      {/* Group Header */}
      <div className="rounded-xl bg-white p-5 shadow-sm border border-gray-100 mb-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-xl font-bold text-gray-900">{group.name}</h1>
              <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                group.privacy === 'public' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
              }`}>
                {group.privacy === 'public' ? 'عام' : 'خاص'}
              </span>
            </div>
            <p className="text-sm text-gray-600">{group.description || 'لا يوجد وصف'}</p>
            <p className="mt-1 text-xs text-gray-400">{group.memberCount ?? 0} عضو · {posts.length} منشور</p>
          </div>
          <div className="shrink-0">
            {group.isMember ? (
              <button
                onClick={() => leaveGroup.mutate(id)}
                disabled={leaveGroup.isPending}
                className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                مغادرة
              </button>
            ) : (
              <button
                onClick={() => joinGroup.mutate(id)}
                disabled={joinGroup.isPending}
                className="rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                انضم
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Create Post (only for members) */}
      {group.isMember && (
        <div className="mb-4">
          {!showForm ? (
            <button
              onClick={() => setShowForm(true)}
              className="w-full rounded-xl bg-white p-4 text-right text-sm text-gray-400 shadow-sm border border-gray-100 hover:border-gray-200 transition-colors"
            >
              ✏️ شارك شيئاً في هذا المجتمع...
            </button>
          ) : (
            <form onSubmit={handleSubmit} className="rounded-xl bg-white p-4 shadow-sm border border-gray-100">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="ماذا تفكر؟"
                rows={3}
                className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />

              {/* Media Preview */}
              {mediaPreview && (
                <div className="relative mt-3 inline-block">
                  {mediaFile?.type.startsWith('video/') ? (
                    <video src={mediaPreview} controls className="rounded-lg max-h-48 max-w-full" />
                  ) : (
                    <img src={mediaPreview} alt="" className="rounded-lg max-h-48 max-w-full object-cover" />
                  )}
                  <button
                    type="button"
                    onClick={removeMedia}
                    className="absolute -top-2 -left-2 h-6 w-6 rounded-full bg-red-500 text-white text-xs flex items-center justify-center hover:bg-red-600"
                  >
                    ✕
                  </button>
                </div>
              )}

              {/* Actions */}
              <div className="mt-3 flex items-center justify-between">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    🖼️ صورة
                  </button>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50 transition-colors"
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
                    className="rounded-lg px-3 py-1.5 text-xs text-gray-500 hover:bg-gray-50 transition-colors"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    disabled={(!content.trim() && !mediaFile) || createPost.isPending || createPostWithMedia.isPending}
                    className="rounded-lg bg-primary px-4 py-1.5 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
                  >
                    {createPost.isPending || createPostWithMedia.isPending ? 'جاري النشر...' : 'نشر'}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Posts */}
      <div className="space-y-4">
        {isLoadingPosts ? (
          [1, 2, 3].map((i) => (
            <div key={i} className="h-40 rounded-xl bg-white animate-pulse border border-gray-100" />
          ))
        ) : posts.length === 0 ? (
          <div className="rounded-xl bg-white p-8 text-center text-gray-400 border border-gray-100">
            <p className="text-3xl mb-2">📝</p>
            <p className="text-sm font-medium">لا توجد منشورات بعد</p>
            <p className="text-xs mt-1 text-gray-300">كن أول من يشارك في هذا المجتمع</p>
          </div>
        ) : (
          posts.map((p: any) => <PostCard key={p.id} post={p} showGroupLink={false} />)
        )}
      </div>
    </div>
  );
}
