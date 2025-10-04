
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('auth_token')?.value;

  const user = token ? {
    role: token.split(':')[0],
    username: token.split(':')[1]
  } : null;

  // Redirect root to login or dashboard
  if (pathname === '/') {
    const url = request.nextUrl.clone();
    url.pathname = user ? (user.role === 'admin' ? '/admin/dashboard' : '/app/dashboard') : '/login';
    return NextResponse.redirect(url);
  }

  // Protect admin routes
  if (pathname.startsWith('/admin')) {
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    if (user.role !== 'admin') {
      return NextResponse.redirect(new URL('/app/dashboard', request.url));
    }
  }
  
  // Protect app routes
  if (pathname.startsWith('/app')) {
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
     if (user.role === 'admin') {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    }
  }

  // Redirect logged-in users away from login page
  if (pathname === '/login' && user) {
     const url = request.nextUrl.clone();
     url.pathname = user.role === 'admin' ? '/admin/dashboard' : '/app/dashboard';
     return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
