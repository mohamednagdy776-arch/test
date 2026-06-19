'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

const LANGUAGES = [
  { code: 'ar', name: 'العربية', native: 'العربية', flag: '🇸🇦', dir: 'rtl' },
  { code: 'en', name: 'English', native: 'English', flag: '🇺🇸', dir: 'ltr' },
];

const STORAGE_KEY = 'tayyibt_lang';

export default function LanguagePage() {
  const [currentLang, setCurrentLang] = useState('ar');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) setCurrentLang(stored);
  }, []);

  const handleSave = () => {
    localStorage.setItem(STORAGE_KEY, currentLang);
    document.documentElement.dir = LANGUAGES.find(l => l.code === currentLang)?.dir ?? 'rtl';
    document.documentElement.lang = currentLang;
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-emerald-100/50 to-emerald-50 px-4 py-8">
      <div className="max-w-md mx-auto space-y-6">
        <Link href="/settings" className="inline-flex items-center gap-2 text-sm text-emerald-700 hover:text-emerald-900 transition-colors">
          <span>←</span> العودة للإعدادات
        </Link>

        {/* Header */}
        <div className="rounded-3xl bg-gradient-to-br from-[#ECFDF5] to-[#F0FDF4] border border-emerald-100 p-5">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 shrink-0 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-xl shadow-lg shadow-emerald-500/25">
              🌐
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#059669]">اللغة</h1>
              <p className="text-xs text-[#10B981]">اختر لغة واجهة التطبيق</p>
            </div>
          </div>
        </div>

        {/* Language options */}
        <div className="rounded-2xl bg-white/80 border border-emerald-100 p-4 space-y-3 shadow-lg shadow-emerald-500/5">
          {LANGUAGES.map((lang) => {
            const isActive = currentLang === lang.code;
            return (
              <button
                key={lang.code}
                onClick={() => { setCurrentLang(lang.code); setSaved(false); }}
                className={`w-full rounded-2xl border-2 p-4 flex items-center gap-4 transition-all duration-200 text-right ${
                  isActive
                    ? 'border-emerald-500 bg-emerald-50 shadow-lg shadow-emerald-100'
                    : 'border-emerald-100 bg-[#FFFBEB] hover:border-emerald-300 hover:shadow-md'
                }`}
              >
                <span className="text-3xl">{lang.flag}</span>
                <div className="flex-1">
                  <p className="font-semibold text-[#065F46] text-base">{lang.name}</p>
                  <p className="text-sm text-[#10B981]">{lang.native}</p>
                </div>
                <span className={`h-6 w-6 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                  isActive ? 'bg-emerald-500 text-white' : 'bg-emerald-100 text-emerald-300'
                }`}>
                  {isActive ? '✓' : ''}
                </span>
              </button>
            );
          })}
        </div>

        {/* Save */}
        <div className="flex items-center justify-between">
          <p className="text-xs text-[#10B981]">
            {saved ? '✓ تم حفظ اللغة بنجاح' : 'اختر اللغة ثم اضغط حفظ'}
          </p>
          <button
            onClick={handleSave}
            className="rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/30 transition-all"
          >
            {saved ? '✓ محفوظ' : 'حفظ'}
          </button>
        </div>

        {/* Note */}
        <div className="rounded-2xl bg-amber-50 border border-amber-100 p-4">
          <p className="text-xs font-bold text-amber-700 mb-1">ℹ️ ملاحظة</p>
          <p className="text-xs text-amber-600 leading-relaxed">
            سيتم تطبيق اللغة فور الضغط على حفظ. قد يلزم تحديث الصفحة لرؤية التغيير بالكامل.
          </p>
        </div>
      </div>
    </div>
  );
}
