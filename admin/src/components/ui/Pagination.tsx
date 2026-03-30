'use client';

interface PaginationProps {
  page: number;
  totalPages: number;
  onNext: () => void;
  onPrev: () => void;
  onPage: (p: number) => void;
}

export const Pagination = ({ page, totalPages, onNext, onPrev, onPage }: PaginationProps) => {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between mt-4 text-sm text-gray-600">
      <span>Page {page} of {totalPages}</span>
      <div className="flex gap-1">
        <button
          onClick={onPrev}
          disabled={page === 1}
          className="rounded px-3 py-1 border border-gray-200 hover:bg-gray-50 disabled:opacity-40"
        >
          ← Prev
        </button>
        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
          const p = Math.max(1, Math.min(page - 2, totalPages - 4)) + i;
          return (
            <button
              key={p}
              onClick={() => onPage(p)}
              className={`rounded px-3 py-1 border ${p === page ? 'bg-primary text-white border-primary' : 'border-gray-200 hover:bg-gray-50'}`}
            >
              {p}
            </button>
          );
        })}
        <button
          onClick={onNext}
          disabled={page === totalPages}
          className="rounded px-3 py-1 border border-gray-200 hover:bg-gray-50 disabled:opacity-40"
        >
          Next →
        </button>
      </div>
    </div>
  );
};
