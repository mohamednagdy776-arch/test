'use client';
import { cn } from '@/lib/utils';
import { SelectHTMLAttributes, forwardRef } from 'react';

interface SelectOption { value: string; label: string; }
interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> { label?: string; options: SelectOption[]; placeholder?: string; error?: string; }

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, options, placeholder, error, id, ...props }, ref) => (
    <div className="w-full space-y-1.5">
      {label && <label htmlFor={id} className="block text-sm font-medium text-[#213448]">{label}</label>}
      <select ref={ref} id={id} className={cn(
        'flex h-10 w-full rounded-xl border border-[#C8D8DF] bg-[#FDFAF5] px-3 py-2 text-sm text-[#131F2E]',
        'transition-all duration-200 appearance-none focus:outline-none focus:ring-2 focus:ring-[#547792]/20 focus:border-[#547792]',
        'disabled:cursor-not-allowed disabled:opacity-50', error && 'border-[#B05252]', className
      )} {...props}>
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      {error && <p className="text-xs text-[#B05252] font-medium">{error}</p>}
    </div>
  )
);
Select.displayName = 'Select';
