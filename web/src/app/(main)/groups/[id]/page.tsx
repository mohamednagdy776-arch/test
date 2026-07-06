'use client';
import { useState, useRef } from 'react';
import { resolveMediaUrl } from '@/lib/media';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { useGroup, useJoinGroup, useLeaveGroup, useDeleteGroup, useUpdateGroup, useGroupMembers, useBanMember, useUnbanMember, useApproveJoinRequest, useRejectJoinRequest } from '@/features/groups/hooks';
import { useGroupPosts, useCreatePostWithMedia, useCreatePost } from '@/features/posts/hooks';
import { PostCard } from '@/features/posts/components/PostCard';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import {
  ArrowLeft, Users, Trash, SignOut, Lock, Globe, EyeSlash,
  PencilLine, Image as ImageIcon, VideoCamera, X, Check,
} from '@phosphor-icons/react';


function privacyInfo(privacy: string) {
  if (privacy === 'public')  return { label: 'عام',  icon: Globe,     style: { background: 'color-mix(in srgb, var(--primary) 10%, var(--muted))', color: 'var(--primary)' } };
  if (privacy === 'private') return { label: 'خاص',  icon: Lock,      style: { background: 'color-mix(in srgb, var(--accent) 12%, var(--muted))',  color: 'var(--accent)' } };
  return                            { label: 'سري',  icon: EyeSlash,  style: { background: 'color-mix(in srgb, var(--destructive) 10%, var(--muted))', color: 'var(--destructive)' } };
}

