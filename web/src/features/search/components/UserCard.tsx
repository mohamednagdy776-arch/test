'use client';

interface Props {
  user: any;
  onView: () => void;
}

const lifestyleLabel: Record<string, string> = {
  conservative: 'محافظ', moderate: 'معتدل', open: 'منفتح',
};
const educationLabel: Record<string, string> = {
  high_school: 'ثانوية', diploma: 'دبلوم', bachelor: 'بكالوريوس', master: 'ماجستير', phd: 'دكتوراه',
};
const prayerLabel: Record<string, string> = {
  always: 'دائماً', mostly: 'في الغالب', sometimes: 'أحياناً', rarely: 'نادراً',
};

export const UserCard = ({ user, onView }: Props) => (
  <div className="rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow overflow-hidden">
    {/* Top color strip */}
    <div className="h-1.5 bg-gradient-to-r from-primary to-blue-400" />

    <div className="p-5">
      {/* Avatar + name */}
      <div className="flex items-center gap-3 mb-4">
        <div className="h-12 w-12 rounded-full bg-primary/15 flex items-center justify-center text-primary font-bold text-lg shrink-0 overflow-hidden">
          {user.avatarUrl
            ? <img src={user.avatarUrl} alt="" className="h-full w-full object-cover" />
            : user.fullName?.charAt(0)?.toUpperCase() ?? '?'
          }
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 truncate">{user.fullName}</h3>
          <p className="text-xs text-gray-400 truncate">
            {[user.age ? `${user.age} سنة` : null, user.city, user.country].filter(Boolean).join(' · ')}
          </p>
        </div>
        <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
          user.gender === 'male' ? 'bg-blue-50 text-blue-600' : 'bg-pink-50 text-pink-600'
        }`}>
          {user.gender === 'male' ? 'ذكر' : 'أنثى'}
        </span>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {user.education && (
          <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs text-gray-600">
            🎓 {educationLabel[user.education] ?? user.education}
          </span>
        )}
        {user.lifestyle && (
          <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs text-gray-600">
            🌿 {lifestyleLabel[user.lifestyle] ?? user.lifestyle}
          </span>
        )}
        {user.prayerLevel && (
          <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs text-gray-600">
            🕌 {prayerLabel[user.prayerLevel] ?? user.prayerLevel}
          </span>
        )}
        {user.jobTitle && (
          <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs text-gray-600 truncate max-w-full">
            💼 {user.jobTitle}
          </span>
        )}
      </div>

      {/* Bio preview */}
      {user.bio && (
        <p className="text-xs text-gray-500 line-clamp-2 mb-4 leading-relaxed">{user.bio}</p>
      )}

      <button
        onClick={onView}
        className="w-full rounded-lg bg-primary py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
      >
        عرض الملف ونقاط التوافق
      </button>
    </div>
  </div>
);
