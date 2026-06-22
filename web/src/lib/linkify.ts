// Shared URL detection + linkification used by chat messages (and anywhere
// plain user text needs clickable links). Keep the regex in sync with the
// backend LinkPreviewService so previews resolve for the same URLs.

import { Fragment, createElement, type ReactNode } from 'react';

// Global matcher for splitting text; mirrors the backend's single-URL regex.
const URL_RE_G = /\bhttps?:\/\/[^\s<>"')]+/gi;

// Trailing punctuation that is almost never part of the actual URL.
const TRAILING = /[.,;:!?)]+$/;

function cleanUrl(raw: string): string {
  return raw.replace(TRAILING, '');
}

export function extractFirstUrl(text?: string | null): string | null {
  if (!text) return null;
  const match = text.match(URL_RE_G);
  return match && match[0] ? cleanUrl(match[0]) : null;
}

// Split text into plain strings + <a> elements for any URLs it contains.
export function linkifyText(text: string, linkClassName?: string): ReactNode[] {
  if (!text) return [text];
  const nodes: ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  URL_RE_G.lastIndex = 0;
  let key = 0;
  while ((match = URL_RE_G.exec(text)) !== null) {
    const raw = match[0];
    const url = cleanUrl(raw);
    const start = match.index;
    if (start > lastIndex) nodes.push(text.slice(lastIndex, start));
    nodes.push(
      createElement(
        'a',
        {
          key: `lnk-${key++}`,
          href: url,
          target: '_blank',
          rel: 'noopener noreferrer',
          className: linkClassName,
          dir: 'ltr',
          style: { wordBreak: 'break-all', textDecoration: 'underline' },
          onClick: (e: React.MouseEvent) => e.stopPropagation(),
        },
        url,
      ),
    );
    // Re-append any trailing punctuation we trimmed off the URL.
    const trimmed = raw.slice(url.length);
    if (trimmed) nodes.push(trimmed);
    lastIndex = start + raw.length;
  }
  if (lastIndex < text.length) nodes.push(text.slice(lastIndex));
  return nodes.length ? nodes : [createElement(Fragment, { key: 'f' }, text)];
}
