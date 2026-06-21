'use client';
import { useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useGroup, useJoinGroup, useLeaveGroup, useDeleteGroup } from '@/features/groups/hooks';
import { useGroupPosts, useCreatePostWithMedia, useCreatePost } from '@/features/posts/hooks';
import { PostCard } from '@/features/posts/components/PostCard';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';

export default function GroupDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data, isLoading, error } = useGroup(id);
  const { data: postsData, isLoading: isLoadingPosts } = useGroupPosts(id, 1, 50);
  const joinGroup = useJoinGroup();
  const leaveGroup = useLeaveGroup();
  const deleteGroup = useDeleteGroup();
  const createPost = useCreatePost();
  const createPostWithMedia = useCreatePostWithMedia();
  const { showToast } = useToast();
  const [showDeleteGroupModal, setShowDeleteGroupModal] = useState(false);

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
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'فشل نشر المنشور، يرجى المحاولة مجدداً', 'error');
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto space-y-4">
        <div className="h-48 rounded-2xl bg-gradient-to-br from-[var(--muted)]/50 to-amber-100/30 animate-pulse" />
        <div className="h-48 rounded-2xl bg-[var(--card)] animate-pulse" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <p className="text-3xl mb-3">⚠️</p>
        <p className="text-[var(--primary)]">حدث خطأ في تحميل المجتمع</p>
        <button
          onClick={() => router.push('/groups')}
          className="mt-5 rounded-2xl bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-black/10 hover:shadow-xl hover:shadow-black/10 transition-all"
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
        className="mb-4 flex items-center gap-2 text-sm text-[var(--primary)]/70 hover:text-[var(--primary)] transition-colors font-medium"
      >
        <svg className="w-4 h-4 rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        عودة للمجتمعات
      </button>

      <div className="bg-[var(--card)] rounded-2xl p-6 shadow-lg shadow-black/5 border border-[var(--border)] mb-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <h1 className="text-xl font-bold text-[var(--foreground)]">{group.name}</h1>
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                group.privacy === 'public' ? 'bg-[var(--muted)] text-[var(--primary)]' : group.privacy === 'secret' ? 'bg-slate-100 text-slate-600' : 'bg-amber-100 text-amber-700'
              }`}>
                {group.privacy === 'public' ? 'عام' : group.privacy === 'secret' ? 'سري' : 'خاص'}
              </span>
            </div>
            <p className="text-sm text-[var(--primary)]/70">{group.description || 'لا يوجد وصف'}</p>
            <p className="mt-2 text-xs text-[var(--primary)]/50">{group.memberCount ?? 0} عضو · {posts.length} منشور</p>
          </div>
          <div className="shrink-0 flex items-center gap-2">
            {(group.isOwner || group.isAdmin) && (
              <button
                onClick={() => setShowDeleteGroupModal(true)}
                disabled={deleteGroup.isPending}
                className="rounded-xl border border-red-200 px-3 py-2 text-sm font-medium text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
              >
                {deleteGroup.isPending ? '...' : '🗑 حذف'}
              </button>
            )}
            {group.isMember ? (
              <button
                onClick={() => leaveGroup.mutate(id)}
                disabled={leaveGroup.isPending}
                className="rounded-xl border border-[var(--border)]/50 px-4 py-2 text-sm font-medium text-[var(--primary)] hover:bg-[var(--muted)] transition-colors disabled:opacity-50"
              >
                مغادرة
              </button>
            ) : (
              <button
                onClick={() => joinGroup.mutate(id)}
                disabled={joinGroup.isPending}
                className="rounded-xl bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-black/10 hover:shadow-xl hover:shadow-black/10 transition-all disabled:opacity-50"
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
              className="w-full rounded-2xl bg-[var(--card)] p-4 text-right text-sm text-[var(--primary)]/60 shadow-lg shadow-black/5 border border-[var(--border)] hover:border-[var(--border)] transition-colors font-medium"
            >
              ✏️ شارك شيئاً في هذا المجتمع...
            </button>
          ) : (
            <form onSubmit={handleSubmit} className="rounded-2xl bg-[var(--card)] p-5 shadow-lg shadow-black/5 border border-[var(--border)]">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="ماذا تفكر؟"
                rows={3}
                className="w-full resize-none rounded-xl border border-[var(--border)]/50 px-4 py-3 text-sm focus:border-[var(--ring)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 bg-[var(--card)] text-[var(--foreground)] placeholder-[var(--muted-foreground)]/50"
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
                    className="flex items-center gap-2 rounded-xl border border-[var(--border)]/50 px-4 py-2 text-sm text-[var(--primary)] hover:bg-[var(--muted)] transition-colors"
                  >
                    🖼️ صورة
                  </button>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 rounded-xl border border-[var(--border)]/50 px-4 py-2 text-sm text-[var(--primary)] hover:bg-[var(--muted)] transition-colors"
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
                    className="rounded-xl px-4 py-2 text-sm text-[var(--primary)]/70 hover:bg-[var(--muted)] transition-colors"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    disabled={(!content.trim() && !mediaFile) || createPost.isPending || createPostWithMedia.isPending}
                    className="rounded-xl bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-black/10 hover:shadow-xl hover:shadow-black/10 transition-all disabled:opacity-50"
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
            <div key={i} className="h-40 rounded-2xl bg-[var(--card)] animate-pulse border border-[var(--border)]" />
          ))
        ) : posts.length === 0 ? (
          <div className="rounded-2xl bg-[var(--card)] p-8 text-center text-[var(--primary)]/60 border border-[var(--border)]">
            <p className="text-3xl mb-2">📝</p>
            <p className="text-sm font-medium">لا توجد منشورات بعد</p>
            <p className="text-xs mt-1 text-[var(--primary)]/50">كن أول من يشارك في هذا المجتمع</p>
          </div>
        ) : (
          posts.map((p: any) => <PostCard key={p.id} post={p} showGroupLink={false} />)
        )}
      </div>

      <Modal open={showDeleteGroupModal} onClose={() => setShowDeleteGroupModal(false)} title="حذف المجتمع">
        <div className="space-y-4">
          <p className="text-sm text-[var(--primary)]">هل أنت متأكد من حذف هذا المجتمع؟ لا يمكن التراجع عن هذا الإجراء.</p>
          <div className="flex gap-3">
            <button onClick={() => setShowDeleteGroupModal(false)} className="flex-1 rounded-xl border border-[var(--border)] py-2.5 text-sm text-[var(--primary)] hover:bg-[var(--muted)] transition-colors">إلغاء</button>
            <button
              onClick={async () => {
                setShowDeleteGroupModal(false);
                try {
                  await deleteGroup.mutateAsync(id);
                  showToast('تم حذف المجتمع', 'success');
                  router.push('/groups');
                } catch (err: any) {
                  showToast(err?.response?.data?.message || 'فشل حذف المجتمع', 'error');
                }
              }}
              disabled={deleteGroup.isPending}
              className="flex-1 rounded-xl bg-red-500 py-2.5 text-sm font-semibold text-white hover:bg-red-600 disabled:opacity-50 transition-colors"
            >
              تأكيد الحذف
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}