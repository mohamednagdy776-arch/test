import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

// shadcn/ui-style Badge with luxury variants.
const badgeVariants = cva('inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold', {
  variants: {
    variant: {
      gold: 'text-[#091F16] bg-gradient-to-br from-[#B8892A] to-[#E8C57A]',
      forest: 'bg-[#0A3D2B14] text-[#0A3D2B]',
      outline: 'border border-[#B8892A55] text-[#B8892A]',
    },
  },
  defaultVariants: { variant: 'gold' },
});

export function Badge({
  className,
  variant,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof badgeVariants>) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}
