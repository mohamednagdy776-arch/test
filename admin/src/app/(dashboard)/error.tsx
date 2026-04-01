'use client';

export default function DashboardError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-gray-900">Error loading page</h2>
        <p className="mt-2 text-sm text-gray-500">Something went wrong while loading this section.</p>
        <button
          onClick={reset}
          className="mt-4 inline-block rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-blue-800"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
