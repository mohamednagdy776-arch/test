interface ErrorMessageProps {
  message?: string;
  className?: string;
}

export const ErrorMessage = ({ message = 'Something went wrong. Please try again.', className = '' }: ErrorMessageProps) => (
  <div className={`rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 ${className}`}>
    {message}
  </div>
);
