
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const protectedUserRoutes = ['/app', '/app/workflows', '/app/tasks', '/app/profile', '/app/files'];
const protectedAdminRoutes = ['/admin'];
const publicRoutes = ['/login'];

const getUserFromToken = (token: string) => {
  try {
    const [role, username] = token.split(':');
    if (!role || !username) return null;
    return { role, username };
  } catch (error) {
    return null;
  }
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('auth_token')?.value;
  const user = token ? getUserFromToken(token) : null;

  const isProtectedRoute = 
    protectedUserRoutes.some(p => pathname.startsWith(p)) || 
    protectedAdminRoutes.some(p => pathname.startsWith(p));
  
  const isAdminRoute = protectedAdminRoutes.some(p => pathname.startsWith(p));

  // If user is not logged in and tries to access any protected route, redirect to login
  if (!user && isProtectedRoute) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('redirectedFrom', pathname);
    return NextResponse.redirect(url);
  }

  // If a logged-in user tries to access public routes like /login, redirect to their dashboard
  if (user && publicRoutes.some(p => pathname.startsWith(p))) {
    const dashboardUrl = user.role === 'admin' ? '/admin/dashboard' : '/app/dashboard';
    const url = request.nextUrl.clone();
    url.pathname = dashboardUrl;
    return NextResponse.redirect(url);
  }

  // If a regular user tries to access an admin route, redirect to user dashboard
  if (user && user.role !== 'admin' && isAdminRoute) {
    const url = request.nextUrl.clone();
    url.pathname = '/app/dashboard';
    return NextResponse.redirect(url);
  }
  
  // If an admin user is on a base user route, redirect them to the admin dashboard
  if (user && user.role === 'admin' && (pathname === '/app' || pathname === '/app/dashboard')) {
    const url = request.nextUrl.clone();
    url.pathname = '/admin/dashboard';
    return NextResponse.redirect(url);
  }

  // Redirect /app to /app/dashboard
  if (pathname === '/app') {
    const url = request.nextUrl.clone();
    url.pathname = '/app/dashboard';
    return NextResponse.redirect(url);
  }

  // Redirect /admin to /admin/dashboard
  if (pathname === '/admin') {
    const url = request.nextUrl.clone();
    url.pathname = '/admin/dashboard';
    return NextResponse.redirect(url);
  }

  // Redirect old /app/tasks path to the new dashboard tab
  if (pathname === '/app/tasks') {
    const url = request.nextUrl.clone();
    url.pathname = '/app/dashboard';
    url.searchParams.set('tab', 'my-tasks');
    return NextResponse.redirect(url);
  }

  // Redirect root path to the appropriate dashboard
  if (pathname === '/') {
    const url = request.nextUrl.clone();
    url.pathname = user ? (user.role === 'admin' ? '/admin/dashboard' : '/app/dashboard') : '/login';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
