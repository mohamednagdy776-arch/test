'use client';
import { useRef, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

interface Props {
  profile: any;
  onEdit: () => void;
}

export const ProfileHeader = ({ profile, onEdit }: Props) => {
  const qc = useQueryClient();
  const avatarRef = useRef<HTMLInputElement>(null);
  const coverRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const uploadAvatar = async (file: File) => {
    setUploading(true);
    try {
      const form = new FormData();
      form.append('file', file);
      await apiClient.post('/users/me/avatar', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      qc.invalidateQueries({ queryKey: ['my-profile'] });
    } catch {
      alert('فشل رفع الصورة');
    } finally {
      setUploading(false);
    }
  };

  const uploadCover = async (file: File) => {
    setUploading(true);
    try {
      const form = new FormData();
      form.append('file', file);
      await apiClient.post('/users/me/cover', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      qc.invalidateQueries({ queryKey: ['my-profile'] });
    } catch {
      alert('فشل رفع الصورة');
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
    <div className="rounded-xl bg-white shadow-sm overflow-hidden">
      {/* Cover Photo */}
      <div className="relative h-52 bg-gray-200">
        {profile.coverUrl ? (
          <img src={profile.coverUrl} alt="cover" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <span>أضف صورة غلاف</span>
          </div>
        )}
        <button
          onClick={() => coverRef.current?.click()}
          className="absolute bottom-4 left-4 px-4 py-2 bg-black/50 hover:bg-black/70 text-white rounded-lg text-sm flex items-center gap-2 transition-colors"
        >
          <span>📷</span>
          <span>تعديل غلاف</span>
        </button>
        <input
          ref={coverRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadCover(f); }}
        />
      </div>

      <div className="px-6 pb-6">
        <div className="flex items-start gap-5 -mt-12 relative">
          {/* Avatar */}
          <div className="relative shrink-0">
            <div
              className="h-28 w-28 rounded-full overflow-hidden bg-primary/20 flex items-center justify-center cursor-pointer ring-4 ring-white shadow-md"
              onClick={() => avatarRef.current?.click()}
            >
              {profile.avatarUrl ? (
                <img src={profile.avatarUrl} alt="avatar" className="h-full w-full object-cover" />
              ) : (
                <span className="text-4xl font-bold text-primary">
                  {profile.fullName?.charAt(0)?.toUpperCase() ?? '?'}
                </span>
              )}
            </div>
            <button
              onClick={() => avatarRef.current?.click()}
              className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-primary text-white text-xs flex items-center justify-center shadow hover:bg-blue-700"
            >
              {uploading ? '…' : '📷'}
            </button>
            <input
              ref={avatarRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadAvatar(f); }}
            />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0 pt-14">
            <h2 className="text-2xl font-bold text-gray-900">{profile.fullName}</h2>
            <p className="mt-1 text-sm text-gray-500">
              @{profile.username || profile.userId}
            </p>
            <p className="mt-1 text-sm text-gray-500">
              {[profile.location, profile.city, profile.country].filter(Boolean).join('، ')}
            </p>
            {profile.workplace && (
              <p className="mt-1 text-sm text-gray-500">💼 {profile.workplace}</p>
            )}
            {profile.relationshipStatus && (
              <p className="mt-1 text-sm text-gray-500">💕 {profile.relationshipStatus}</p>
            )}
            {profile.bio && (
              <p className="mt-2 text-sm text-gray-600 line-clamp-2">{profile.bio}</p>
            )}
            <p className="mt-2 text-xs text-gray-400">
              انضم في {formatDate(profile.joinDate || profile.createdAt)}
              {profile.mutualFriends !== undefined && profile.mutualFriends > 0 && (
                <span className="mr-2">• {profile.mutualFriends}صدقاء مشترك</span>
              )}
            </p>
          </div>

          {/* Edit button */}
          {profile.isSelf && (
            <button
              onClick={onEdit}
              className="shrink-0 mt-14 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              تعديل الملف
            </button>
          )}
        </div>

        {/* Completion bar */}
        <ProfileCompletion profile={profile} />
      </div>
    </div>
  );
};

const fields = ['fullName', 'age', 'gender', 'country', 'city', 'bio', 'education', 'jobTitle', 'sect', 'prayerLevel', 'relationshipStatus', 'location', 'workplace', 'website'];
const ProfileCompletion = ({ profile }: { profile: any }) => {
  const filled = fields.filter((f) => profile[f] != null && profile[f] !== '').length;
  const pct = Math.round((filled / fields.length) * 100);
  return (
    <div className="mt-4 border-t pt-4">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-gray-500">اكتمال الملف الشخصي</span>
        <span className="text-xs font-semibold text-primary">{pct}%</span>
      </div>
      <div className="h-2 rounded-full bg-gray-100">
        <div className="h-2 rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
};
