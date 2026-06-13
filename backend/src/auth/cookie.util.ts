import { Response } from 'express';

// Auth tokens are delivered as cookies so the browser stores them in HttpOnly
// cookies (not localStorage, which is readable by any XSS). Tokens are ALSO
// still returned in the JSON body for non-browser clients (mobile) and for
// backward compatibility — the web app simply stops reading them.

const DAY = 24 * 60 * 60 * 1000;
const isProd = process.env.NODE_ENV === 'production';

// SameSite=Lax + Secure (in prod) is safe here: the web app and the API are
// served from the same origin (nginx proxies /api/v1), so the cookie is
// first-party. Lax (not Strict) keeps the cookie on top-level OAuth redirects.
const base = { sameSite: 'lax' as const, secure: isProd, path: '/' };

/** Decode the `sub` claim from a JWT without verifying it (for the uid cookie). */
function decodeSub(token: string): string | undefined {
  try {
    const part = token.split('.')[1];
    return JSON.parse(Buffer.from(part, 'base64').toString('utf8')).sub;
  } catch {
    return undefined;
  }
}

export function setAuthCookies(
  res: Response,
  tokens: { accessToken?: string; refreshToken?: string } | null | undefined,
): void {
  if (!tokens) return;
  if (tokens.accessToken) {
    res.cookie('access_token', tokens.accessToken, { ...base, httpOnly: true, maxAge: 7 * DAY });
    const uid = decodeSub(tokens.accessToken);
    // `uid` is intentionally NOT HttpOnly: it lets the SPA know the current
    // user id (for socket handshake, "is this me?" checks) without ever
    // exposing the JWT to JavaScript. A user id is not a secret.
    if (uid) res.cookie('uid', uid, { ...base, httpOnly: false, maxAge: 7 * DAY });
  }
  if (tokens.refreshToken) {
    res.cookie('refresh_token', tokens.refreshToken, { ...base, httpOnly: true, maxAge: 30 * DAY });
  }
}

export function clearAuthCookies(res: Response): void {
  res.clearCookie('access_token', { ...base });
  res.clearCookie('refresh_token', { ...base });
  res.clearCookie('uid', { ...base });
}

/** Read a cookie value from a raw `Cookie` header (no cookie-parser dependency). */
export function readCookie(cookieHeader: string | undefined, name: string): string | undefined {
  if (!cookieHeader) return undefined;
  for (const part of cookieHeader.split(';')) {
    const idx = part.indexOf('=');
    if (idx === -1) continue;
    if (part.slice(0, idx).trim() === name) {
      return decodeURIComponent(part.slice(idx + 1).trim());
    }
  }
  return undefined;
}
