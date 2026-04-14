'use client';

import Link from 'next/link';
import { useTheme } from '@/components/ui/ThemeProvider';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';

export default function AppearancePage() {
  const { theme, setTheme } = useTheme();

  const ThemeOption = ({ value, icon, label, description, isActive }: { value: string; icon: string; label: string; description: string; isActive: boolean }) => (
    <button
      onClick={() => setTheme(value)}
      className={`p-6 rounded-2xl border-2 transition-all duration-300 ${
        isActive
          ? 'border-emerald-500 bg-emerald-50/80 shadow-lg shadow-emerald-100'
          : 'border-emerald-200/50 bg-white/50 hover:border-emerald-300 hover:shadow-md'
      }`}
    >
      <div className="text-4xl mb-3">{icon}</div>
      <h3 className="font-semibold text-emerald-900 text-lg">{label}</h3>
      <p className="text-emerald-700/70 text-sm mt-1">{description}</p>
      {isActive && (
        <span className="mt-3 inline-block px-3 py-1 text-xs rounded-full bg-emerald-500 text-white font-medium">
          نشط
        </span>
      )}
    </button>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-sage-50 via-sage-100/50 to-sage-50 px-4 py-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <Link href="/settings" className="inline-flex items-center gap-2 text-emerald-700 hover:text-emerald-900 transition-colors">
          <span>←</span> <span>العودة للإعدادات</span>
        </Link>

        <div>
          <h1 className="text-3xl font-bold text-emerald-900">المظهر</h1>
          <p className="text-emerald-700/70 mt-2">تخصيص مظهر التطبيق</p>
        </div>

        <Card variant="default" className="bg-white/80 backdrop-blur-sm border-emerald-200/50">
          <CardHeader>
            <CardTitle className="text-emerald-900 flex items-center gap-2">
              <span>🎨</span> الوضع
            </CardTitle>
            <CardDescription>اختر المظهر المناسب لك</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <ThemeOption
                value="light"
                icon="☀️"
                label="فاتح"
                description="مظهر فاتح وناصع"
                isActive={theme === 'light'}
              />
              <ThemeOption
                value="dark"
                icon="🌙"
                label="داكن"
                description="مظهر داكن مريح"
                isActive={theme === 'dark'}
              />
            </div>
          </CardContent>
        </Card>

        <Card variant="default" className="bg-white/80 backdrop-blur-sm border-emerald-200/50">
          <CardHeader>
            <CardTitle className="text-emerald-900 flex items-center gap-2">
              <span>💡</span> إعدادات إضافية
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-start justify-between p-4 rounded-xl bg-white/50 border border-emerald-100/50">
              <div className="flex-1">
                <h3 className="font-semibold text-emerald-900">تلقائي</h3>
                <p className="text-emerald-700/70 text-sm mt-0.5">الالتزام بإعدادات النظام</p>
              </div>
              <button className="relative w-14 h-7 rounded-full bg-sage-300">
                <span className="absolute top-1 right-1 w-5 h-5 rounded-full bg-white shadow-md" />
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}