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
      xs: 'h-7 px-2.5 text-[11px] rounded-lg gap-1',
      sm: 'h-8 px-3.5 text-xs rounded-xl gap-1.5',
      md: 'h-10 px-5 text-sm rounded-xl gap-2',
      lg: 'h-12 px-6 text-base rounded-xl gap-2.5',
    };
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center font-semibold transition-all duration-200 ease-out select-none',
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
          'active:scale-[0.97] transform-gpu',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]',
          'hover:-translate-y-px',
          variants[variant], sizes[size], className
        )}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <ArrowsClockwise size={14} className="animate-spin shrink-0" />
        )}
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';
