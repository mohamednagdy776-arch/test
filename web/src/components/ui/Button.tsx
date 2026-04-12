'use client';
import { cn } from '@/lib/utils';
import { ButtonHTMLAttributes, forwardRef } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline' | 'accent';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, disabled, children, ...props }, ref) => {
    const variants: Record<string, string> = {
      primary:   'bg-gradient-to-r from-[#213448] to-[#547792] text-[#FDFAF5] hover:from-[#131F2E] hover:to-[#213448] shadow-glow-primary hover:shadow-glow-lg hover:shadow-[#547792]/30',
      secondary: 'bg-gradient-to-r from-[#94B4C1] to-[#547792] text-[#213448] hover:from-[#547792] hover:to-[#213448] hover:text-[#FDFAF5] shadow-soft hover:shadow-glow',
      danger:    'bg-gradient-to-r from-[#B05252] to-[#8F3C3C] text-[#FDFAF5] hover:from-[#8F3C3C] hover:to-[#B05252] shadow-soft hover:shadow-[#B05252]/30',
      ghost:     'bg-transparent text-[#547792] hover:bg-[#D4E8EE] hover:text-[#213448]',
      outline:   'border border-[#C8D8DF] text-[#213448] hover:bg-[#D4E8EE] hover:border-[#547792] hover:shadow-soft',
      accent:    'bg-gradient-to-r from-[#547792] to-[#94B4C1] text-[#FDFAF5] hover:from-[#213448] hover:to-[#547792] shadow-soft hover:shadow-glow',
    };
    const sizes: Record<string, string> = {
      sm: 'h-8 px-3 text-xs rounded-lg gap-1.5',
      md: 'h-10 px-4 text-sm rounded-xl gap-2',
      lg: 'h-12 px-6 text-base rounded-xl gap-2.5',
    };
    return (
      <button ref={ref} className={cn(
        'inline-flex items-center justify-center font-medium transition-all duration-300 ease-out',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
        'active:scale-[0.98] transform-gpu',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#547792] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FDFAF5]',
        'hover:-translate-y-0.5',
        variants[variant], sizes[size], className
      )} disabled={disabled || loading} {...props}>
        {loading && <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/></svg>}
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';
