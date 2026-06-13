import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// NOTE: Auth tokens are stored in localStorage (browser-only) and are not
// accessible to server-side middleware. Route protection for authenticated
// pages is handled client-side by the AuthGuard component
// (web/src/components/auth/AuthGuard.tsx).
//
// This middleware is retained as a lightweight layer that can be extended in
// the future (e.g. once cookie-based auth is implemented). For now it simply
// allows all requests to pass through.

export function middleware(_request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
