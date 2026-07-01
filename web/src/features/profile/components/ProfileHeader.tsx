'use client';
import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { relationshipStatusLabel } from '../labels';
import { Camera, PencilSimple, Briefcase, Heart, UserPlus, ChatCircle, Clock, CheckCircle, Users, Flag, HeartStraight, SealCheck, LinkSimple } from '@phosphor-icons/react';
import { FollowSection } from '@/features/follows/components/FollowSection';
import { ImageCropper } from '@/components/ui/ImageCropper';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { resolveMediaUrl } from '@/lib/media';

interface FriendshipStatus {
  status: 'none' | 'pending' | 'accepted' | 'declined' | 'blocked';
  id?: string;
  isRequester?: boolean;
}

const mediaUrl = (url: string | null | undefined) => {
  if (!url) return null;
  // Only allow http(s) absolute URLs or backend-relative paths — reject
  // data:, javascript:, blob:, etc. that could be injected via the API.
  // resolveMediaUrl re-anchors dev/localhost URLs onto the deployed origin.
  if (/^https?:\/\//i.test(url) || url.startsWith('/')) return resolveMediaUrl(url);
  return null;
};

interface Props {
  profile: any;
  onEdit?: () => void;
  isSelf?: boolean;
  friendshipStatus?: FriendshipStatus;
  onAddFriend?: () => void;
  onCancelRequest?: () => void;
  onAcceptRequest?: () => void;
  onUnfriend?: () => void;
  onBlock?: () => void;
  onReport?: () => void;
  onSendInterest?: () => void;
  sendInterestPending?: boolean;
  friendActionPending?: boolean;
}

export const ProfileHeader = ({
  profile, onEdit, isSelf = false,
  friendshipStatus, onAddFriend, onCancelRequest, onAcceptRequest, onUnfriend, onBlock, onReport,
  onSendInterest, sendInterestPending = false,
  friendActionPending = false,
}: Props) => {
  const router = useRouter();
  const qc = useQueryClient();
  const { showToast } = useToast();
  const avatarRef = useRef<HTMLInputElement>(null);
  const coverRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [avatarCropFile, setAvatarCropFile] = useState<File | null>(null);
  const [coverCropFile, setCoverCropFile] = useState<File | null>(null);
  const [removeImageKind, setRemoveImageKind] = useState<'avatar' | 'cover' | null>(null);

  const uploadBlob = async (blob: Blob, endpoint: string, filename: string, successMsg: string) => {
    if (uploading) return;
    setUploading(true);
    try {
      const form = new FormData();
      form.append('file', blob, filename);
      const res = await apiClient.post(endpoint, form);
      const updatedProfile = res.data?.data;
      if (updatedProfile) {
        // Write the server response directly into the cache so the UI updates
        // instantly without a second network request.
        qc.setQueryData(['my-profile'], (old: any) => ({
          ...(old ?? {}),
          data: updatedProfile,
        }));
      }
      // Mark stale with refetchType:'none' so the NEXT mount/focus re-fetches
      // from the server, but avoids firing a background GET /users/me right now
      // that could race with and overwrite the setQueryData above.
      qc.invalidateQueries({ queryKey: ['my-profile'], refetchType: 'none' });
      showToast(successMsg, 'success');
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? 'فشل رفع الصورة';
      showToast(`${msg} — الصيغ المدعومة: JPG، PNG، GIF، WebP (الحد الأقصى 5 ميجابايت)`, 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleAvatarCrop = async (blob: Blob) => {
    setAvatarCropFile(null);
    await uploadBlob(blob, '/users/me/avatar', 'avatar.jpg', 'تم تحديث صورة الملف الشخصي');
  };

  const handleCoverCrop = async (blob: Blob) => {
    setCoverCropFile(null);
    await uploadBlob(blob, '/users/me/cover', 'cover.jpg', 'تم تحديث صورة الغلاف');
  };

  const removeImage = async () => {
    if (!removeImageKind) return;
    const kind = removeImageKind;
    setRemoveImageKind(null);
    setUploading(true);
    try {
      const res = await apiClient.delete(`/users/me/${kind}`);
      const updatedProfile = res.data?.data;
      if (updatedProfile) {
        qc.setQueryData(['my-profile'], (old: any) => ({
          ...(old ?? {}),
          data: updatedProfile,
        }));
      }
      qc.invalidateQueries({ queryKey: ['my-profile'], refetchType: 'none' });
      showToast(kind === 'avatar' ? 'تم إزالة صورة الملف الشخصي' : 'تم إزالة صورة الغلاف', 'success');
    } catch (err: any) {
      showToast(err?.response?.data?.message ?? 'فشل إزالة الصورة', 'error');
    } finally {
      setUploading(false);
    }
  };

  // Each profile has a unique shareable URL (#8). The canonical route is
  // /{username} (the same route posts/chat link to — #13); fall back to the
  // id route for users who never set a username.
  const copyProfileLink = async () => {
    if (typeof window === 'undefined') return;
    const path = profile.username
      ? `/${profile.username}`
      : profile.userId
        ? `/profile/${profile.userId}`
        : null;
    if (!path) return;
    try {
      await navigator.clipboard.writeText(`${window.location.origin}${path}`);
      showToast('تم نسخ رابط الملف الشخصي', 'success');
    } catch {
      showToast('تعذّر نسخ الرابط', 'error');
    }
  };

  const formatDate = (date: string | Date) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <div className="rounded-2xl bg-[var(--card)] shadow-card-hover border border-[var(--border)]/60 overflow-hidden transition-all duration-300 hover:shadow-glow-lg">
      {/* Cover Photo with enhanced styling */}
      <div className="relative h-56 bg-gradient-to-br from-[var(--primary)] via-[var(--secondary)] to-[var(--muted)] overflow-hidden group">
        {mediaUrl(profile.coverUrl) ? (
          // Plain <img>, not next/image: next/image mis-cached freshly-uploaded
          // signed-token media and rendered a stale/blank green-pad cover.
          // mediaUrl() already rejects non-http(s)/relative URLs (#167).
          <img src={mediaUrl(profile.coverUrl)!} alt="cover" className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
        ) : (
          <div
            className={`w-full h-full flex items-center justify-center ${isSelf ? 'cursor-pointer' : ''}`}
            onClick={() => { if (isSelf) coverRef.current?.click(); }}
          >
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-[var(--card)]/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-2">
                <Camera size={32} className="text-[var(--card)]/50" />
              </div>
              <p className="text-sm text-[var(--card)]/70 font-medium">{isSelf ? 'أضف صورة غلاف' : 'لا توجد صورة غلاف'}</p>
            </div>
          </div>
        )}
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--foreground)]/30 to-transparent pointer-events-none" />
        {isSelf && (
          <>
            {/* Compact icon controls tucked in the top corner so they don't sit
                over (and hide) the cover image itself. */}
            <div className="absolute top-3 left-3 z-10 flex items-center gap-2">
              <button
                onClick={() => coverRef.current?.click()}
                disabled={uploading}
                aria-label="تعديل صورة الغلاف"
                title="يُفضّل صورة غلاف بنسبة 3:1 (مثال 1500×500 بكسل) — حتى 5 ميجابايت" /* #401 */
                className="h-9 w-9 flex items-center justify-center bg-[var(--foreground)]/45 hover:bg-[var(--foreground)]/70 backdrop-blur-sm text-[var(--card)] rounded-full transition-all duration-300 hover:scale-105 disabled:opacity-70"
              >
                {uploading ? <span className="text-xs">...</span> : <Camera size={18} />}
              </button>
              {mediaUrl(profile.coverUrl) && (
                <button
                  onClick={() => setRemoveImageKind('cover')}
                  disabled={uploading}
                  aria-label="إزالة صورة الغلاف"
                  title="إزالة صورة الغلاف"
                  className="h-9 w-9 flex items-center justify-center bg-[var(--foreground)]/45 hover:bg-[var(--destructive)]/80 backdrop-blur-sm text-[var(--card)] rounded-full transition-all duration-300 hover:scale-105 disabled:opacity-70"
                >
                  ✕
                </button>
              )}
            </div>
            <input
              ref={coverRef}
              type="file"
              accept=".jpg,.jpeg,.png,.gif,.webp,image/jpeg,image/png,image/gif,image/webp"
              className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) { e.target.value = ''; setCoverCropFile(f); } }}
            />
          </>
        )}
      </div>

      <div className="px-6 pb-6 relative">
        <div className="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-5 -mt-14 relative">
          {/* Avatar with enhanced styling */}
          <div className="relative shrink-0 group">
            <div
              className={`relative h-28 w-28 rounded-full overflow-hidden bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] flex items-center justify-center ring-4 ring-[var(--card)] shadow-glow-lg transition-all duration-300 hover:scale-105 hover:shadow-glow-primary ${isSelf ? 'cursor-pointer' : ''}`}
              onClick={() => { if (isSelf) avatarRef.current?.click(); }}
            >
              {mediaUrl(profile.avatarUrl) ? (
                <img src={mediaUrl(profile.avatarUrl)!} alt="avatar" className="absolute inset-0 w-full h-full object-cover" />
              ) : (
                <span className="text-4xl font-bold text-gradient">
                  {profile.fullName?.charAt(0)?.toUpperCase() ?? '?'}
                </span>
              )}
            </div>
            {isSelf && (
              <>
                <button
                  onClick={() => avatarRef.current?.click()}
                  title="يُفضّل صورة مربعة (مثال 400×400 بكسل) — حتى 5 ميجابايت" /* #406 */
                  className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] text-[var(--card)] text-xs flex items-center justify-center shadow-soft hover:shadow-glow hover:scale-110 transition-all duration-200"
                >
                  {uploading ? '...' : <Camera size={14} />}
                </button>
                <input
                  ref={avatarRef}
                  type="file"
                  accept=".jpg,.jpeg,.png,.gif,.webp,image/jpeg,image/png,image/gif,image/webp"
                  className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) { e.target.value = ''; setAvatarCropFile(f); } }}
                />
                {mediaUrl(profile.avatarUrl) && (
                  <button
                    onClick={() => setRemoveImageKind('avatar')}
                    disabled={uploading}
                    title="إزالة الصورة"
                    className="absolute top-0 right-0 h-7 w-7 rounded-full bg-[var(--primary)]/70 hover:bg-[var(--destructive)]/90/80 text-[var(--card)] text-xs flex items-center justify-center shadow-soft transition-all duration-200 disabled:opacity-70"
                  >
                    ✕
                  </button>
                )}
              </>
            )}
          </div>

          {/* Info */}