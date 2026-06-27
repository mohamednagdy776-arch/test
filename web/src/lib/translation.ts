// Client-side chat translation engine.
//
// Strategy (cost = $0, no backend involvement):
//   1. Prefer the browser's built-in, on-device AI Translator API
//      (`window.Translator` / `window.LanguageDetector`, Chrome 138+). These
//      run a local model — instant, private, free, works offline once the
//      language pack is downloaded.
//   2. Fall back to the free Google `gtx` translate endpoint for browsers that
//      don't ship the native API yet. CORS-enabled, no key, sl=auto.
//
// Everything here is best-effort: if translation fails we return the original
// text so chat never breaks because of it.

export interface Language {
  /** BCP-47 / ISO-639-1 code passed to the translator. */
  code: string;
  /** Endonym shown in the picker (reads natively for each speaker). */
  label: string;
  flag: string;
}

// The languages a user can choose to read their chat in. Tilted toward the
// Muslim-majority + diaspora languages this audience actually uses, plus the
// big international ones. `off` (original) is handled separately in the UI.
export const LANGUAGES: Language[] = [
  { code: 'ar', label: 'العربية', flag: '🇸🇦' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'tr', label: 'Türkçe', flag: '🇹🇷' },
  { code: 'ur', label: 'اردو', flag: '🇵🇰' },
  { code: 'id', label: 'Bahasa Indonesia', flag: '🇮🇩' },
  { code: 'ms', label: 'Bahasa Melayu', flag: '🇲🇾' },
  { code: 'fa', label: 'فارسی', flag: '🇮🇷' },
  { code: 'hi', label: 'हिन्दी', flag: '🇮🇳' },
  { code: 'bn', label: 'বাংলা', flag: '🇧🇩' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
  { code: 'ru', label: 'Русский', flag: '🇷🇺' },
];

export const LANGUAGE_BY_CODE: Record<string, Language> = Object.fromEntries(
  LANGUAGES.map((l) => [l.code, l]),
);

const STORAGE_KEY = 'tayyibt:chat-translate-lang';
// Sentinel persisted when the user explicitly turns translation off, so we can
// tell "chose originals" apart from "hasn't decided yet" (→ browser default).
const OFF_SENTINEL = 'off';

/** A supported language matching the browser locale, or '' if none. */
export function detectBrowserDefaultLang(): string {
  if (typeof navigator === 'undefined') return '';
  const candidates = [navigator.language, ...(navigator.languages ?? [])];
  for (const tag of candidates) {
    const base = tag?.toLowerCase().split('-')[0];
    if (base && LANGUAGE_BY_CODE[base]) return base;
  }
  return '';
}

/**
 * Persisted target language, or '' (read originals). On a fresh device with no
 * stored choice we suggest the browser's language so translation is discoverable
 * out of the box; the user can still switch it off (which we remember).
 */
export function getStoredTargetLang(): string {
  if (typeof window === 'undefined') return '';
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === null) return detectBrowserDefaultLang(); // never decided
    if (stored === OFF_SENTINEL) return ''; // explicitly off
    return stored;
  } catch {
    return '';
  }
}

export function setStoredTargetLang(code: string): void {
  if (typeof window === 'undefined') return;
  try {
    // Persist the explicit-off sentinel so we don't re-suggest next visit.
    window.localStorage.setItem(STORAGE_KEY, code || OFF_SENTINEL);
  } catch {
    /* private mode / quota — non-fatal */
  }
}

// ── Native browser AI APIs ──────────────────────────────────────────────────
// Typed loosely: these are very new and not in lib.dom yet. We only touch the
// handful of members we use and feature-detect every one.

interface NativeTranslator {
  translate(input: string): Promise<string>;
}
interface NativeTranslatorStatic {
  availability(opts: { sourceLanguage: string; targetLanguage: string }): Promise<string>;
  create(opts: { sourceLanguage: string; targetLanguage: string }): Promise<NativeTranslator>;
}
interface NativeDetector {
  detect(input: string): Promise<Array<{ detectedLanguage: string; confidence: number }>>;
}
interface NativeDetectorStatic {
  create(): Promise<NativeDetector>;
}

