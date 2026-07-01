'use client';

import { useEffect, useState } from 'react';

/**
 * The app's public origin for share / referral links.
 *
 * `NEXT_PUBLIC_APP_URL` is unset in the deployed build, so links previously fell
 * back to the hard-coded `https://tayyibt.com`, which is unreachable — breaking
 * affiliate and share links (#41/#42/#67). Resolve the real runtime origin on the
 * client instead, so links always point at the domain the user is actually on.
 *
 * Returned as a hook (not a bare `window.location.origin` read) so the first
 * render matches the SSR/env fallback and only updates after mount — avoiding a
 * hydration mismatch.
 */
function envFallback(): string {
  const env = process.env.NEXT_PUBLIC_APP_URL;
  return (env && env.replace(/\/+$/, '')) || 'https://145-14-158-100.sslip.io';
}

export function useAppOrigin(): string {
  const [origin, setOrigin] = useState(envFallback);
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location?.origin) {
      setOrigin(window.location.origin.replace(/\/+$/, ''));
    }
  }, []);
  return origin;
}
