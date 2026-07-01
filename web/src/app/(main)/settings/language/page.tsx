'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useT } from '@/i18n/I18nProvider';
import type { Locale } from '@/i18n/messages';

const LANGUAGES = [
  { code: 'ar', name: 'العربية', native: 'العربية', flag: '🇸🇦', dir: 'rtl' },
  { code: 'en', name: 'English', native: 'English', flag: '🇺🇸', dir: 'ltr' },
  { code: 'ur', name: 'Urdu', native: 'اردو', flag: '🇵🇰', dir: 'rtl' },
  { code: 'tr', name: 'Türkçe', native: 'Türkçe', flag: '🇹🇷', dir: 'ltr' },
  { code: 'id', name: 'Indonesian', native: 'Bahasa Indonesia', flag: '🇮🇩', dir: 'ltr' },
  { code: 'ms', name: 'Malay', native: 'Bahasa Melayu', flag: '🇲🇾', dir: 'ltr' },
  { code: 'fr', name: 'Français', native: 'Français', flag: '🇫🇷', dir: 'ltr' },
];

export default function LanguagePage() {
  const { t, locale, setLocale } = useT();
  const [currentLang, setCurrentLang] = useState<string>(locale);
  const [saved, setSaved] = useState(false);

  // Keep the local selection in sync with the active locale from the provider.
  useEffect(() => {
    setCurrentLang(locale);
  }, [locale]);

  const handleSave = () => {
    // setLocale persists to localStorage, flips <html> dir/lang, and re-renders
    // the whole tree with the new translations (#49).
    setLocale(currentLang as Locale);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--background)] via-[var(--muted)] to-[var(--card)] px-4 py-8">
      <div className="max-w-md mx-auto space-y-6">
        <Link href="/settings" className="inline-flex items-center gap-2 text-sm text-[var(--primary)] hover:text-[var(--foreground)] transition-colors">
          <span>←</span> {t('lang.back')}
        </Link>

        {/* Header */}
        <div className="rounded-3xl bg-[var(--card)] border border-[var(--border)] p-5">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 shrink-0 rounded-2xl bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] flex items-center justify-center text-xl shadow-lg shadow-black/10">
              🌐
            </div>
            <div>
              <h1 className="text-xl font-bold text-[var(--primary)]">{t('lang.title')}</h1>
              <p className="text-xs text-[var(--primary)]">{t('lang.subtitle')}</p>
            </div>
          </div>
        </div>

        {/* Language options */}
        <div className="rounded-2xl bg-[var(--card)] border border-[var(--border)] p-4 space-y-3 shadow-lg shadow-black/5">
          {LANGUAGES.map((lang) => {
            const isActive = currentLang === lang.code;
            return (
              <button
                key={lang.code}
                onClick={() => { setCurrentLang(lang.code); setSaved(false); }}
                className={`w-full rounded-2xl border-2 p-4 flex items-center gap-4 transition-all duration-200 text-right ${
                  isActive
                    ? 'border-[var(--ring)] bg-[var(--muted)] shadow-lg shadow-black/5'
                    : 'border-[var(--border)] bg-[var(--card)] hover:border-[var(--border)] hover:shadow-md'
                }`}
              >
                <span className="text-3xl">{lang.flag}</span>
                <div className="flex-1">
                  <p className="font-semibold text-[var(--foreground)] text-base">{lang.name}</p>
                  <p className="text-sm text-[var(--primary)]">{lang.native}</p>
                </div>
                <span className={`h-6 w-6 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                  isActive ? 'bg-[var(--primary)] text-white' : 'bg-[var(--muted)] text-[var(--muted-foreground)]'
                }`}>
                  {isActive ? '✓' : ''}
                </span>
              </button>
            );
          })}
        </div>

        {/* Save */}
        <div className="flex items-center justify-between">
          <p className="text-xs text-[var(--primary)]">
            {saved ? `✓ ${t('lang.savedMsg')}` : t('lang.hint')}
          </p>
          <button
            onClick={handleSave}
            className="rounded-xl bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-black/10 hover:shadow-xl hover:shadow-black/10 transition-all"
          >
            {saved ? `✓ ${t('lang.saved')}` : t('lang.save')}
          </button>
        </div>

        {/* Note */}
        <div className="rounded-2xl bg-[var(--accent)]/10 border border-[var(--accent)]/20 p-4">
          <p className="text-xs font-bold text-[var(--accent)] mb-1">ℹ️ {t('lang.noteTitle')}</p>
          <p className="text-xs text-[var(--accent)] leading-relaxed">
            {t('lang.note')}
          </p>
        </div>
      </div>
    </div>
  );
}
