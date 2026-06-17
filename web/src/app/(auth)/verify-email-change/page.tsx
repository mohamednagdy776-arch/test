'use client';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { authApi } from '@/features/auth/api';

function VerifyEmailChangeInner() {
  const router = useRouter();
  const params = useSearchParams();
  const [state, setState] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = params.get('token');
    if (!token) {
      setState('error');
      setMessage('رابط غير صالح');
      return;
    }
    authApi
      .confirmEmailChange(token)
      .then((r: any) => {
        setState('success');
        setMessage(r?.message || 'تم تحديث بريدك الإلكتروني. يرجى تسجيل الدخول مرة أخرى.');
        setTimeout(() => router.push('/login'), 2500);
      })
      .catch((err: any) => {
        setState('error');
        setMessage(err?.response?.data?.message || 'تعذّر تأكيد تغيير البريد الإلكتروني');
      });
  }, [params, router]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl bg-[#FDFAF5] p-8 shadow-card-hover border border-[#C8D8DF]/60 text-center">
        <h1 className="text-xl font-bold text-[#213448] mb-3">تأكيد تغيير البريد الإلكتروني</h1>
        {state === 'loading' && (
          <div className="h-8 w-8 mx-auto animate-spin rounded-full border-4 border-[#547792] border-t-transparent" />
        )}
        {state !== 'loading' && (
          <p className={`text-sm ${state === 'success' ? 'text-[#52B069]' : 'text-red-600'}`}>{message}</p>
        )}
        <Link href="/login" className="mt-4 inline-block text-sm text-[#547792] hover:underline">
          الذهاب لتسجيل الدخول
        </Link>
      </div>
    </div>
  );
}

export default function VerifyEmailChangePage() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <VerifyEmailChangeInner />
    </Suspense>
  );
}
