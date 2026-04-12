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
      {label && <label htmlFor={id} className="block text-sm font-semibold text-[#213448]">{label}</label>}
      <input ref={ref} id={id} className={cn(
        'flex h-11 w-full rounded-xl border bg-[#FDFAF5] px-4 py-2.5 text-sm text-[#131F2E] font-medium',
        'placeholder:text-[#BFB9AD] placeholder:font-normal transition-all duration-300',
        'focus:outline-none focus:ring-2 focus:ring-[#547792]/20 focus:border-[#547792]',
        'focus:shadow-[0_0_0_4px_rgba(84,119,146,0.1)] focus:shadow-glow',
        'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-[#EAE0CF]',
        'hover:border-[#94B4C1] hover:shadow-soft',
        error ? 'border-[#B05252] focus:ring-[#B05252]/20 focus:border-[#B05252] focus:shadow-[0_0_0_4px_rgba(176,82,82,0.1)]' : 'border-[#C8D8DF]',
        className
      )} {...props} />
      {error && <p className="text-xs text-[#B05252] font-semibold mt-1.5">{error}</p>}
      {hint && !error && <p className="text-xs text-[#547792] mt-1.5 font-medium">{hint}</p>}
    </div>
  )
);
Input.displayName = 'Input';
