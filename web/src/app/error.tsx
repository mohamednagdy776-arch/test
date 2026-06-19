'use client';
import { useEffect } from 'react';
import { Button } from '@/components/ui/Button';

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error('[App Error]', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-white p-8">
      <div className="max-w-md w-full rounded-3xl bg-gradient-to-br from-[#ECFDF5] to-[#F0FDF4] border border-emerald-100 p-8 text-center shadow-lg shadow-emerald-500/10">
        <p className="text-5xl mb-4">⚠️</p>
        <h1 className="text-xl font-bold text-[#065F46] mb-2">حدث خطأ غير متوقع</h1>
        <p className="text-sm text-[#10B981] mb-6 leading-relaxed">
          {error?.message || 'يرجى المحاولة مجدداً أو التواصل مع الدعم إذا استمرت المشكلة.'}
        </p>
        <Button onClick={reset} className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white">
          المحاولة مجدداً
        </Button>
      </div>
    </div>
  );
}
