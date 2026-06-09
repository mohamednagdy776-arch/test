'use client';

import { cn } from '@/lib/utils';

interface BadgeProps {
  label: string;
  variant?: 'success' | 'danger' | 'warning' | 'info' | 'default' | 'gradient';
  size?: 'sm' | 'md';
  className?: string;
}

const variants: Record<string, string> = {
  success: 'badge-theme-success',
  danger:  'badge-theme-danger',
  warning: 'badge-theme-warning',
  info:    'badge-theme-info',
  default: 'badge-theme-default',
  gradient: 'badge-theme-gradient',
};
const sizes = { sm: 'px-2 py-0.5 text-[10px]', md: 'px-2.5 py-0.5 text-xs' };

export function Badge({ label, variant = 'default', size = 'md', className }: BadgeProps) {
  return <span className={cn('inline-flex items-center rounded-full font-medium transition-all duration-300 hover:-translate-y-0.5 hover:shadow-glow', variants[variant], sizes[size], className)}>{label}</span>;
}