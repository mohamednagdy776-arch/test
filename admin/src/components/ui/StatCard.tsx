interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  color?: 'blue' | 'green' | 'red' | 'yellow';
}

const colors = {
  blue: 'bg-blue-50 text-blue-700',
  green: 'bg-green-50 text-green-700',
  red: 'bg-red-50 text-red-700',
  yellow: 'bg-yellow-50 text-yellow-700',
};

export const StatCard = ({ label, value, sub, color = 'blue' }: StatCardProps) => (
  <div className={`rounded-lg p-5 ${colors[color]}`}>
    <p className="text-xs font-semibold uppercase tracking-wide opacity-70">{label}</p>
    <p className="mt-1 text-3xl font-bold">{value}</p>
    {sub && <p className="mt-1 text-xs opacity-60">{sub}</p>}
  </div>
);
