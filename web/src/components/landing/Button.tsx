import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

// shadcn/ui-style Button (cva + Radix Slot) tuned to the luxury "Emerald Sanctum"
// palette. Distinct from the app's theme-variable Button on purpose — used by the
// landing page only.
const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-2xl text-sm font-bold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8892A] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]',
  {
    variants: {
      variant: {
        gold: 'text-[#091F16] bg-gradient-to-br from-[#B8892A] to-[#E8C57A] shadow-[0_14px_34px_-10px_#B8892A] hover:brightness-[1.06]',
        forest: 'text-[#E8C57A] bg-[#0A3D2B] shadow-[0_8px_22px_-8px_#0A3D2B] hover:bg-[#0D4E37]',
        outline: 'border-[1.5px] border-[#B8892A66] text-[#0A3D2B] hover:bg-[#0A3D2B0d]',
        ghostLight: 'border-[1.5px] border-[#E8C57A55] text-[#F4EFE4] backdrop-blur-sm hover:bg-white/10',
      },
      size: {
        default: 'h-12 px-8 py-3',
        lg: 'h-14 px-10 text-base',
        sm: 'h-10 px-5 text-sm',
      },
    },
    defaultVariants: { variant: 'gold', size: 'default' },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return <Comp ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />;
  },
);
Button.displayName = 'LuxButton';

export { buttonVariants };
