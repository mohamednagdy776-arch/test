'use client';

import { cn } from '@/lib/utils';
import { ButtonHTMLAttributes, forwardRef } from 'react';
import { ArrowsClockwise } from '@phosphor-icons/react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline' | 'accent';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, disabled, children, ...props }, ref) => {
    const variants: Record<string, string> = {
      primary:   'btn-theme-primary',
      secondary: 'btn-theme-secondary',
      danger:    'btn-theme-danger',
      ghost:     'btn-theme-ghost',
      outline:   'btn-theme-outline',
      accent:    'btn-theme-accent',
    };
    const sizes: Record<string, string> = {