'use client';

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { messages, Locale, defaultLocale, localeDir } from './messages';

const STORAGE_KEY = 'tayyibt_lang';

interface I18nContextType {
  locale: Locale;
  dir: 'rtl' | 'ltr';
  /** Translate a key, with optional {var} interpolation. Falls back en → ar → key. */
  t: (key: string, vars?: Record<string, string | number>) => string;
  setLocale: (l: Locale) => void;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

function resolve(locale: Locale, key: string): string {
  return messages[locale]?.[key] ?? messages.en?.[key] ?? messages.ar?.[key] ?? key;
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(defaultLocale);

  // Read the stored locale on mount and apply dir/lang to <html>.
  useEffect(() => {
    const stored = (typeof window !== 'undefined'
      ? (localStorage.getItem(STORAGE_KEY) as Locale | null)
      : null);
    const initial = stored && messages[stored] !== undefined ? stored
      : stored /* keep dir even for not-yet-translated locales */ ?? defaultLocale;
    setLocaleState(initial as Locale);
    document.documentElement.lang = initial as string;
    document.documentElement.dir = localeDir(initial as Locale);
  }, []);

  const setLocale = useCallback((l: Locale) => {
    localStorage.setItem(STORAGE_KEY, l);
    document.documentElement.lang = l;
    document.documentElement.dir = localeDir(l);
    setLocaleState(l);
  }, []);

  const t = useCallback((key: string, vars?: Record<string, string | number>) => {
    let s = resolve(locale, key);
    if (vars) for (const k of Object.keys(vars)) s = s.replace(new RegExp(`\\{${k}\\}`, 'g'), String(vars[k]));
    return s;
  }, [locale]);

  return (
    <I18nContext.Provider value={{ locale, dir: localeDir(locale), t, setLocale }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useT(): I18nContextType {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useT must be used within I18nProvider');
  return ctx;
}
