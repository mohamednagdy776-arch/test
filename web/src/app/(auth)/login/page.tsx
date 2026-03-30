'use client';
import { LoginForm } from '@/features/auth/components/LoginForm';

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-primary">طيبت</h1>
          <p className="mt-2 text-sm text-gray-500">تسجيل الدخول إلى حسابك</p>
        </div>
        <LoginForm />
      </div>
    </main>
  );
}
