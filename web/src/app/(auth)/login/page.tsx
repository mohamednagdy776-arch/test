'use client';
import { LoginForm } from '@/features/auth/components/LoginForm';
import Link from 'next/link';

export default function LoginPage() {
  return (
    <main className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, #F0FDF4 0%, #DCFCE7 100%)' }} />
      <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full blur-3xl" style={{ background: '#10B981', opacity: 0.15 }} />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full blur-3xl" style={{ background: '#22C55E', opacity: 0.1 }} />
      <div className="relative w-full max-w-md px-4 py-8 animate-scale-in">
        <Link href="/" className="flex items-center gap-2 text-sm text-[#059669] hover:text-[#047857] transition-colors mb-6">
          <svg className="h-4 w-4 rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/></svg>
          العودة للرئيسية
        </Link>
        <div className="rounded-3xl bg-[#FFFBEB] shadow-xl p-8" style={{ borderRadius: '24px' }}>
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl text-[#FFFBEB] font-bold text-2xl shadow-lg" style={{ background: 'linear-gradient(135deg, #10B981, #059669)' }}>ط</div>
            <h1 className="text-2xl font-bold text-[#1F2937]">تسجيل الدخول</h1>
            <p className="mt-2 text-sm text-[#6B7280]">مرحباً بعودتك في طيبت</p>
          </div>
          <LoginForm />
        </div>
      </div>
    </main>
  );
}
