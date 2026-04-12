'use client';
import { useRef, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Camera, PencilSimple, Briefcase, Heart } from '@phosphor-icons/react';

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
    <div className="rounded-2xl bg-[#FDFAF5] shadow-card-hover border border-[#C8D8DF]/60 overflow-hidden transition-all duration-300 hover:shadow-glow-lg">
      {/* Cover Photo with enhanced styling */}
      <div className="relative h-56 bg-gradient-to-br from-[#D4E8EE] via-[#94B4C1] to-[#547792] overflow-hidden group">
        {profile.coverUrl ? (
          <img src={profile.coverUrl} alt="cover" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-[#FDFAF5]/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-2">
                <Camera size={32} className="text-[#FDFAF5]/50" />
              </div>
              <p className="text-sm text-[#FDFAF5]/70 font-medium">أضف صورة غلاف</p>
            </div>
          </div>
        )}
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#131F2E]/30 to-transparent pointer-events-none" />
        <button
          onClick={() => coverRef.current?.click()}
          className="absolute bottom-4 left-4 px-4 py-2 bg-[#131F2E]/70 hover:bg-[#131F2E]/90 backdrop-blur-sm text-[#FDFAF5] rounded-xl text-sm flex items-center gap-2 transition-all duration-300 hover:shadow-glow-lg hover:scale-105"
        >
          <Camera size={18} />
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

      <div className="px-6 pb-6 relative">
        <div className="flex items-start gap-5 -mt-14 relative">
          {/* Avatar with enhanced styling */}
          <div className="relative shrink-0 group">
            <div
              className="h-28 w-28 rounded-full overflow-hidden bg-gradient-to-br from-[#D4E8EE] to-[#94B4C1] flex items-center justify-center cursor-pointer ring-4 ring-[#FDFAF5] shadow-glow-lg transition-all duration-300 hover:scale-105 hover:shadow-glow-primary"
              onClick={() => avatarRef.current?.click()}
            >
              {profile.avatarUrl ? (
                <img src={profile.avatarUrl} alt="avatar" className="h-full w-full object-cover" />
              ) : (
                <span className="text-4xl font-bold text-gradient">
                  {profile.fullName?.charAt(0)?.toUpperCase() ?? '?'}
                </span>
              )}
            </div>
            <button
              onClick={() => avatarRef.current?.click()}
              className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-gradient-to-r from-[#213448] to-[#547792] text-[#FDFAF5] text-xs flex items-center justify-center shadow-soft hover:shadow-glow hover:scale-110 transition-all duration-200"
            >
              {uploading ? '...' : <Camera size={14} />}
            </button>
            {/* Status indicator */}
            <div className="absolute bottom-1 right-1 h-4 w-4 rounded-full bg-[#4A8C6F] ring-2 ring-[#FDFAF5] shadow-[0_0_8px_rgba(74,140,111,0.5)]" />
            <input
              ref={avatarRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadAvatar(f); }}
            />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0 pt-16">
            <h2 className="text-2xl font-bold text-gradient">{profile.fullName}</h2>
            <p className="mt-1 text-sm text-[#547792] font-medium">
              @{profile.username || profile.userId}
            </p>
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
              {profile.mutualFriends !== undefined && profile.mutualFriends > 0 && (
                <span className="mr-2">• {profile.mutualFriends} أصدقاء مشترك</span>
              )}
            </p>
          </div>

          {/* Edit button */}
          {profile.isSelf && (
            <button
              onClick={onEdit}
              className="shrink-0 mt-16 rounded-xl border border-[#C8D8DF] px-4 py-2 text-sm font-medium text-[#213448] hover:bg-[#D4E8EE] hover:border-[#547792] hover:shadow-soft transition-all duration-300 hover:-translate-y-0.5"
            >
              <PencilSimple size={16} className="inline mr-1" />
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