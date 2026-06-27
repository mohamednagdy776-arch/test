import * as React from 'react';
import { cn } from '@/lib/utils';

// shadcn/ui-style Card primitives — luxury parchment surface.
export const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'rounded-3xl border border-[#DDD5BF] bg-[#FDFAF3] shadow-[0_1px_3px_rgba(10,61,43,0.05)]',
        className,
      )}
      {...props}
    />
  ),
);
Card.displayName = 'Card';

export const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn('p-7', className)} {...props} />,
);
CardContent.displayName = 'CardContent';

export const CardTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn('text-lg font-bold text-[#0A3D2B]', className)}
      style={{ fontFamily: "'Noto Serif Arabic', serif" }}
      {...props}
    />
  ),
);
CardTitle.displayName = 'CardTitle';
