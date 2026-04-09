'use client';

type Tab = 'posts' | 'about' | 'friends' | 'photos' | 'videos' | 'activity';

interface Props {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

const tabs: { id: Tab; label: string; icon: string }[] = [
  { id: 'posts', label: 'المنشورات', icon: '📝' },
  { id: 'about', label: 'حول', icon: 'ℹ️' },
  { id: 'friends', label: 'الأصدقاء', icon: '👥' },
  { id: 'photos', label: 'الصور', icon: '📷' },
  { id: 'videos', label: 'الفيديوهات', icon: '🎬' },
  { id: 'activity', label: 'النشاط', icon: '📊' },
];

export const ProfileTabs = ({ activeTab, onTabChange }: Props) => {
  return (
    <div className="rounded-xl bg-white shadow-sm overflow-x-auto">
      <div className="flex whitespace-nowrap">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex-1 min-w-fit px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <span className="ml-1">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
};
