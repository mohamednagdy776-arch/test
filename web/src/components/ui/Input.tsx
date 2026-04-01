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
      {label && <label htmlFor={id} className="block text-sm font-medium text-[#213448]">{label}</label>}
      <input ref={ref} id={id} className={cn(
        'flex h-10 w-full rounded-xl border bg-[#FDFAF5] px-3 py-2 text-sm text-[#131F2E]',
        'placeholder:text-[#BFB9AD] transition-all duration-200',
        'focus:outline-none focus:ring-2 focus:ring-[#547792]/20 focus:border-[#547792]',
        'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-[#EAE0CF]',
        error ? 'border-[#B05252] focus:ring-[#B05252]/20 focus:border-[#B05252]' : 'border-[#C8D8DF]',
        className
      )} {...props} />
      {error && <p className="text-xs text-[#B05252] font-medium">{error}</p>}
      {hint && !error && <p className="text-xs text-[#547792]">{hint}</p>}
    </div>
  )
);
Input.displayName = 'Input';
