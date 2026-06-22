'use client';
import Image from 'next/image';
import { resolveMediaUrl } from '@/lib/media';
import { useRouter } from 'next/navigation';
import { MapPin, GraduationCap, Scales, Briefcase, Eye, ChatCircle } from '@phosphor-icons/react';


const lifestyleLabel: Record<string, string> = {
  conservative: 'محافظ', moderate: 'معتدل', open: 'منفتح',
};
const educationLabel: Record<string, string> = {
  high_school: 'ثانوية', diploma: 'دبلوم', bachelor: 'بكالوريوس',
  master: 'ماجستير', phd: 'دكتوراه',
};
const prayerLabel: Record<string, string> = {
  always: 'دائماً', mostly: 'في الغالب', sometimes: 'أحياناً', rarely: 'نادراً',
};

interface Props {
  user: any;
  onView: () => void;
}

export const UserCard = ({ user, onView }: Props) => {
  const router = useRouter();
  const avatarSrc = user.avatarUrl
    ? (resolveMediaUrl(user.avatarUrl))
    : null;
  const initial = (user.fullName || user.username || '?').charAt(0).toUpperCase();
  const isMale = user.gender === 'male';

  const tags = [
    user.education && { icon: GraduationCap, label: educationLabel[user.education] ?? user.education },
    user.lifestyle && { icon: Scales, label: lifestyleLabel[user.lifestyle] ?? user.lifestyle },
    user.prayerLevel && { icon: Scales, label: prayerLabel[user.prayerLevel] ?? user.prayerLevel },
    user.jobTitle && { icon: Briefcase, label: user.jobTitle },
  ].filter(Boolean) as { icon: any; label: string }[];

  return (
    <div className="rounded-2xl overflow-hidden transition-all duration-200 hover:-translate-y-0.5 group"
      style={{ background: 'var(--card)', border: '1px solid var(--border)', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
      {/* Score strip */}
      <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, var(--primary), var(--accent))' }} />

      <div className="p-5">
        {/* Avatar + gender badge */}
        <div className="flex items-start justify-between mb-4">
          <div className="relative">
            {avatarSrc ? (
              <Image src={avatarSrc} alt={user.fullName || ''} width={52} height={52}
                className="rounded-2xl object-cover" style={{ width: 52, height: 52 }} />
            ) : (
              <div className="w-[52px] h-[52px] rounded-2xl flex items-center justify-center text-lg font-bold text-white"
                style={{ background: 'linear-gradient(135deg, var(--primary), var(--accent))' }}>
                {initial}
              </div>
            )}
          </div>
          <span className="shrink-0 rounded-xl px-2.5 py-1 text-[11px] font-bold"
            style={isMale
              ? { background: 'color-mix(in srgb, #3b82f6 12%, var(--muted))', color: '#3b82f6' }
              : { background: 'color-mix(in srgb, #ec4899 12%, var(--muted))', color: '#ec4899' }}>
            {isMale ? 'ذكر' : 'أنثى'}
          </span>
        </div>

        {/* Name + meta */}
        <div className="mb-3">
          <h3 className="font-bold text-base truncate" style={{ color: 'var(--foreground)' }}>
            {user.fullName || user.username || 'مستخدم'}
          </h3>
          <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
            {user.age && (
              <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{user.age} سنة</span>
            )}
            {(user.city || user.country) && (
              <span className="flex items-center gap-0.5 text-xs" style={{ color: 'var(--muted-foreground)' }}>
                {user.age && <span>·</span>}
                <MapPin size={10} />
                {[user.city, user.country].filter(Boolean).join('، ')}
              </span>
            )}
          </div>
        </div>

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {tags.slice(0, 3).map((tag, i) => (
              <span key={i} className="flex items-center gap-1 rounded-lg px-2 py-0.5 text-[11px] font-medium"
                style={{ background: 'var(--muted)', color: 'var(--muted-foreground)' }}>
                <tag.icon size={10} />
                {tag.label}
              </span>
            ))}
          </div>
        )}

        {/* Bio */}
        {user.bio && (
          <p className="text-xs leading-relaxed line-clamp-2 mb-3" style={{ color: 'var(--muted-foreground)' }}>
            {user.bio}
          </p>
        )}

        {/* Actions */}
        <div className="flex gap-2 mt-auto pt-1">
          <button onClick={onView}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all hover:scale-[1.02] active:scale-95 text-white"
            style={{ background: 'linear-gradient(135deg, var(--primary), var(--secondary))', boxShadow: '0 2px 8px color-mix(in srgb, var(--primary) 25%, transparent)' }}>
            <Eye size={13} weight="fill" />
            عرض الملف
          </button>
          {user.username && (
            <button onClick={() => router.push(`/chat?username=${user.username}`)}
              aria-label="إرسال رسالة"
              className="flex items-center justify-center w-10 h-10 rounded-xl transition-all hover:scale-105 active:scale-95"
              style={{ background: 'linear-gradient(135deg, var(--accent), #c8952e)', color: 'white' }}>
              <ChatCircle size={15} weight="fill" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
