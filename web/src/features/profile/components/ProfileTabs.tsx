'use client';

export type Tab = 'posts' | 'about' | 'friends' | 'photos' | 'videos' | 'activity';

interface Props {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

const tabs: { id: Tab; label: string; icon: string }[] = [
  { id: 'posts',    label: 'المنشورات',   icon: '📝' },
  { id: 'about',    label: 'حول',         icon: 'ℹ️'  },
  { id: 'friends',  label: 'الأصدقاء',    icon: '👥' },
  { id: 'photos',   label: 'الصور',       icon: '📷' },
  { id: 'videos',   label: 'الفيديوهات', icon: '🎬' },
  { id: 'activity', label: 'النشاط',      icon: '📊' },
];

export const ProfileTabs = ({ activeTab, onTabChange }: Props) => (
  <div className="rounded-xl bg-[var(--card)] shadow-sm border border-[var(--border)]/60 overflow-x-auto">
    <div className="flex whitespace-nowrap">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`flex-1 min-w-fit px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === tab.id
              ? 'border-[var(--accent)] text-[var(--foreground)]'
              : 'border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:border-[var(--ring)]'
          }`}
        >
          <span className="ml-1">{tab.icon}</span>
          {tab.label}
        </button>
      ))}
    </div>
  </div>
);
