'use client';

import { cn } from '@/lib/utils';
import { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  required?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, id, required, ...props }, ref) => (
    <div className="w-full space-y-1.5">
      {label && (
        <label htmlFor={id} className="flex items-center gap-1 text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
          {label}
          {required && <span className="text-red-400 text-xs">*</span>}
        </label>
      )}
      <input
        ref={ref}
        id={id}
        required={required}
        className={cn(
          'flex h-11 w-full rounded-xl border px-4 py-2.5 text-base sm:text-sm font-medium transition-all duration-200',
          'placeholder:font-normal',
          'focus:outline-none focus:ring-2',
          'disabled:cursor-not-allowed disabled:opacity-50',
          error
            ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
            : 'focus:ring-[color-mix(in_srgb,var(--primary)_15%,transparent)] focus:border-[var(--primary)]',
          className
        )}
        style={{
          background: 'var(--card)',
          borderColor: error ? '#fca5a5' : 'var(--border)',
          color: 'var(--foreground)',
          boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.04)',
        }}
        {...props}
      />
      {error && (
        <p className="text-xs font-medium text-red-500 flex items-center gap-1">
          <span>⚠</span> {error}
        </p>
      )}
      {hint && !error && (
        <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{hint}</p>
      )}
    </div>
  )
);
Input.displayName = 'Input';
