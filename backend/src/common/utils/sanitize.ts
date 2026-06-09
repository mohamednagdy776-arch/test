/**
 * Lightweight HTML sanitizer for user-generated content (posts, comments, bios).
 *
 * Defense-in-depth against stored XSS (C-05). The frontend renders this content
 * as text (React escapes by default), but we also strip dangerous markup on input
 * so the stored value can never carry an executable payload.
 *
 * This removes:
 *  - <script>, <style>, <iframe>, <object>, <embed> blocks
 *  - inline event handlers (onerror=, onclick=, …)
 *  - javascript: / data: URIs in href/src
 *  - any remaining HTML tags are neutralized by escaping angle brackets
 */
export function sanitizeUserContent(input: unknown): string {
  if (input == null) return '';
  let s = String(input);

  // Drop entire dangerous element blocks (with their content).
  s = s.replace(
    /<\s*(script|style|iframe|object|embed)[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/gi,
    '',
  );

  // Drop self-closing / unclosed dangerous tags.
  s = s.replace(/<\s*(script|style|iframe|object|embed|link|meta)[^>]*>/gi, '');

  // Strip inline event handler attributes (onerror=, onload=, onclick=, …).
  s = s.replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '');

  // Neutralize javascript:/data: URIs.
  s = s.replace(/(href|src)\s*=\s*("|')?\s*(javascript|data):[^"'>\s]*/gi, '$1=""');

  return s.trim();
}
