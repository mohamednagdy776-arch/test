'use client';
import { useState } from 'react';
import { linkifyText, extractFirstUrl } from '@/lib/linkify';
import { LinkPreviewCard } from './LinkPreviewCard';
import { useTranslatedText } from '../useTranslation';

interface Props {
  content: string;
  isOwn: boolean;
  isEdited?: boolean;
  /** Target language code, or '' when translation is off. */
  targetLang: string;
}

// Renders a text message, transparently translating it into the reader's
// chosen language when one is set. The original is always one tap away, and we
// fall back to the original silently if translation isn't possible.
export function TranslatedMessageBody({ content, isOwn, isEdited, targetLang }: Props) {
  const { translated, status } = useTranslatedText(content, targetLang);
  const [showOriginal, setShowOriginal] = useState(false);

  const hasTranslation = !!translated && translated !== content;
  const displayText = hasTranslation && !showOriginal ? translated! : content;

  const linkColor = isOwn ? 'text-white' : 'text-[var(--primary)]';
  const subColor = isOwn ? 'rgba(255,255,255,0.7)' : 'var(--muted-foreground)';
  const previewUrl = extractFirstUrl(content);

  return (
    <>
      <p
        className="leading-relaxed whitespace-pre-wrap"
        dir="auto"
        style={{ color: isOwn ? 'white' : 'var(--foreground)' }}
      >
        {linkifyText(displayText, linkColor)}
      </p>

      {/* Translation status / show-original toggle */}
      {targetLang && status === 'loading' && (
        <span className="mt-1 inline-flex items-center gap-1 text-[10px]" style={{ color: subColor, opacity: 0.8 }}>
          <span
            className="w-2.5 h-2.5 rounded-full border border-transparent animate-spin"
            style={{ borderTopColor: 'currentColor', borderRightColor: 'currentColor' }}
          />
          جارٍ الترجمة…
        </span>
      )}

      {hasTranslation && (
        <button
          onClick={() => setShowOriginal((v) => !v)}
          className="mt-1 block text-[10px] font-medium transition-opacity hover:opacity-100"
          style={{ color: subColor, opacity: 0.85 }}
        >
          {showOriginal ? '🌐 عرض الترجمة' : '🌐 مترجم · عرض الأصل'}
        </button>
      )}

      {isEdited && (
        <span className="text-[10px]" style={{ opacity: 0.6, color: isOwn ? 'white' : 'var(--muted-foreground)' }}>
          {' '}
          (تم التعديل)
        </span>
      )}

      {previewUrl ? <LinkPreviewCard url={previewUrl} isOwn={isOwn} /> : null}
    </>
  );
}
