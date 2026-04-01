'use client';
import { cn } from '@/lib/utils';

interface BadgeProps {
  label: string;
  variant?: 'success' | 'danger' | 'warning' | 'info' | 'default';
  size?: 'sm' | 'md';
  className?: string;
}

const variants: Record<string, string> = {
  success: 'bg-[#4A8C6F]/15 text-[#4A8C6F]',
  danger:  'bg-[#B05252]/15 text-[#B05252]',
  warning: 'bg-[#C9923A]/15 text-[#C9923A]',
  info:    'bg-[#D4E8EE] text-[#547792]',
  default: 'bg-[#EAE0CF] text-[#213448]',
};
const sizes = { sm: 'px-2 py-0.5 text-[10px]', md: 'px-2.5 py-0.5 text-xs' };

export function Badge({ label, variant = 'default', size = 'md', className }: BadgeProps) {
  return <span className={cn('inline-flex items-center rounded-full font-medium transition-colors', variants[variant], sizes[size], className)}>{label}</span>;
}
