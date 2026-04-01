'use client';
import { cn } from '@/lib/utils';

interface BadgeProps {
  label: string;
  variant?: 'success' | 'danger' | 'warning' | 'default';
  className?: string;
}

const variants = {
  success: 'bg-green-100 text-green-800',
  danger: 'bg-red-100 text-red-800',
  warning: 'bg-yellow-100 text-yellow-800',
  default: 'bg-gray-100 text-gray-800',
};

export function Badge({ label, variant = 'default', className }: BadgeProps) {
  return (
    <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', variants[variant], className)}>
      {label}
    </span>
  );
}
