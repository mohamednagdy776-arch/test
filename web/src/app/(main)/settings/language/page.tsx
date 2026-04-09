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

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Link href="/settings" className="text-[#547792] hover:text-[#213448]">
          ← الإعدادات
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-[#213448]">اللغة</h1>
        <p className="text-sm text-[#547792] mt-1">اختر لغة الواجهة</p>
      </div>

      <Card variant="warm">
        <CardHeader>
          <CardTitle className="text-[#213448] flex items-center gap-2">
            <span>🌐</span> لغة الواجهة
          </CardTitle>
          <CardDescription>اللغة التي ستظهر بها الواجهة</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => setCurrentLang(lang.code)}
                className={`w-full p-4 rounded-xl border-2 transition-all flex items-center gap-4 ${
                  currentLang === lang.code
                    ? 'border-[#4A8C6F] bg-[#4A8C6F]/10'
                    : 'border-[#C8D8DF]/60 bg-[#FDFAF5] hover:border-[#547792]/40'
                }`}
              >
                <span className="text-2xl">{lang.flag}</span>
                <div className="text-right flex-1">
                  <h3 className="font-semibold text-[#213448]">{lang.name}</h3>
                  <p className="text-sm text-[#547792]">{lang.native}</p>
                </div>
                {currentLang === lang.code && (
                  <span className="text-[#4A8C6F] text-xl">✓</span>
                )}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}