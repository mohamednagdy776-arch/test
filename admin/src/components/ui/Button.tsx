import { clsx } from 'clsx';
type Variant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
type Size = 'sm' | 'md' | 'lg';
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> { variant?: Variant; size?: Size; loading?: boolean; }

const variants: Record<Variant, string> = {
  primary:   'bg-[#213448] text-[#FDFAF5] hover:bg-[#131F2E] shadow-sm hover:shadow-md',
  secondary: 'bg-[#94B4C1] text-[#213448] hover:bg-[#547792] hover:text-[#FDFAF5]',
  danger:    'bg-[#B05252] text-[#FDFAF5] hover:bg-[#8F3C3C] shadow-sm hover:shadow-md',
  ghost:     'bg-transparent text-[#547792] hover:bg-[#D4E8EE]',
  outline:   'border border-[#C8D8DF] text-[#213448] hover:bg-[#D4E8EE] hover:border-[#547792]',
};
const sizes: Record<Size, string> = {
  sm: 'h-8 px-3 text-xs rounded-lg gap-1.5',
  md: 'h-10 px-4 text-sm rounded-xl gap-2',
  lg: 'h-12 px-6 text-base rounded-xl gap-2.5',
};

export const Button = ({ variant = 'primary', size = 'md', loading, children, className, disabled, ...props }: ButtonProps) => (
  <button disabled={disabled || loading} className={clsx(
    'inline-flex items-center justify-center font-medium transition-all duration-200',
    'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
    'active:scale-[0.98] transform-gpu focus-visible:ring-2 focus-visible:ring-[#547792] focus-visible:ring-offset-2',
    variants[variant], sizes[size], className
  )} {...props}>
    {loading && <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/></svg>}
    {children}
  </button>
);
