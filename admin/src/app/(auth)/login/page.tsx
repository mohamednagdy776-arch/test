'use client';

import { LoginForm } from '@/components/auth/LoginForm';

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-900">
      <div className="w-full max-w-md rounded-2xl bg-slate-800 border border-slate-700 p-8 shadow-2xl">
        <div className="mb-8 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-600 mx-auto mb-4">
            <span className="text-2xl font-bold text-white">T</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Tayyibt Admin</h1>
          <p className="mt-2 text-sm text-slate-400">Sign in to your account</p>
        </div>
        <LoginForm />
      </div>
    </main>
  );
}
