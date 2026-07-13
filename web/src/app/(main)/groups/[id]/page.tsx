'use client';
import { useState } from 'react';
import { resolveMediaUrl } from '@/lib/media';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { useGroup, useJoinGroup, useLeaveGroup, useDeleteGroup, useUpdateGroup, useGroupMembers, useInviteMember, useBanMember, useUnbanMember, useApproveJoinRequest, useRejectJoinRequest } from '@/features/groups/hooks';
import { useFriends } from '@/features/friends/hooks';
import { useGroupPosts } from '@/features/posts/hooks';
import { PostCard } from '@/features/posts/components/PostCard';
import { PostComposer } from '@/features/posts/components/PostComposer';
import { Modal } from '@/components/ui/Modal';
import { Avatar } from '@/components/ui/Avatar';
import { useToast } from '@/components/ui/Toast';
import {
  ArrowLeft, Users, Trash, SignOut, Lock, Globe, EyeSlash,
  PencilLine, UserPlus,
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
  const inviteMember = useInviteMember(id);
  const banMember   = useBanMember(id);
  const unbanMember = useUnbanMember(id);
  const approveJoinRequest = useApproveJoinRequest(id);
  const rejectJoinRequest  = useRejectJoinRequest(id);
  const { data: membersData } = useGroupMembers(id);
  const { data: friendsData } = useFriends();
  const { showToast }         = useToast() as any;
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showManageModal, setShowManageModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
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
              {/* No invite mechanism existed at all -- secret groups are
                  invite-only and aren't discoverable, so there was no way to
                  grow one past its creator (#299). */}
              {(group.isOwner || group.isAdmin) && (
                <button onClick={() => setShowInviteModal(true)}
                  aria-label="دعوة عضو"
                  className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-medium transition-all hover:scale-105 active:scale-95"
                  style={{ border: '1px solid var(--border)', color: 'var(--foreground)' }}>
                  <UserPlus size={13} />
                  دعوة عضو
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
      {/* Was a hand-rolled form limited to text/image/video, missing every
          other option the public composer has (poll, feelings, background
          color, tagging, location, audience...) (#360). */}
      {group.isMember && (
        <PostComposer groupId={id} onSuccess={() => showToast('تم نشر المنشور بنجاح', 'success')} />
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

      <Modal open={showInviteModal} onClose={() => setShowInviteModal(false)} title="دعوة عضو">
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {(() => {
            const friends: any[] = friendsData?.data ?? [];
            const memberIds = new Set((membersData?.data?.data ?? membersData?.data ?? []).map((m: any) => m.user?.id ?? m.id));
            const invitable = friends.filter((f: any) => !memberIds.has(f.id));
            if (invitable.length === 0) {
              return <p className="text-sm text-[var(--muted-foreground)] text-center py-6">لا يوجد أصدقاء يمكن دعوتهم</p>;
            }
            return invitable.map((f: any) => (
              <div key={f.id} className="flex items-center justify-between gap-3 p-2 rounded-xl hover:bg-[var(--muted)]/50 transition-colors">
                <div className="flex items-center gap-3">
                  <Avatar src={f.avatar ?? f.profile?.avatarUrl} name={f.fullName || f.username} size="sm" />
                  <span className="text-sm font-medium text-[var(--foreground)]">{f.fullName || f.username}</span>
                </div>
                <button
                  onClick={async () => {
                    try {
                      await inviteMember.mutateAsync(f.id);
                      showToast('تمت الدعوة بنجاح', 'success');
                    } catch (err: any) {
                      showToast(err?.response?.data?.message || 'فشلت الدعوة', 'error');
                    }
                  }}
                  disabled={inviteMember.isPending}
                  className="rounded-xl px-3 py-1.5 text-xs font-bold text-white transition-all disabled:opacity-50"
                  style={{ background: 'var(--primary)' }}
                >
                  دعوة
                </button>
              </div>
            ));
          })()}
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
