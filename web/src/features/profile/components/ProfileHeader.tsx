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
  const fileRef = useRef<HTMLInputElement>(null);
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

  return (
    <div className="rounded-xl bg-white p-6 shadow-sm">
      <div className="flex items-start gap-5">
        {/* Avatar */}
        <div className="relative shrink-0">
          <div
            className="h-24 w-24 rounded-full overflow-hidden bg-primary/20 flex items-center justify-center cursor-pointer ring-4 ring-white shadow-md"
            onClick={() => fileRef.current?.click()}
          >
            {profile.avatarUrl ? (
              <img src={profile.avatarUrl} alt="avatar" className="h-full w-full object-cover" />
            ) : (
              <span className="text-3xl font-bold text-primary">
                {profile.fullName?.charAt(0)?.toUpperCase() ?? '?'}
              </span>
            )}
          </div>
          <button
            onClick={() => fileRef.current?.click()}
            className="absolute bottom-0 right-0 h-7 w-7 rounded-full bg-primary text-white text-xs flex items-center justify-center shadow hover:bg-blue-700"
          >
            {uploading ? '…' : '📷'}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadAvatar(f); }}
          />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold text-gray-900">{profile.fullName}</h2>
          <p className="mt-1 text-sm text-gray-500">
            {[profile.city, profile.country].filter(Boolean).join('، ')}
          </p>
          {profile.jobTitle && (
            <p className="mt-1 text-sm text-gray-500">💼 {profile.jobTitle}</p>
          )}
          {profile.bio && (
            <p className="mt-2 text-sm text-gray-600 line-clamp-2">{profile.bio}</p>
          )}
        </div>

        {/* Edit button */}
        <button
          onClick={onEdit}
          className="shrink-0 rounded-lg border border-primary px-4 py-2 text-sm font-medium text-primary hover:bg-primary hover:text-white transition-colors"
        >
          تعديل
        </button>
      </div>

      {/* Completion bar */}
      <ProfileCompletion profile={profile} />
    </div>
  );
};

const fields = ['fullName','age','gender','country','city','bio','education','jobTitle','sect','prayerLevel'];
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
