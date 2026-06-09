'use client';

import { cn } from '@/lib/utils';
import { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, id, ...props }, ref) => (
    <div className="w-full space-y-1.5">
      {label && <label htmlFor={id} className="block text-sm font-semibold text-theme-primary">{label}</label>}
      <input ref={ref} id={id} className={cn(
        'flex h-11 w-full rounded-xl border px-4 py-2.5 text-sm font-medium transition-all duration-300',
        'theme-bg theme-border theme-fg',
        'placeholder:text-[var(--muted-foreground)] placeholder:font-normal',
        'focus:outline-none focus:input-focus-theme',
        'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-[var(--muted)]',
        'hover:border-theme',
        error ? 'border-[var(--destructive)] focus:ring-[var(--destructive)]' : '',
        className
      )} {...props} />
      {error && <p className="text-xs text-[var(--destructive)] font-semibold mt-1.5">{error}</p>}
      {hint && !error && <p className="text-xs text-theme-muted mt-1.5 font-medium">{hint}</p>}
    </div>
  )
);
Input.displayName = 'Input';