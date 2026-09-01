import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

// Server-side route protection. Auth tokens live in an HttpOnly `access_token`
// cookie (set by the backend on login), so middleware can read it here and
// redirect unauthenticated requests to protected pages BEFORE any protected
// content is sent. Client-side AuthGuard remains as a second layer.
// Security fix: Validate JWT token signature and expiration using jose library to prevent token forgery.

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

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProtected = PROTECTED_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(p + '/'),
  );
  if (!isProtected) return NextResponse.next();

  const token = request.cookies.get('access_token')?.value;
  if (!token) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || '');
    await jwtVerify(token, secret);
  } catch (err) {
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
