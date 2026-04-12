'use client';
import { cn } from '@/lib/utils';
import { HTMLAttributes, forwardRef } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'warm' | 'dark' | 'glass' | 'premium';
}

export const Card = forwardRef<HTMLDivElement, CardProps>(({ className, variant = 'default', ...props }, ref) => {
  const variants: Record<string, string> = {
    default: 'bg-[#FDFAF5] shadow-card border border-[#C8D8DF]/60',
    elevated: 'bg-[#FDFAF5] shadow-elevated border border-[#C8D8DF]/40',
    warm: 'bg-[#FDFAF5] border border-[#EAE0CF]',
    dark: 'bg-[#213448] text-[#FDFAF5] shadow-elevated border border-[#547792]/30',
    glass: 'bg-[#FDFAF5]/60 backdrop-blur-md border border-[#C8D8DF]/40 shadow-card',
    premium: 'bg-[#FDFAF5] shadow-card-hover border border-[#C8D8DF]/60 hover:shadow-glow-lg hover:border-[#547792]/30',
  };
  return <div ref={ref} className={cn('rounded-2xl transition-all duration-300 hover:-translate-y-0.5', variants[variant], className)} {...props} />;
});
Card.displayName = 'Card';

export const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn('flex flex-col space-y-1.5 p-6 pb-4', className)} {...props} />
);
export const CardTitle = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => <h3 ref={ref} className={cn('text-lg font-bold leading-none tracking-tight text-gradient', className)} {...props} />
);
export const CardDescription = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => <p ref={ref} className={cn('text-sm text-[#547792] font-medium', className)} {...props} />
);
export const CardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />
);
export const CardFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn('flex items-center p-6 pt-0', className)} {...props} />
);
