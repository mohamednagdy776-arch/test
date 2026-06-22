// Resolve any stored media URL to one that loads on the *current* deployment.
//
// Stored values are inconsistent across environments and seed data:
//   - "/uploads/123.jpg"                         (relative, current scheme)
//   - "/api/v1/media/posts/123.jpg?t=abc"        (relative, token-protected)
//   - "http://localhost:3000/uploads/123.jpg"    (absolute dev/seed URL — breaks in prod)
//   - "https://images.unsplash.com/..."          (legitimate external CDN)
//
// The bug this fixes: components did `url.startsWith('http') ? url : base + url`,
// so absolute localhost URLs from dev/seed data were used verbatim and failed
// with ERR_CONNECTION_REFUSED in production. Here we strip dev/localhost hosts
// and re-anchor app-relative media on the API origin, while leaving genuine
// external URLs untouched.

// Fall back to the same default as apiClient so dev without .env.local still
// resolves /api/v1/media/... to the backend instead of the Next.js dev server.
const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1').replace(/\/api\/v1\/?$/, '');

// Hosts that only ever make sense on a developer machine.
const DEV_HOST = /^https?:\/\/(localhost|127\.0\.0\.1|0\.0\.0\.0)(:\d+)?/i;

export function resolveMediaUrl(url?: string | null): string | null {
  if (!url) return null;
  if (url.startsWith('data:') || url.startsWith('blob:')) return url;

  // Drop a dev/localhost origin so the path resolves on the deployed host.
  let s = url.replace(DEV_HOST, '');

  // A real external/CDN absolute URL (e.g. Unsplash) — leave it alone.
  if (/^https?:\/\//i.test(s)) return s;

  if (!s.startsWith('/')) s = `/${s}`;
  return API_BASE ? `${API_BASE}${s}` : s; // empty API_BASE → same-origin relative
}
