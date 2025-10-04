
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('auth_token')?.value;

  const user = token ? {
    role: token.split(':')[0],
    username: token.split(':')[1]
  } : null;

  // If user is not logged in, redirect any protected route to /login
  if (!user && (pathname.startsWith('/app') || pathname.startsWith('/admin'))) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (user) {
    // If a logged-in user tries to access the login page, redirect them to their dashboard
    if (pathname === '/login') {
      const url = request.nextUrl.clone();
      url.pathname = user.role === 'admin' ? '/admin/dashboard' : '/app/dashboard';
      return NextResponse.redirect(url);
    }

    // If an admin tries to access a user route, redirect to admin dashboard
    if (user.role === 'admin' && pathname.startsWith('/app')) {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    }
    
    // If a regular user tries to access an admin route, redirect to user dashboard
    if (user.role !== 'admin' && pathname.startsWith('/admin')) {
      return NextResponse.redirect(new URL('/app/dashboard', request.url));
    }
  }

  // Redirect root to login or dashboard
  if (pathname === '/') {
    const url = request.nextUrl.clone();
    url.pathname = user ? (user.role === 'admin' ? '/admin/dashboard' : '/app/dashboard') : '/login';
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
