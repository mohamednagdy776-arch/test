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
  <div className="rounded-xl bg-[#FDFAF5] shadow-sm border border-[#C8D8DF]/60 overflow-x-auto">
    <div className="flex whitespace-nowrap">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`flex-1 min-w-fit px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === tab.id
              ? 'border-[#213448] text-[#213448]'
              : 'border-transparent text-[#547792] hover:text-[#213448] hover:border-[#94B4C1]'
          }`}
        >
          <span className="ml-1">{tab.icon}</span>
          {tab.label}
        </button>
      ))}
    </div>
  </div>
);
