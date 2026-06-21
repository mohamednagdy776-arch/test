'use client';
import { useEffect } from 'react';

export default function MainError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error('[App Error]', error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center p-8">
      <div className="max-w-md w-full rounded-3xl bg-[var(--card)] border border-[var(--border)] p-8 text-center shadow-lg shadow-black/5">
        <p className="text-5xl mb-4">⚠️</p>
        <h2 className="text-xl font-bold text-[var(--foreground)] mb-2">حدث خطأ غير متوقع</h2>
        <p className="text-sm text-[var(--primary)] mb-6 leading-relaxed">
          {error.message || 'يرجى المحاولة مجدداً أو التواصل مع الدعم إذا استمرت المشكلة.'}
        </p>
        <button
          onClick={reset}
          className="rounded-xl bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-black/10 hover:shadow-xl hover:shadow-black/10 transition-all"
        >
          المحاولة مجدداً
        </button>
      </div>
    </div>
  );
}
