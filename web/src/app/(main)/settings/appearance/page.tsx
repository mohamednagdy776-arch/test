'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useTheme, availableThemes, type Theme } from '@/components/ui/ThemeProvider';
import { useUpdateAppearanceSettings } from '@/features/settings/hooks';

const CATEGORIES = [
  { id: 'base', label: 'الأساسية' },
  { id: 'light', label: 'فاتح' },
  { id: 'dark', label: 'داكن' },
  { id: 'special', label: 'مناسبات' },
];

export default function AppearancePage() {
  const { theme, setTheme } = useTheme();
  const updateAppearance = useUpdateAppearanceSettings();
  const [activeCategory, setActiveCategory] = useState<string>('base');
  const [largeText, setLargeText] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [saved, setSaved] = useState(false);

  // Load accessibility prefs from localStorage
  useEffect(() => {
    setLargeText(localStorage.getItem('largeText') === 'true');
    setReducedMotion(localStorage.getItem('reducedMotion') === 'true');
    setHighContrast(localStorage.getItem('highContrast') === 'true');
  }, []);

  // Apply accessibility settings to <html>
  useEffect(() => {
    const root = document.documentElement;
    if (largeText) root.classList.add('text-lg');
    else root.classList.remove('text-lg');
    localStorage.setItem('largeText', String(largeText));
  }, [largeText]);

  useEffect(() => {
    const root = document.documentElement;
    if (reducedMotion) root.classList.add('motion-reduce');
    else root.classList.remove('motion-reduce');
    localStorage.setItem('reducedMotion', String(reducedMotion));
  }, [reducedMotion]);

  useEffect(() => {
    const root = document.documentElement;
    if (highContrast) root.classList.add('high-contrast');
    else root.classList.remove('high-contrast');
    localStorage.setItem('highContrast', String(highContrast));
  }, [highContrast]);

  const handleSelectTheme = (t: Theme) => {
    setTheme(t); // applies immediately via ThemeProvider → data-theme attribute
  };

  const handleSave = async () => {
    try {
      await updateAppearance.mutateAsync({
        theme,
        colorScheme: 'emerald',
        reducedMotion,
        largeText,
        highContrast,
        fontFamily: 'default',
      } as any);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch {
      // non-critical — theme is already applied via localStorage
    }
  };

  const filteredThemes = availableThemes.filter(t => t.category === activeCategory);

  return (
    <div className="min-h-screen p-4 md:p-8" style={{ backgroundColor: 'var(--background)', color: 'var(--foreground)' }}>
      <div className="max-w-2xl mx-auto space-y-6">
        <Link
          href="/settings"
          className="inline-flex items-center gap-2 text-sm transition-colors"
          style={{ color: 'var(--accent)' }}
        >
          ← العودة للإعدادات
        </Link>

        <div>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--foreground)' }}>المظهر</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--muted-foreground)' }}>اختر سمة للتطبيق — تُطبَّق فوراً على كامل الموقع</p>
        </div>

        {/* Category tabs */}
        <div className="flex gap-2 flex-wrap">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className="px-4 py-1.5 rounded-full text-sm font-medium transition-all"
              style={
                activeCategory === cat.id
                  ? { backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }
                  : { backgroundColor: 'var(--muted)', color: 'var(--muted-foreground)' }
              }
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Theme grid */}
        <div
          className="rounded-2xl p-5 border"
          style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
        >
          <h2 className="text-sm font-semibold mb-4" style={{ color: 'var(--muted-foreground)' }}>
            اختر السمة
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {filteredThemes.map(t => {
              const isSelected = theme === t.value;
              return (
                <button
                  key={t.value}
                  onClick={() => handleSelectTheme(t.value)}
                  className="relative p-4 rounded-xl border-2 text-right transition-all duration-200 hover:scale-[1.02]"
                  style={
                    isSelected
                      ? { borderColor: 'var(--primary)', backgroundColor: 'var(--muted)' }
                      : { borderColor: 'var(--border)', backgroundColor: 'transparent' }
                  }
                >
                  <div className="text-2xl mb-1">{t.icon}</div>
                  <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>{t.label}</p>
                  {isSelected && (
                    <span
                      className="absolute top-2 left-2 h-5 w-5 rounded-full flex items-center justify-center text-xs font-bold"
                      style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}
                    >
                      ✓
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Current theme preview */}
        <div
          className="rounded-2xl p-5 border"
          style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
        >
          <h2 className="text-sm font-semibold mb-4" style={{ color: 'var(--muted-foreground)' }}>
            معاينة السمة الحالية
          </h2>
          <div className="space-y-3">
            <div className="h-10 rounded-xl flex items-center px-4 text-sm font-medium" style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}>
              اللون الرئيسي
            </div>
            <div className="h-10 rounded-xl flex items-center px-4 text-sm font-medium border" style={{ backgroundColor: 'var(--card)', color: 'var(--card-foreground)', borderColor: 'var(--border)' }}>
              لون البطاقة
            </div>
            <div className="h-10 rounded-xl flex items-center px-4 text-sm font-medium" style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-foreground)' }}>
              لون التمييز
            </div>
          </div>
        </div>

        {/* Accessibility */}
        <div
          className="rounded-2xl p-5 border space-y-4"
          style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
        >
          <h2 className="text-sm font-semibold" style={{ color: 'var(--muted-foreground)' }}>إمكانية الوصول</h2>

          {[
            { label: 'نص كبير', desc: 'زيادة حجم الخط في التطبيق', value: largeText, onChange: setLargeText },
            { label: 'تقليل الحركة', desc: 'تقليل تأثيرات الحركة والانتقالات', value: reducedMotion, onChange: setReducedMotion },
            { label: 'تباين عالٍ', desc: 'زيادة التباين لتحسين قراءة النصوص', value: highContrast, onChange: setHighContrast },
          ].map(item => (
            <div key={item.label} className="flex items-center justify-between p-3 rounded-xl" style={{ backgroundColor: 'var(--muted)' }}>
              <div>
                <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>{item.label}</p>
                <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{item.desc}</p>
              </div>
              <button
                onClick={() => item.onChange(!item.value)}
                className="relative w-12 h-6 rounded-full transition-all duration-300 shrink-0"
                style={{ backgroundColor: item.value ? 'var(--primary)' : 'var(--border)' }}
              >
                <span
                  className="absolute top-1 w-4 h-4 rounded-full transition-transform duration-300"
                  style={{
                    backgroundColor: 'var(--card)',
                    transform: item.value ? 'translateX(-1.75rem)' : 'translateX(-0.25rem)',
                    right: 0,
                    boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                  }}
                />
              </button>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between">
          <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
            {saved ? '✓ تم الحفظ' : 'التغييرات تُطبَّق فوراً'}
          </p>
          <button
            onClick={handleSave}
            disabled={updateAppearance.isPending}
            className="px-6 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-60"
            style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}
          >
            {updateAppearance.isPending ? 'جاري الحفظ...' : 'حفظ التغييرات'}
          </button>
        </div>
      </div>
    </div>
  );
}
