'use client';
import { useEffect } from 'react';

export default function MainError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error('[App Error]', error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center p-8">
      <div className="max-w-md w-full rounded-3xl bg-gradient-to-br from-[#ECFDF5] to-[#F0FDF4] border border-emerald-100 p-8 text-center shadow-lg shadow-emerald-500/10">
        <p className="text-5xl mb-4">⚠️</p>
        <h2 className="text-xl font-bold text-[#065F46] mb-2">حدث خطأ غير متوقع</h2>
        <p className="text-sm text-[#10B981] mb-6 leading-relaxed">
          {error.message || 'يرجى المحاولة مجدداً أو التواصل مع الدعم إذا استمرت المشكلة.'}
        </p>
        <button
          onClick={reset}
          className="rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/30 transition-all"
        >
          المحاولة مجدداً
        </button>
      </div>
    </div>
  );
}