export default function GroupDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router  = useRouter();
  const { data, isLoading, error } = useGroup(id);
  const { data: postsData, isLoading: isLoadingPosts } = useGroupPosts(id, 1, 50);
  const joinGroup   = useJoinGroup();
  const leaveGroup  = useLeaveGroup();
  const deleteGroup = useDeleteGroup();
  const updateGroup = useUpdateGroup();
  const banMember   = useBanMember(id);
  const unbanMember = useUnbanMember(id);
  const approveJoinRequest = useApproveJoinRequest(id);
  const rejectJoinRequest  = useRejectJoinRequest(id);
  const { data: membersData } = useGroupMembers(id);
  const createPost            = useCreatePost();
  const createPostWithMedia   = useCreatePostWithMedia();
  const { showToast }         = useToast() as any;
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showManageModal, setShowManageModal] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [content, setContent]     = useState('');
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [showForm, setShowForm]   = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
      showToast('الملف غير مدعوم. يرجى اختيار صورة أو فيديو', 'error');
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      showToast('حجم الملف كبير جداً. الحد الأقصى 50 ميغا', 'error');
      return;
    }
    setMediaFile(file);
    setMediaPreview(URL.createObjectURL(file));
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
      setContent(''); removeMedia(); setShowForm(false);
      showToast('تم نشر المنشور بنجاح', 'success');
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'فشل نشر المنشور، يرجى المحاولة مجدداً', 'error');
    }
  };

  // ── Loading state ──────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto space-y-4">
        <div className="h-52 rounded-2xl animate-pulse" style={{ background: 'var(--muted)' }} />
        <div className="h-40 rounded-2xl animate-pulse" style={{ background: 'var(--muted)' }} />
        <div className="h-40 rounded-2xl animate-pulse" style={{ background: 'var(--muted)' }} />
      </div>
    );
  }

  // ── Error state ────────────────────────────────────────────────
  if (error || !data) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16">
        <div className="mx-auto mb-4 w-16 h-16 rounded-2xl flex items-center justify-center"
          style={{ background: 'color-mix(in srgb, var(--primary) 10%, var(--muted))' }}>
          <Users size={30} weight="light" style={{ color: 'var(--primary)', opacity: 0.5 }} />
        </div>
        <p className="font-bold mb-1" style={{ color: 'var(--foreground)' }}>تعذّر تحميل المجتمع</p>
        <p className="text-sm mb-5" style={{ color: 'var(--muted-foreground)' }}>حدث خطأ أثناء التحميل، يرجى المحاولة مجدداً</p>
        <button onClick={() => router.push('/groups')}
          className="px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:scale-105"
          style={{ background: 'linear-gradient(135deg, var(--primary), var(--secondary))' }}>
          العودة للمجتمعات
        </button>
      </div>
    );
  }

  const group = data.data || data;
  const posts: any[] = postsData?.data ?? [];
  const coverSrc = group.coverPhoto
    ? (resolveMediaUrl(group.coverPhoto))
    : null;
  const privacy   = privacyInfo(group.privacy);
  const PrivacyIcon = privacy.icon;
  const isPosting = createPost.isPending || createPostWithMedia.isPending;

  return (
    <div className="max-w-2xl mx-auto space-y-5 pb-24 lg:pb-8">

      {/* ── Back button ──────────────────────────────────────── */}
      <button onClick={() => router.push('/groups')}
        className="flex items-center gap-1.5 text-sm font-medium transition-all hover:gap-2"
        style={{ color: 'var(--primary)' }}>
        <ArrowLeft size={15} />
        عودة للمجتمعات
      </button>

      {/* ── Group hero card ───────────────────────────────────── */}
      <div className="rounded-2xl overflow-hidden"
        style={{ background: 'var(--card)', border: '1px solid var(--border)', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>

        {/* Cover / Hero banner */}
        <div className="relative h-48">
          {coverSrc ? (
            <Image src={coverSrc} alt={group.name} fill className="object-cover" />
          ) : (
            <div className="absolute inset-0"
              style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 55%, var(--accent) 100%)' }}>
              <div className="absolute inset-0 flex items-center justify-center text-white/20 text-8xl font-black">
                {(group.name || 'م').charAt(0)}
              </div>
            </div>
          )}
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 60%)' }} />

          {/* Privacy badge */}
          <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 rounded-xl backdrop-blur-sm text-xs font-bold"
            style={privacy.style}>
            <PrivacyIcon size={11} />
            {privacy.label}
          </div>
        </div>

        <div className="p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-extrabold mb-1 truncate" style={{ color: 'var(--foreground)' }}>{group.name}</h1>
              {group.category && (
                <span className="inline-block text-xs font-semibold rounded-lg px-2 py-0.5 mb-2"
                  style={{ background: 'var(--muted)', color: 'var(--muted-foreground)' }}>
                  {group.category}
                </span>
              )}
              <p className="text-sm leading-relaxed mb-3" style={{ color: 'var(--muted-foreground)' }}>
                {group.description || 'لا يوجد وصف للمجتمع'}
              </p>
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5 text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>
                  <Users size={13} />
                  {(group.memberCount ?? 0).toLocaleString('ar-SA')} عضو
                </span>
                <span className="flex items-center gap-1.5 text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>
                  <PencilLine size={13} />
                  {posts.length.toLocaleString('ar-SA')} منشور
                </span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="shrink-0 flex items-center gap-2">
              {(group.isOwner || group.isAdmin) && (
                <button onClick={() => { setEditName(group.name || ''); setEditDescription(group.description || ''); setShowManageModal(true); }}
                  aria-label="إدارة المجتمع"
                  className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-medium transition-all hover:scale-105 active:scale-95"
                  style={{ border: '1px solid var(--border)', color: 'var(--foreground)' }}>
                  <PencilLine size={13} />
                  إدارة
                </button>
              )}
              {(group.isOwner || group.isAdmin) && (
                <button onClick={() => setShowDeleteModal(true)} disabled={deleteGroup.isPending}
                  aria-label="حذف المجتمع"
                  className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-medium transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                  style={{ border: '1px solid color-mix(in srgb, var(--destructive) 30%, var(--border))', color: 'var(--destructive)' }}>
                  <Trash size={13} />
                  {deleteGroup.isPending ? '...' : 'حذف'}
                </button>
              )}
              {group.isMember ? (
                <button
                  onClick={async () => {
                    try {
                      await leaveGroup.mutateAsync(id);
                      showToast('غادرت المجتمع', 'success');
                      router.push('/groups');
                    } catch (err: any) {
                      showToast(err?.response?.data?.message || 'فشل مغادرة المجتمع', 'error');
                    }
                  }}
                  disabled={leaveGroup.isPending}
                  className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-medium transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                  style={{ border: '1px solid var(--border)', color: 'var(--muted-foreground)' }}>
                  <SignOut size={13} />
                  {leaveGroup.isPending ? '...' : 'مغادرة'}
                </button>
              ) : (
                <button
                  onClick={async () => {
                    try {
                      const res: any = await joinGroup.mutateAsync(id);
                      const joinStatus = res?.data?.joinStatus ?? res?.joinStatus;
                      showToast(
                        joinStatus === 'pending'
                          ? 'تم إرسال طلب الانضمام، في انتظار موافقة المشرف'
                          : 'انضممت إلى المجتمع',
                        'success',
                      );
                    } catch (err: any) {
                      showToast(err?.response?.data?.message || 'فشل الانضمام إلى المجتمع', 'error');
                    }
                  }}
                  disabled={joinGroup.isPending}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg, var(--primary), var(--secondary))', boxShadow: '0 4px 14px color-mix(in srgb, var(--primary) 30%, transparent)' }}>
                  <Users size={14} weight="fill" />
                  {joinGroup.isPending ? 'جاري...' : 'انضم'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Post composer ─────────────────────────────────────── */}
      {group.isMember && (
        <div>
          {!showForm ? (
            <button onClick={() => setShowForm(true)}
              className="w-full flex items-center gap-3 px-5 py-4 rounded-2xl text-sm font-medium text-right transition-all hover:scale-[1.01]"
              style={{ background: 'var(--card)', border: '1px solid var(--border)', color: 'var(--muted-foreground)', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: 'color-mix(in srgb, var(--primary) 10%, var(--muted))' }}>
                <PencilLine size={15} style={{ color: 'var(--primary)' }} />
              </div>
              <span>شارك شيئاً في هذا المجتمع...</span>
            </button>
          ) : (
            <form onSubmit={handleSubmit} className="rounded-2xl overflow-hidden"
              style={{ background: 'var(--card)', border: '1px solid var(--border)', boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}>
              <div className="p-4">
                <textarea value={content} onChange={(e) => setContent(e.target.value)}
                  placeholder="ماذا تفكر؟ شارك مجتمعك..." rows={3}
                  className="w-full resize-none rounded-xl px-4 py-3 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
                  style={{ background: 'var(--background)', border: '1px solid var(--border)', color: 'var(--foreground)' }} />

                {mediaPreview && (
                  <div className="relative mt-3 inline-block">
                    {mediaFile?.type.startsWith('video/') ? (
                      <video src={mediaPreview} controls className="rounded-xl max-h-48 max-w-full" />
                    ) : (
                      <Image src={mediaPreview} alt="" width={200} height={200}
                        className="rounded-xl max-h-48 w-auto object-cover" />
                    )}
                    <button type="button" onClick={removeMedia} aria-label="إزالة الوسائط"
                      className="absolute -top-2 -left-2 w-6 h-6 rounded-full flex items-center justify-center text-white transition-all hover:scale-110"
                      style={{ background: 'var(--destructive)' }}>
                      <X size={11} weight="bold" />
                    </button>
                  </div>
                )}

                <div className="mt-4 flex items-center justify-between gap-3">
                  <div className="flex gap-2">
                    <button type="button" onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all hover:scale-105"
                      style={{ border: '1px solid var(--border)', color: 'var(--muted-foreground)' }}>
                      <ImageIcon size={13} /> صورة
                    </button>
                    <button type="button" onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all hover:scale-105"
                      style={{ border: '1px solid var(--border)', color: 'var(--muted-foreground)' }}>
                      <VideoCamera size={13} /> فيديو
                    </button>
                    <input ref={fileInputRef} type="file" accept="image/*,video/*" onChange={handleFileChange} className="hidden" />
                  </div>
                  <div className="flex gap-2">
                    <button type="button"
                      onClick={() => { setShowForm(false); setContent(''); removeMedia(); }}
                      className="px-3 py-2 rounded-xl text-xs font-medium transition-all hover:scale-105"
                      style={{ color: 'var(--muted-foreground)' }}>
                      إلغاء
                    </button>
                    <button type="submit" disabled={(!content.trim() && !mediaFile) || isPosting}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
                      style={{ background: 'linear-gradient(135deg, var(--primary), var(--secondary))' }}>
                      <Check size={12} weight="bold" />
                      {isPosting ? 'جاري النشر...' : 'نشر'}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          )}
        </div>
      )}

      {/* ── Posts feed ────────────────────────────────────────── */}
      <div className="space-y-4">
        {isLoadingPosts ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-40 rounded-2xl animate-pulse" style={{ background: 'var(--muted)' }} />
          ))
        ) : posts.length === 0 ? (
          <div className="rounded-2xl p-12 text-center"
            style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
            <div className="mx-auto mb-3 w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{ background: 'color-mix(in srgb, var(--primary) 10%, var(--muted))' }}>
              <PencilLine size={26} weight="light" style={{ color: 'var(--primary)', opacity: 0.5 }} />
            </div>
            <p className="font-bold" style={{ color: 'var(--foreground)' }}>لا توجد منشورات بعد</p>
            <p className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>كن أول من يشارك في هذا المجتمع</p>
          </div>
        ) : (
          posts.map((p: any) => <PostCard key={p.id} post={p} showGroupLink={false} />)
        )}
      </div>

      {/* ── Delete confirmation modal ─────────────────────────── */}
      <Modal open={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="حذف المجتمع">
        <div className="space-y-4">
          <div className="rounded-xl p-4 text-sm leading-relaxed"
            style={{ background: 'color-mix(in srgb, var(--destructive) 6%, var(--muted))', color: 'var(--foreground)' }}>
            هل أنت متأكد من حذف <strong>{group.name}</strong>؟ لا يمكن التراجع عن هذا الإجراء وسيُحذف المجتمع نهائياً مع كل منشوراته.
          </div>
          <div className="flex gap-3">
            <button onClick={() => setShowDeleteModal(false)}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all hover:scale-[1.01]"
              style={{ border: '1px solid var(--border)', color: 'var(--muted-foreground)' }}>
              إلغاء
            </button>
            <button
              onClick={async () => {
                setShowDeleteModal(false);
                try {
                  await deleteGroup.mutateAsync(id);
                  showToast('تم حذف المجتمع', 'success');
                  router.push('/groups');
                } catch (err: any) {
                  showToast(err?.response?.data?.message || 'فشل حذف المجتمع', 'error');
                }
              }}
              disabled={deleteGroup.isPending}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:scale-[1.01] active:scale-95 disabled:opacity-50"
              style={{ background: 'var(--destructive)' }}>
              <Trash size={13} />
              {deleteGroup.isPending ? 'جاري...' : 'تأكيد الحذف'}
            </button>
          </div>
        </div>
      </Modal>

      <Modal open={showManageModal} onClose={() => setShowManageModal(false)} title="إدارة المجتمع" size="lg">
        <div className="space-y-6">
          <div className="space-y-3">
            <h3 className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>تعديل التفاصيل</h3>
            <div>
              <label className="mb-1 block text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>الاسم</label>
              <input value={editName} onChange={(e) => setEditName(e.target.value)}
                className="w-full rounded-xl border px-3 py-2 text-sm"
                style={{ borderColor: 'var(--border)', color: 'var(--foreground)', background: 'var(--card)' }} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>الوصف</label>
              <textarea value={editDescription} onChange={(e) => setEditDescription(e.target.value)} rows={3}
                className="w-full rounded-xl border px-3 py-2 text-sm resize-none"
                style={{ borderColor: 'var(--border)', color: 'var(--foreground)', background: 'var(--card)' }} />
            </div>
            <button
              onClick={async () => {
                try {
                  await updateGroup.mutateAsync({ id, data: { name: editName, description: editDescription } });
                  showToast('تم تحديث المجتمع', 'success');
                } catch (err: any) {
                  showToast(err?.response?.data?.message || 'فشل تحديث المجتمع', 'error');
                }
              }}
              disabled={updateGroup.isPending || !editName.trim()}
              className="rounded-xl px-4 py-2 text-sm font-bold text-white transition-all disabled:opacity-50"
              style={{ background: 'var(--primary)' }}>
              {updateGroup.isPending ? 'جاري الحفظ...' : 'حفظ التعديلات'}
            </button>
          </div>

          <div className="space-y-3 border-t pt-4" style={{ borderColor: 'var(--border)' }}>
            <h3 className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>الأعضاء ({membersData?.data?.total ?? membersData?.total ?? 0})</h3>
            <div className="max-h-72 overflow-y-auto space-y-2">
              {(membersData?.data?.data ?? membersData?.data ?? []).map((m: any) => (
                <div key={m.id} className="flex items-center justify-between rounded-xl border p-2.5" style={{ borderColor: 'var(--border)' }}>
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-sm font-medium truncate" style={{ color: 'var(--foreground)' }}>{m.fullName || m.username || 'مستخدم'}</span>
                    {m.role === 'admin' && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium" style={{ background: 'color-mix(in srgb, var(--primary) 12%, var(--muted))', color: 'var(--primary)' }}>مشرف</span>
                    )}
                    {m.isBanned && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium" style={{ background: 'color-mix(in srgb, var(--destructive) 12%, var(--muted))', color: 'var(--destructive)' }}>محظور</span>
                    )}
                    {m.status === 'pending' && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium" style={{ background: 'color-mix(in srgb, var(--accent) 15%, var(--muted))', color: 'var(--accent)' }}>بانتظار الموافقة</span>
                    )}
                  </div>
                  {/* Pending join requests only had a Block action available --
                      no way to actually accept or reject them (#302). */}
                  {m.status === 'pending' ? (
                    <div className="flex items-center gap-2 shrink-0">
                      <button onClick={() => rejectJoinRequest.mutate(m.id)} disabled={rejectJoinRequest.isPending}
                        className="text-xs font-medium" style={{ color: 'var(--destructive)' }}>
                        رفض
                      </button>
                      <button onClick={() => approveJoinRequest.mutate(m.id)} disabled={approveJoinRequest.isPending}
                        className="text-xs font-medium" style={{ color: 'var(--primary)' }}>
                        قبول
                      </button>
                    </div>
                  ) : m.role !== 'admin' && (
                    m.isBanned ? (
                      <button onClick={() => unbanMember.mutate(m.id)} disabled={unbanMember.isPending}
                        className="text-xs font-medium shrink-0" style={{ color: 'var(--primary)' }}>
                        إلغاء الحظر
                      </button>
                    ) : (
                      <button onClick={() => banMember.mutate(m.id)} disabled={banMember.isPending}
                        className="text-xs font-medium shrink-0" style={{ color: 'var(--destructive)' }}>
                        حظر
                      </button>
                    )
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
