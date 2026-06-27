'use client';
import { useCallback, useEffect, useState } from 'react';
import {
  getStoredTargetLang,
  setStoredTargetLang,
  translateText,
} from '@/lib/translation';

// Custom event so every mounted chat shares one target-language setting without
// a context provider — picking a language in one window updates them all.
const LANG_EVENT = 'tayyibt:translate-lang-changed';

/**
 * The user's chosen "read messages in this language" preference, persisted in
 * localStorage. `lang === ''` means show originals (translation off).
 */
export function useTargetLanguage() {
  const [lang, setLangState] = useState('');

  useEffect(() => {
    setLangState(getStoredTargetLang());
    const sync = () => setLangState(getStoredTargetLang());
    window.addEventListener(LANG_EVENT, sync);
    window.addEventListener('storage', sync); // other tabs
    return () => {
      window.removeEventListener(LANG_EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  const setLang = useCallback((code: string) => {
    setStoredTargetLang(code);
    setLangState(code);
    window.dispatchEvent(new Event(LANG_EVENT));
  }, []);

  return { lang, setLang };
}

export type TranslationStatus = 'idle' | 'loading' | 'done' | 'error';

/**
 * Translate a single message body into `target`. Returns the translated text
 * plus status. When `target` is empty, or the result matches the original,
 * `translated` is null and the caller should just show the original.
 */
export function useTranslatedText(text: string, target: string) {
  const [translated, setTranslated] = useState<string | null>(null);
  const [status, setStatus] = useState<TranslationStatus>('idle');

  useEffect(() => {
    if (!target || !text?.trim()) {
      setTranslated(null);
      setStatus('idle');
      return;
    }

    let cancelled = false;
    setStatus('loading');
    translateText(text, target)
      .then((res) => {
        if (cancelled) return;
        setTranslated(res.unchanged ? null : res.text);
        setStatus('done');
      })
      .catch(() => {
        if (cancelled) return;
        setTranslated(null);
        setStatus('error');
      });

    return () => {
      cancelled = true;
    };
  }, [text, target]);

  return { translated, status };
}
