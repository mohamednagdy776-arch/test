'use client';

type Tab = 'pending' | 'accepted' | 'rejected';

interface Props {
  activeTab: Tab;
  onTabChange: (t: Tab) => void;
  counts?: Partial<Record<Tab, number>>;
}

const tabs: { key: Tab; label: string; emoji: string }[] = [
  { key: 'pending', label: 'في الانتظار', emoji: '⏳' },
  { key: 'accepted', label: 'مقبول', emoji: '✓' },
  { key: 'rejected', label: 'مرفوض', emoji: '✕' },
];

export const MatchingTabs = ({ activeTab, onTabChange, counts = {} }: Props) => {
  return (
    <div className="flex gap-1 rounded-xl p-1" style={{ background: 'var(--muted)' }}>
      {tabs.map((t) => {
        const count = counts[t.key] ?? 0;
        const isActive = activeTab === t.key;
        return (
          <button key={t.key} onClick={() => onTabChange(t.key)}
            className="flex-1 flex items-center justify-center gap-1.5 rounded-lg py-2.5 text-sm font-semibold transition-all active:scale-95"
            style={isActive
              ? { background: 'var(--card)', color: 'var(--foreground)', boxShadow: '0 1px 6px rgba(0,0,0,0.08)' }
              : { color: 'var(--muted-foreground)' }}>
            <span className="text-xs">{t.emoji}</span>
            <span>{t.label}</span>
            {count > 0 && (
              <span className="rounded-full min-w-[20px] h-5 px-1.5 flex items-center justify-center text-[10px] font-bold"
                style={isActive
                  ? { background: 'color-mix(in srgb, var(--accent) 18%, transparent)', color: 'var(--accent)' }
                  : { background: 'var(--border)', color: 'var(--muted-foreground)' }}>
                {count > 99 ? '99+' : count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
