// Lightweight User-Agent parser (no dependency) to turn the raw UA string into a
// friendly browser + device label for the active-sessions list. Previously both
// the `browser` and `deviceName` columns stored the same raw UA string (#732).

export interface ParsedUserAgent {
  browser: string; // e.g. "Chrome", "Safari"
  device: string;  // e.g. "Windows", "iPhone", "Android"
}

export function parseUserAgent(ua: string | undefined | null): ParsedUserAgent {
  if (!ua) return { browser: 'Unknown browser', device: 'Unknown device' };

  // Order matters: Edge/Opera/Chrome share tokens, so test the more specific ones first.
  let browser = 'Unknown browser';
  if (/\bEdg(e|A|iOS)?\//.test(ua)) browser = 'Edge';
  else if (/\bOPR\/|\bOpera\b/.test(ua)) browser = 'Opera';
  else if (/\bSamsungBrowser\//.test(ua)) browser = 'Samsung Internet';
  else if (/\bFirefox\/|\bFxiOS\//.test(ua)) browser = 'Firefox';
  else if (/\bChrome\/|\bCriOS\//.test(ua)) browser = 'Chrome';
  else if (/\bSafari\//.test(ua) && /\bVersion\//.test(ua)) browser = 'Safari';

  let device = 'Unknown device';
  if (/\biPhone\b/.test(ua)) device = 'iPhone';
  else if (/\biPad\b/.test(ua)) device = 'iPad';
  else if (/\bAndroid\b/.test(ua)) device = 'Android';
  else if (/\bWindows\b/.test(ua)) device = 'Windows';
  else if (/\bMac OS X\b|\bMacintosh\b/.test(ua)) device = 'macOS';
  else if (/\bLinux\b/.test(ua)) device = 'Linux';

  return { browser, device };
}

/** A single friendly label, e.g. "Chrome on Windows". */
export function describeUserAgent(ua: string | undefined | null): string {
  const { browser, device } = parseUserAgent(ua);
  return `${browser} on ${device}`;
}
