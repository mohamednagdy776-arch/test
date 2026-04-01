interface StatCardProps { label: string; value: string | number; sub?: string; color?: 'blue' | 'green' | 'red' | 'yellow'; icon?: React.ReactNode; }

const colors: Record<string, { bg: string; text: string; value: string }> = {
  blue:   { bg: 'bg-[#D4E8EE]', text: 'text-[#547792]', value: 'text-[#213448]' },
  green:  { bg: 'bg-[#4A8C6F]/15', text: 'text-[#4A8C6F]', value: 'text-[#4A8C6F]' },
  red:    { bg: 'bg-[#B05252]/15', text: 'text-[#B05252]', value: 'text-[#B05252]' },
  yellow: { bg: 'bg-[#C9923A]/15', text: 'text-[#C9923A]', value: 'text-[#C9923A]' },
};

export const StatCard = ({ label, value, sub, color = 'blue', icon }: StatCardProps) => {
  const c = colors[color];
  return (
    <div className="relative overflow-hidden rounded-2xl bg-[#FDFAF5] border border-[#C8D8DF] p-6 shadow-card transition-all duration-300 hover:shadow-card-hover">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className={`text-xs font-semibold uppercase tracking-wider ${c.text}`}>{label}</p>
          <p className={`text-3xl font-bold tracking-tight ${c.value}`}>{value}</p>
          {sub && <p className={`text-xs ${c.text} opacity-70`}>{sub}</p>}
        </div>
        {icon && <div className={`rounded-xl ${c.bg} p-2.5 ${c.text}`}>{icon}</div>}
      </div>
    </div>
  );
};
