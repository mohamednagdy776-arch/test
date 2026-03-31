import { clsx } from 'clsx';

type Variant = 'primary' | 'danger' | 'ghost' | 'outline';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  loading?: boolean;
}

const variants: Record<Variant, string> = {
  primary: 'bg-primary text-white hover:bg-blue-700',
  danger: 'bg-danger text-white hover:bg-red-700',
  ghost: 'bg-transparent text-gray-700 hover:bg-gray-100',
  outline: 'bg-transparent border border-gray-300 text-gray-700 hover:bg-gray-50',
};

export const Button = ({ variant = 'primary', loading, children, className, disabled, ...props }: ButtonProps) => {
  return (
    <button
      disabled={disabled || loading}
      className={clsx(
        'inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50',
        variants[variant],
        className
      )}
      {...props}
    >
      {loading ? 'Loading...' : children}
    </button>
  );
};
