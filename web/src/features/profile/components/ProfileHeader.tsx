'use client';
import { useRef, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Camera, PencilSimple, Briefcase, Heart, UserPlus, ChatCircle, Clock, CheckCircle, Users } from '@phosphor-icons/react';

interface FriendshipStatus {
  status: 'none' | 'pending' | 'accepted' | 'declined' | 'blocked';
  id?: string;
  isRequester?: boolean;
}

const BACKEND_ORIGIN = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api/v1').replace('/api/v1', '');

const mediaUrl = (url: string | null | undefined) => {
  if (!url) return null;
  // Only allow http(s) absolute URLs or backend-relative paths — reject
  // data:, javascript:, blob:, etc. that could be injected via the API.
  if (/^https?:\/\//i.test(url)) return url;
  if (url.startsWith('/')) return `${BACKEND_ORIGIN}${url}`;
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
  friendActionPending?: boolean;
}

export const ProfileHeader = ({
  profile, onEdit, isSelf = false,
  friendshipStatus, onAddFriend, onCancelRequest, onAcceptRequest, onUnfriend,
  friendActionPending = false,
}: Props) => {
  const router = useRouter();
  const qc = useQueryClient();
  const avatarRef = useRef<HTMLInputElement>(null);
  const coverRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  // NOTE: do not set Content-Type manually — axios must add the multipart
  // boundary itself, otherwise the server cannot parse the uploaded file.
  const uploadAvatar = async (file: File) => {
    setUploading(true);
    try {
      const form = new FormData();
      form.append('file', file);
      await apiClient.post('/users/me/avatar', form);
      qc.invalidateQueries({ queryKey: ['my-profile'] });
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? 'فشل رفع الصورة';
      alert(`${msg}\n\nالصيغ المدعومة: JPG، PNG، GIF، WebP (الحد الأقصى 5 ميجابايت)`);
    } finally {
      setUploading(false);
    }
  };

  const uploadCover = async (file: File) => {
    setUploading(true);
    try {
      const form = new FormData();
      form.append('file', file);
      await apiClient.post('/users/me/cover', form);
      qc.invalidateQueries({ queryKey: ['my-profile'] });
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? 'فشل رفع الصورة';
      alert(`${msg}\n\nالصيغ المدعومة: JPG، PNG، GIF، WebP (الحد الأقصى 5 ميجابايت)`);
    } finally {
      setUploading(false);
    }
  };

  // Remove avatar/cover with a confirm prompt (destructive, #399).
  const removeImage = async (kind: 'avatar' | 'cover') => {
    const msg = kind === 'avatar' ? 'إزالة صورة الملف الشخصي؟' : 'إزالة صورة الغلاف؟';
    if (!window.confirm(msg)) return;
    setUploading(true);
    try {
      await apiClient.delete(`/users/me/${kind}`);
      qc.invalidateQueries({ queryKey: ['my-profile'] });
    } catch (err: any) {
      alert(err?.response?.data?.message ?? 'فشل إزالة الصورة');
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
    <div className="rounded-2xl bg-[#FDFAF5] shadow-card-hover border border-[#C8D8DF]/60 overflow-hidden transition-all duration-300 hover:shadow-glow-lg">
      {/* Cover Photo with enhanced styling */}
      <div className="relative h-56 bg-gradient-to-br from-[#D4E8EE] via-[#94B4C1] to-[#547792] overflow-hidden group">
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
              <div className="w-16 h-16 rounded-2xl bg-[#FDFAF5]/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-2">
                <Camera size={32} className="text-[#FDFAF5]/50" />
              </div>
              <p className="text-sm text-[#FDFAF5]/70 font-medium">{isSelf ? 'أضف صورة غلاف' : 'لا توجد صورة غلاف'}</p>
            </div>
          </div>
        )}
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#131F2E]/30 to-transparent pointer-events-none" />
        {isSelf && (
          <>
            <button
              onClick={() => coverRef.current?.click()}
              disabled={uploading}
              className="absolute bottom-4 left-4 px-4 py-2 bg-[#131F2E]/70 hover:bg-[#131F2E]/90 backdrop-blur-sm text-[#FDFAF5] rounded-xl text-sm flex items-center gap-2 transition-all duration-300 hover:shadow-glow-lg hover:scale-105 disabled:opacity-70"
            >
              <Camera size={18} />
              <span>{uploading ? 'جاري الرفع...' : 'تعديل غلاف'}</span>
            </button>
            {mediaUrl(profile.coverUrl) && (
              <button
                onClick={() => removeImage('cover')}
                disabled={uploading}
                className="absolute bottom-4 left-36 px-3 py-2 bg-[#131F2E]/60 hover:bg-red-600/80 backdrop-blur-sm text-[#FDFAF5] rounded-xl text-sm transition-all duration-300 disabled:opacity-70"
              >
                إزالة
              </button>
            )}
            <input
              ref={coverRef}
              type="file"
              accept=".jpg,.jpeg,.png,.gif,.webp,image/jpeg,image/png,image/gif,image/webp"
              className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadCover(f); }}
            />
          </>
        )}
      </div>

      <div className="px-6 pb-6 relative">
        <div className="flex items-start gap-5 -mt-14 relative">
          {/* Avatar with enhanced styling */}
          <div className="relative shrink-0 group">
            <div
              className={`relative h-28 w-28 rounded-full overflow-hidden bg-gradient-to-br from-[#D4E8EE] to-[#94B4C1] flex items-center justify-center ring-4 ring-[#FDFAF5] shadow-glow-lg transition-all duration-300 hover:scale-105 hover:shadow-glow-primary ${isSelf ? 'cursor-pointer' : ''}`}
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
                  className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-gradient-to-r from-[#213448] to-[#547792] text-[#FDFAF5] text-xs flex items-center justify-center shadow-soft hover:shadow-glow hover:scale-110 transition-all duration-200"
                >
                  {uploading ? '...' : <Camera size={14} />}
                </button>
                <input
                  ref={avatarRef}
                  type="file"
                  accept=".jpg,.jpeg,.png,.gif,.webp,image/jpeg,image/png,image/gif,image/webp"
                  className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadAvatar(f); }}
                />
                {mediaUrl(profile.avatarUrl) && (
                  <button
                    onClick={() => removeImage('avatar')}
                    disabled={uploading}
                    title="إزالة الصورة"
                    className="absolute top-0 right-0 h-7 w-7 rounded-full bg-[#131F2E]/70 hover:bg-red-600/80 text-[#FDFAF5] text-xs flex items-center justify-center shadow-soft transition-all duration-200 disabled:opacity-70"
                  >
                    ✕
                  </button>
                )}
              </>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0 pt-16">
            <h2 className="text-2xl font-bold text-gradient">{profile.fullName}</h2>
            {profile.username && (
              <p className="mt-1 text-sm text-[#547792] font-medium">
                @{profile.username}
              </p>
            )}
            <p className="mt-1 text-sm text-[#547792]">
              {[profile.location, profile.city, profile.country].filter(Boolean).join('، ')}
            </p>
            {profile.workplace && (
              <p className="mt-1 text-sm text-[#547792] font-medium"><Briefcase size={14} className="inline mr-1" /> {profile.workplace}</p>
            )}
            {profile.relationshipStatus && (
              <p className="mt-1 text-sm text-[#547792] font-medium"><Heart size={14} className="inline mr-1" weight="fill" /> {profile.relationshipStatus}</p>
            )}
            {profile.bio && (
              <p className="mt-2 text-sm text-[#131F2E]/80 line-clamp-2 leading-relaxed">{profile.bio}</p>
            )}
            <p className="mt-2 text-xs text-[#BFB9AD]">
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
              className="shrink-0 mt-16 rounded-xl border border-[#C8D8DF] px-4 py-2 text-sm font-medium text-[#213448] hover:bg-[#D4E8EE] hover:border-[#547792] hover:shadow-soft transition-all duration-300 hover:-translate-y-0.5"
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
                  className="rounded-xl bg-gradient-to-r from-[#213448] to-[#547792] px-4 py-2 text-sm font-medium text-[#FDFAF5] hover:shadow-glow hover:scale-105 transition-all duration-300 flex items-center gap-1.5 disabled:opacity-60 disabled:cursor-not-allowed"
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
                  className="rounded-xl border border-[#C8D8DF] px-4 py-2 text-sm font-medium text-[#547792] hover:bg-[#EAE0CF] hover:border-[#547792] transition-all duration-300 flex items-center gap-1.5 disabled:opacity-60 disabled:cursor-not-allowed"
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
                  className="rounded-xl bg-gradient-to-r from-[#213448] to-[#547792] px-4 py-2 text-sm font-medium text-[#FDFAF5] hover:shadow-glow transition-all duration-300 flex items-center gap-1.5 disabled:opacity-60 disabled:cursor-not-allowed"
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
                  className="rounded-xl border border-[#C8D8DF] px-4 py-2 text-sm font-medium text-[#213448] hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-all duration-300 flex items-center gap-1.5 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <Users size={16} />
                  {friendActionPending ? '...' : 'أصدقاء'}
                </button>
              )}

              {/* Message — always visible */}
              <button
                onClick={() => router.push(`/chat?user=${profile.userId}`)}
                className="rounded-xl border border-[#C8D8DF] px-4 py-2 text-sm font-medium text-[#213448] hover:bg-[#D4E8EE] hover:border-[#547792] transition-all duration-300 flex items-center gap-1.5"
              >
                <ChatCircle size={16} />
                رسالة
              </button>
            </div>
          )}
        </div>

        {/* Completion bar — only on your own profile (private metric) */}
        {isSelf && <ProfileCompletion profile={profile} />}
      </div>
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
    <div className="mt-6 border-t border-[#C8D8DF]/40 pt-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-[#547792] font-medium">اكتمال الملف الشخصي</span>
        <span className="text-xs font-bold text-gradient">{pct}%</span>
      </div>
      <div className="h-2 rounded-full bg-[#EAE0CF] overflow-hidden">
        <div 
          className="h-2 rounded-full bg-gradient-to-r from-[#213448] to-[#547792] transition-all duration-500 shadow-soft" 
          style={{ width: `${pct}%` }} 
        />
      </div>
    </div>
  );
};