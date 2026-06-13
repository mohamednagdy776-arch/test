import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Server-side route protection. Auth tokens live in an HttpOnly `access_token`
// cookie (set by the backend on login), so middleware can read it here and
// redirect unauthenticated requests to protected pages BEFORE any protected
// content is sent. Client-side AuthGuard remains as a second layer.

const PROTECTED_PREFIXES = [
  '/dashboard',
  '/matching',
  '/search',
  '/groups',
  '/chat',
  '/friends',
  '/pages',
  '/events',
  '/memories',
  '/watch',
  '/profile',
  '/settings',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProtected = PROTECTED_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(p + '/'),
  );
  if (!isProtected) return NextResponse.next();

  const hasToken = Boolean(request.cookies.get('access_token')?.value);
  if (!hasToken) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
