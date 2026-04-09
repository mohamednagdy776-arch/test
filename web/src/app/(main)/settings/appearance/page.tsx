'use client';

import Link from 'next/link';
import { useTheme } from '@/components/ui/ThemeProvider';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';

export default function AppearancePage() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Link href="/settings" className="text-[#547792] hover:text-[#213448]">
          ← الإعدادات
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-[#213448]">المظهر</h1>
        <p className="text-sm text-[#547792] mt-1">تخصيص مظهر التطبيق</p>
      </div>

      <Card variant="warm">
        <CardHeader>
          <CardTitle className="text-[#213448] flex items-center gap-2">
            <span>🎨</span> الوضع
          </CardTitle>
          <CardDescription>اختر المظهر المناسب لك</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setTheme('light')}
              className={`p-6 rounded-xl border-2 transition-all ${
                theme === 'light'
                  ? 'border-[#4A8C6F] bg-[#4A8C6F]/10'
                  : 'border-[#C8D8DF]/60 bg-[#FDFAF5] hover:border-[#547792]/40'
              }`}
            >
              <div className="text-4xl mb-3">☀️</div>
              <h3 className="font-semibold text-[#213448]">فاتح</h3>
              <p className="text-sm text-[#547792] mt-1">مظهر فاتح وناصع</p>
              {theme === 'light' && (
                <span className="mt-2 inline-block px-2 py-1 text-xs rounded-full bg-[#4A8C6F] text-white">
                  نشط
                </span>
              )}
            </button>

            <button
              onClick={() => setTheme('dark')}
              className={`p-6 rounded-xl border-2 transition-all ${
                theme === 'dark'
                  ? 'border-[#4A8C6F] bg-[#4A8C6F]/10'
                  : 'border-[#C8D8DF]/60 bg-[#FDFAF5] hover:border-[#547792]/40'
              }`}
            >
              <div className="text-4xl mb-3">🌙</div>
              <h3 className="font-semibold text-[#213448]">داكن</h3>
              <p className="text-sm text-[#547792] mt-1">مظهر داكن مريح للعين</p>
              {theme === 'dark' && (
                <span className="mt-2 inline-block px-2 py-1 text-xs rounded-full bg-[#4A8C6F] text-white">
                  نشط
                </span>
              )}
            </button>
          </div>
        </CardContent>
      </Card>

      <Card variant="warm">
        <CardHeader>
          <CardTitle className="text-[#213448] flex items-center gap-2">
            <span>💡</span> إعدادات إضافية
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-start justify-between p-4 rounded-xl bg-[#FDFAF5] border border-[#C8D8DF]/60">
            <div className="flex-1">
              <h3 className="font-semibold text-[#213448]">تلقائي</h3>
              <p className="text-sm text-[#547792] mt-0.5">الالتزام بإعدادات النظام</p>
            </div>
            <button className="relative w-12 h-6 rounded-full bg-[#C8D8DF]">
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-white" />
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}