'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';

const LANGUAGES = [
  { code: 'ar', name: 'العربية', native: 'العربية', flag: '🇸🇦' },
  { code: 'en', name: 'English', native: 'English', flag: '🇺🇸' },
];

export default function LanguagePage() {
  const [currentLang, setCurrentLang] = useState('ar');

  const LanguageOption = ({ lang, isActive }: { lang: typeof LANGUAGES[0]; isActive: boolean }) => (
    <button
      onClick={() => setCurrentLang(lang.code)}
      className={`w-full p-5 rounded-2xl border-2 transition-all duration-300 flex items-center gap-4 ${
        isActive
          ? 'border-emerald-500 bg-emerald-50/80 shadow-lg shadow-emerald-100'
          : 'border-emerald-200/50 bg-white/50 hover:border-emerald-300 hover:shadow-md'
      }`}
    >
      <span className="text-3xl">{lang.flag}</span>
      <div className="text-right flex-1">
        <h3 className="font-semibold text-emerald-900 text-lg">{lang.name}</h3>
        <p className="text-emerald-700/70">{lang.native}</p>
      </div>
      {isActive && (
        <span className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center text-lg">
          ✓
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
          <h1 className="text-3xl font-bold text-emerald-900">اللغة</h1>
          <p className="text-emerald-700/70 mt-2">اختر لغة الواجهة</p>
        </div>

        <Card variant="default" className="bg-white/80 backdrop-blur-sm border-emerald-200/50">
          <CardHeader>
            <CardTitle className="text-emerald-900 flex items-center gap-2">
              <span>🌐</span> لغة الواجهة
            </CardTitle>
            <CardDescription>اللغة التي ستظهر بها الواجهة</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {LANGUAGES.map((lang) => (
                <LanguageOption key={lang.code} lang={lang} isActive={currentLang === lang.code} />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}