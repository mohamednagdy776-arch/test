# ISSUE-020: profile images use raw img tag bypassing nextjs domain validation

| Field | Value |
|-------|-------|
| **Severity** | Medium |
| **Route / Page** | `/profile`, `/profile/[id]` |
| **Type** | Security |
| **Component** | `ProfileHeader` |
| **File** | `web/src/features/profile/components/ProfileHeader.tsx:85,127` |
| **Status** | Open |

## Full location
- web/src/features/profile/components/ProfileHeader.tsx
- Cover photo `<img>` — line 85
- Avatar `<img>` — line 127

## Description
Cover and avatar images are rendered with plain `<img>` tags using a URL derived directly from the API response, with only a minimal check (`url.startsWith('http')`). Any absolute URL from the server is accepted and rendered without domain validation.

If the API were compromised, or if a stored `avatarUrl`/`coverUrl` contains a URL pointing to an attacker-controlled server, the browser would:
- Load an external tracking pixel, leaking the user's IP to a third-party.
- Render a `data:` URI payload.
- Be exposed to image-based exploits.

Using Next.js `<Image>` with a configured `domains` or `remotePatterns` allowlist in `next.config.js` would block all images except those from expected origins, and also provides automatic optimisation and lazy loading.

## Failure details
```tsx
// ProfileHeader.tsx lines 16-19 — passes through any absolute URL unchecked
const mediaUrl = (url: string | null | undefined) => {
  if (!url) return null;
  return url.startsWith('http') ? url : `${BACKEND_ORIGIN}${url}`;
};

// Line 85 — raw <img> with server-supplied URL
<img src={mediaUrl(profile.coverUrl)!} alt="cover" className="..." />

// Line 127 — raw <img> with server-supplied URL
<img src={mediaUrl(profile.avatarUrl)!} alt="avatar" className="..." />
```

## Expected behaviour
Images from the server should only be loaded from expected domains. Use Next.js `<Image>` component:

1. In `next.config.js` add:
```js
images: {
  remotePatterns: [
    { protocol: 'https', hostname: '145-14-158-100.sslip.io' },
    { protocol: 'http',  hostname: 'localhost' },
  ],
},
```

2. Replace `<img>` with `<Image>` from `next/image`:
```tsx
import Image from 'next/image';

<Image
  src={mediaUrl(profile.coverUrl)!}
  alt="cover"
  fill
  className="object-cover"
/>
```

> Code-review finding — not yet fixed.
