'use client';
import { RegisterForm } from '@/features/auth/components/RegisterForm';
import Link from 'next/link';

export default function RegisterPage() {
  return (
    <main className="relative min-h-screen flex items-center justify-center overflow-hidden py-8 bg-[#EAE0CF]">
      <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, #EAE0CF 0%, #FDFAF5 50%, #D4E8EE 100%)' }} />
      <div className="absolute top-20 right-20 h-72 w-72 rounded-full blur-3xl" style={{ background: '#547792', opacity: 0.15 }} />
      <div className="absolute bottom-20 left-20 h-72 w-72 rounded-full blur-3xl" style={{ background: '#94B4C1', opacity: 0.2 }} />
      <div className="relative w-full max-w-md px-4 animate-scale-in">
        <Link href="/" className="flex items-center gap-2 text-sm text-[#547792] hover:text-[#213448] transition-colors mb-6">
          <svg className="h-4 w-4 rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/></svg>
          العودة للرئيسية
        </Link>
        <div className="rounded-2xl bg-[#FDFAF5] shadow-elevated p-8">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl text-[#FDFAF5] font-bold text-2xl shadow-md" style={{ background: 'linear-gradient(135deg, #213448, #547792)' }}>ط</div>
            <h1 className="text-2xl font-bold text-[#213448]">إنشاء حساب جديد</h1>
            <p className="mt-1.5 text-sm text-[#547792]">ابدأ رحلتك في البحث عن شريك الحياة</p>
          </div>
          <RegisterForm />
        </div>
      </div>
    </main>
  );
}
