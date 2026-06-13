import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Protected admin sections (added the previously-missing ones: notifications,
// subscriptions, affiliates, videos, comments, events, pages — #133).
const protectedPaths = [
  '/dashboard', '/users', '/matching', '/groups', '/posts', '/payments',
  '/reports', '/notifications', '/subscriptions', '/affiliates', '/videos',
  '/comments', '/events', '/pages',
];

// Read the role claim from the JWT WITHOUT verifying the signature. This is a
// UX gate so non-admins don't see the admin shell (#122); the backend still
// enforces real authorization on every API call. (Edge runtime: use atob.)
function roleFromToken(token: string | undefined): string | null {
  if (!token) return null;
  try {
    const part = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const json = JSON.parse(atob(part + '='.repeat((4 - (part.length % 4)) % 4)));
    return json.role ?? json.accountType ?? null;
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const token = request.cookies.get('access_token')?.value;
  const { pathname } = request.nextUrl;
  const role = roleFromToken(token);

  const isProtected = protectedPaths.some((p) => pathname === p || pathname.startsWith(p + '/'));

  if (isProtected) {
    // Require an admin token, not just any logged-in session.
    if (role !== 'admin') {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  if (pathname === '/login' && role === 'admin') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
