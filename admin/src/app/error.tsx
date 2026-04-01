'use client';

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900">Something went wrong</h1>
        <p className="mt-4 text-gray-600">An unexpected error occurred. Please try again.</p>
        <button
          onClick={reset}
          className="mt-6 inline-block rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-blue-800"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
