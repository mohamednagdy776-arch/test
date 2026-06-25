'use client';
import { useRef, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Camera, PencilSimple, Briefcase, Heart, UserPlus, ChatCircle, Clock, CheckCircle, Users, Flag, HeartStraight, SealCheck } from '@phosphor-icons/react';
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

  const uploadBlob = async (blob: Blob, endpoint: string, filename: string) => {
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
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? 'فشل رفع الصورة';
      showToast(`${msg} — الصيغ المدعومة: JPG، PNG، GIF، WebP (الحد الأقصى 5 ميجابايت)`, 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleAvatarCrop = async (blob: Blob) => {
    setAvatarCropFile(null);
    await uploadBlob(blob, '/users/me/avatar', 'avatar.jpg');
  };

  const handleCoverCrop = async (blob: Blob) => {
    setCoverCropFile(null);
    await uploadBlob(blob, '/users/me/cover', 'cover.jpg');
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
    } catch (err: any) {
      showToast(err?.response?.data?.message ?? 'فشل إزالة الصورة', 'error');
    } finally {
      setUploading(false);
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
          // next/image enforces the next.config image allowlist, so a malicious
          // URL from the API can't render an arbitrary external resource (#167).
          <Image src={mediaUrl(profile.coverUrl)!} alt="cover" fill sizes="100vw" className="object-cover transition-transform duration-500 group-hover:scale-105" />
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
        <div className="flex items-start gap-5 -mt-14 relative">
          {/* Avatar with enhanced styling */}
          <div className="relative shrink-0 group">
            <div
              className={`relative h-28 w-28 rounded-full overflow-hidden bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] flex items-center justify-center ring-4 ring-[var(--card)] shadow-glow-lg transition-all duration-300 hover:scale-105 hover:shadow-glow-primary ${isSelf ? 'cursor-pointer' : ''}`}
              onClick={() => { if (isSelf) avatarRef.current?.click(); }}
            >
              {mediaUrl(profile.avatarUrl) ? (
                <Image src={mediaUrl(profile.avatarUrl)!} alt="avatar" fill sizes="112px" className="object-cover" />
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
          <div className="flex-1 min-w-0 pt-16">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-2xl font-bold text-gradient">{profile.fullName}</h2>
              {profile.isHealthVerified && (
                <span
                  className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold shadow-sm"
                  style={{ background: 'linear-gradient(135deg, #D1FAE5, #A7F3D0)', color: 'var(--foreground)' }}
                  title="تم التحقق من السلامة الصحية"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                  </svg>
                  مُحقَّق صحياً
                </span>
              )}
              {profile.isIdentityVerified && (
                <span
                  className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold shadow-sm"
                  style={{ background: 'linear-gradient(135deg, var(--accent), #D4A853)', color: '#0A3D2B' }}
                  title="تم التحقق من الهوية"
                >
                  <SealCheck size={14} weight="fill" />
                  موثّق الهوية
                </span>
              )}
            </div>
            {profile.username && (
              <p className="mt-1 text-sm text-[var(--muted-foreground)] font-medium">
                @{profile.username}
              </p>
            )}
            {profile.userId && <FollowSection userId={profile.userId} isSelf={isSelf} />}
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {[profile.location, profile.city, profile.country].filter(Boolean).join('، ')}
            </p>
            {profile.workplace && (
              <p className="mt-1 text-sm text-[var(--muted-foreground)] font-medium"><Briefcase size={14} className="inline mr-1" /> {profile.workplace}</p>
            )}
            {profile.relationshipStatus && (
              <p className="mt-1 text-sm text-[var(--muted-foreground)] font-medium"><Heart size={14} className="inline mr-1" weight="fill" /> {profile.relationshipStatus}</p>
            )}
            {profile.bio && (
              <p dir="auto" className="mt-2 text-sm text-[var(--foreground)]/80 line-clamp-2 leading-relaxed">{profile.bio}</p>
            )}
            <p className="mt-2 text-xs text-[var(--muted-foreground)]">
              انضم في {formatDate(profile.joinDate || profile.createdAt)}
              {!!profile.friendCount && (
                <span className="mr-2">• {profile.friendCount} صديق</span>
              )}
              {!!profile.mutualFriends && profile.mutualFriends > 0 && (
                <span className="mr-2">• {profile.mutualFriends} أصدقاء مشترك</span>
              )}
            </p>
          </div>

          {/* Self: edit button */}
          {isSelf && onEdit && (
            <button
              onClick={onEdit}
              className="shrink-0 mt-16 rounded-xl border border-[var(--border)] px-4 py-2 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--muted)] hover:border-[var(--ring)] hover:shadow-soft transition-all duration-300 hover:-translate-y-0.5"
            >
              <PencilSimple size={16} className="inline mr-1" />
              تعديل الملف
            </button>
          )}

          {/* Viewer: friend action + message */}
          {!isSelf && (
            <div className="shrink-0 mt-16 flex gap-2 flex-wrap">

              {/* No relationship → Add Friend */}
              {(!friendshipStatus || friendshipStatus.status === 'none') && (
                <button
                  onClick={onAddFriend}
                  disabled={friendActionPending}
                  className="rounded-xl bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] px-4 py-2 text-sm font-medium text-[var(--card)] hover:shadow-glow hover:scale-105 transition-all duration-300 flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <UserPlus size={16} />
                  {friendActionPending ? '...' : 'إضافة صديق'}
                </button>
              )}

              {/* Pending — I sent the request → Cancel */}
              {friendshipStatus?.status === 'pending' && friendshipStatus?.isRequester && (
                <button
                  onClick={onCancelRequest}
                  disabled={friendActionPending}
                  className="rounded-xl border border-[var(--border)] px-4 py-2 text-sm font-medium text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:border-[var(--ring)] transition-all duration-300 flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Clock size={16} />
                  {friendActionPending ? '...' : 'تم الإرسال'}
                </button>
              )}

              {/* Pending — they sent the request → Accept */}
              {friendshipStatus?.status === 'pending' && !friendshipStatus?.isRequester && (
                <button
                  onClick={onAcceptRequest}
                  disabled={friendActionPending}
                  className="rounded-xl bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] px-4 py-2 text-sm font-medium text-[var(--card)] hover:shadow-glow transition-all duration-300 flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <CheckCircle size={16} />
                  {friendActionPending ? '...' : 'قبول الطلب'}
                </button>
              )}

              {/* Already friends → Unfriend */}
              {friendshipStatus?.status === 'accepted' && (
                <button
                  onClick={onUnfriend}
                  disabled={friendActionPending}
                  className="rounded-xl border border-[var(--border)] px-4 py-2 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--destructive)]/10 hover:border-[var(--destructive)]/30 hover:text-[var(--destructive)] transition-all duration-300 flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Users size={16} />
                  {friendActionPending ? '...' : 'أصدقاء'}
                </button>
              )}

              {/* Send Salam — directed marriage-intent interest (#754) */}
              {onSendInterest && (
                <button
                  onClick={onSendInterest}
                  disabled={sendInterestPending}
                  className="rounded-xl px-4 py-2 text-sm font-bold flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 active:scale-95"
                  style={{ background: 'linear-gradient(135deg, var(--accent) 0%, #D4A853 100%)', color: '#0A3D2B' }}
                >
                  <HeartStraight size={16} weight="fill" />
                  {sendInterestPending ? '...' : 'أرسل السلام'}
                </button>
              )}

              {/* Message — always visible */}
              <button
                onClick={() => router.push(`/chat?user=${profile.userId}`)}
                className="rounded-xl border border-[var(--border)] px-4 py-2 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--muted)] hover:border-[var(--ring)] transition-all duration-300 flex items-center gap-1.5"
              >
                <ChatCircle size={16} />
                رسالة
              </button>

              {/* Block user */}
              {onBlock && friendshipStatus?.status !== 'blocked' && (
                <button
                  onClick={onBlock}
                  className="rounded-xl border border-[var(--destructive)]/30 px-4 py-2 text-sm font-medium text-[var(--destructive)] hover:bg-[var(--destructive)]/10 transition-all duration-300"
                >
                  حظر
                </button>
              )}

              {/* Report user (#751) */}
              {onReport && (
                <button
                  onClick={onReport}
                  aria-label="إبلاغ عن المستخدم"
                  className="rounded-xl border border-[var(--border)] px-4 py-2 text-sm font-medium text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--destructive)] transition-all duration-300 flex items-center gap-1.5"
                >
                  <Flag size={16} />
                  إبلاغ
                </button>
              )}
            </div>
          )}
        </div>

        {/* Completion bar — only on your own profile (private metric) */}
        {isSelf && <ProfileCompletion profile={profile} />}
      </div>

      {avatarCropFile && (
        <ImageCropper
          file={avatarCropFile}
          aspectRatio={1}
          circular={true}
          onCrop={handleAvatarCrop}
          onCancel={() => setAvatarCropFile(null)}
        />
      )}

      {coverCropFile && (
        <ImageCropper
          file={coverCropFile}
          aspectRatio={16 / 5}
          circular={false}
          onCrop={handleCoverCrop}
          onCancel={() => setCoverCropFile(null)}
        />
      )}

      <Modal open={!!removeImageKind} onClose={() => setRemoveImageKind(null)} title="إزالة الصورة">
        <div className="space-y-4">
          <p className="text-sm text-[var(--primary)]">
            {removeImageKind === 'avatar' ? 'هل أنت متأكد من إزالة صورة الملف الشخصي؟' : 'هل أنت متأكد من إزالة صورة الغلاف؟'}
          </p>
          <div className="flex gap-3">
            <button onClick={() => setRemoveImageKind(null)} className="flex-1 rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm font-semibold text-[var(--primary)] hover:bg-[var(--muted)] transition-colors">إلغاء</button>
            <button onClick={removeImage} disabled={uploading} className="flex-1 rounded-xl bg-[var(--destructive)] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[var(--destructive)]/90 disabled:opacity-50 transition-colors">إزالة</button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

// Includes the core matchmaking fields (religion + preferences) so 100% means
// the profile is actually ready for matching — not just bio/website filled.
const fields = ['fullName', 'age', 'gender', 'country', 'city', 'bio', 'education', 'jobTitle', 'financialLevel', 'sect', 'prayerLevel', 'religiousCommitment', 'minAge', 'maxAge', 'relocateWilling', 'wantsChildren'];
const ProfileCompletion = ({ profile }: { profile: any }) => {
  const filled = fields.filter((f) => profile[f] != null && profile[f] !== '').length;
  const pct = Math.round((filled / fields.length) * 100);
  return (
    <div className="mt-6 border-t border-[var(--border)]/40 pt-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-[var(--muted-foreground)] font-medium">اكتمال الملف الشخصي</span>
        <span className="text-xs font-bold text-gradient">{pct}%</span>
      </div>
      <div className="h-2 rounded-full bg-[var(--muted)] overflow-hidden">
        <div 
          className="h-2 rounded-full bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] transition-all duration-500 shadow-soft" 
          style={{ width: `${pct}%` }} 
        />
      </div>
    </div>
  );
};