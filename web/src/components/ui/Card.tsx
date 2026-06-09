'use client';

import { cn } from '@/lib/utils';
import { HTMLAttributes, forwardRef } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'warm' | 'dark' | 'glass' | 'premium';
}

export const Card = forwardRef<HTMLDivElement, CardProps>(({ className, variant = 'default', ...props }, ref) => {
  const variants: Record<string, string> = {
    default: 'card-theme-default rounded-2xl transition-all duration-300 hover:-translate-y-0.5',
    elevated: 'card-theme-elevated rounded-2xl transition-all duration-300 hover:-translate-y-0.5',
    warm: 'card-theme-warm rounded-2xl transition-all duration-300 hover:-translate-y-0.5',
    dark: 'card-theme-dark rounded-2xl transition-all duration-300 hover:-translate-y-0.5',
    glass: 'card-theme-glass rounded-2xl transition-all duration-300 hover:-translate-y-0.5',
    premium: 'card-theme-premium rounded-2xl',
  };
  return <div ref={ref} className={cn(variants[variant], className)} {...props} />;
});
Card.displayName = 'Card';

export const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn('flex flex-col space-y-1.5 p-6 pb-4', className)} {...props} />
);

export const CardTitle = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => <h3 ref={ref} className={cn('text-lg font-bold leading-none tracking-tight text-theme-primary', className)} {...props} />
);

export const CardDescription = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => <p ref={ref} className={cn('text-sm text-theme-muted font-medium', className)} {...props} />
);

export const CardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />
);

export const CardFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn('flex items-center p-6 pt-0', className)} {...props} />
);