function getNativeTranslator(): NativeTranslatorStatic | null {
  if (typeof window === 'undefined') return null;
  return (window as unknown as { Translator?: NativeTranslatorStatic }).Translator ?? null;
}
function getNativeDetector(): NativeDetectorStatic | null {
  if (typeof window === 'undefined') return null;
  return (window as unknown as { LanguageDetector?: NativeDetectorStatic }).LanguageDetector ?? null;
}

export function isNativeTranslationSupported(): boolean {
  return !!getNativeTranslator();
}

// Cache one translator instance per source→target pair; creating one can
// trigger a model download, so we never want to do it twice.
const translatorCache = new Map<string, Promise<NativeTranslator | null>>();
let detectorPromise: Promise<NativeDetector | null> | null = null;

function getDetector(): Promise<NativeDetector | null> {
  const Detector = getNativeDetector();
  if (!Detector) return Promise.resolve(null);
  if (!detectorPromise) {
    detectorPromise = Detector.create().catch(() => null);
  }
  return detectorPromise;
}

async function detectLanguage(text: string): Promise<string | null> {
  const detector = await getDetector();
  if (!detector) return null;
  try {
    const results = await detector.detect(text);
    const top = results?.[0];
    return top && top.confidence >= 0.5 ? top.detectedLanguage : null;
  } catch {
    return null;
  }
}

async function getTranslator(source: string, target: string): Promise<NativeTranslator | null> {
  const Translator = getNativeTranslator();
  if (!Translator) return null;
  const key = `${source}->${target}`;
  let cached = translatorCache.get(key);
  if (!cached) {
    cached = (async () => {
      try {
        const status = await Translator.availability({ sourceLanguage: source, targetLanguage: target });
        // 'unavailable'/'no' → this pair isn't supported on-device.
        if (status === 'unavailable' || status === 'no') return null;
        return await Translator.create({ sourceLanguage: source, targetLanguage: target });
      } catch {
        return null;
      }
    })();
    translatorCache.set(key, cached);
  }
  return cached;
}

// ── Free cloud fallback ─────────────────────────────────────────────────────

async function translateViaGoogle(text: string, target: string): Promise<string | null> {
  const url =
    'https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&dt=t' +
    `&tl=${encodeURIComponent(target)}&q=${encodeURIComponent(text)}`;
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const json = (await res.json()) as [Array<[string, string]>, ...unknown[]];
    const segments = json?.[0];
    if (!Array.isArray(segments)) return null;
    return segments.map((seg) => seg?.[0] ?? '').join('');
  } catch {
    return null;
  }
}

// ── Public translate API ────────────────────────────────────────────────────

// Result cache keyed by target+text so re-renders and re-reads are free.
const resultCache = new Map<string, string>();

export interface TranslationResult {
  text: string;
  /** True when the source already matched the target — nothing was changed. */
  unchanged: boolean;
}

/**
 * Translate `text` into `target`. Tries the native on-device model first, then
 * the free cloud endpoint. Returns the original text (unchanged) on any failure
 * or when the source language already equals the target.
 */
export async function translateText(text: string, target: string): Promise<TranslationResult> {
  const trimmed = text?.trim();
  if (!trimmed || !target) return { text, unchanged: true };

  const cacheKey = `${target}::${trimmed}`;
  const hit = resultCache.get(cacheKey);
  if (hit !== undefined) {
    return { text: hit, unchanged: hit === text };
  }

  // Native path needs an explicit source language, so detect first.
  const source = await detectLanguage(trimmed);
  if (source && source === target) {
    resultCache.set(cacheKey, text);
    return { text, unchanged: true };
  }

  let output: string | null = null;
  if (source) {
    const translator = await getTranslator(source, target);
    if (translator) {
      try {
        output = await translator.translate(text);
      } catch {
        output = null;
      }
    }
  }

  // Fall back to the free cloud endpoint (also covers the no-detector case,
  // since it auto-detects the source).
  if (output == null) {
    output = await translateViaGoogle(text, target);
  }

  const finalText = output ?? text;
  resultCache.set(cacheKey, finalText);
  return { text: finalText, unchanged: finalText === text };
}
