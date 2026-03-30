import { clsx } from 'clsx';

type BadgeVariant = 'success' | 'danger' | 'warning' | 'default';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
}

const variants: Record<BadgeVariant, string> = {
  success: 'bg-green-100 text-green-800',
  danger: 'bg-red-100 text-red-800',
  warning: 'bg-yellow-100 text-yellow-800',
  default: 'bg-gray-100 text-gray-800',
};

export const Badge = ({ label, variant = 'default' }: BadgeProps) => {
  return (
    <span className={clsx('inline-flex rounded-full px-2 py-0.5 text-xs font-medium', variants[variant])}>
      {label}
    </span>
  );
};
