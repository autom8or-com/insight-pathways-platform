import { NextRequest, NextResponse } from 'next/server';
import { auth } from './lib/auth';
import { canAccessRoute } from './lib/types/auth';
import { headers } from 'next/headers';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public routes that don't require authentication
  const publicRoutes = [
    '/',
    '/sign-in',
    '/sign-up',
    '/api/auth',
  ];

  // Check if the route is public
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Get the session
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  // If no session, redirect to sign-in
  if (!session?.user) {
    const signInUrl = new URL('/sign-in', request.url);
    signInUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(signInUrl);
  }

  // Check role-based access for dashboard routes
  if (pathname.startsWith('/dashboard')) {
    const userRole = session.user.role as any;
    
    // Check if user can access the specific route
    if (!canAccessRoute(userRole, pathname)) {
      // Redirect to appropriate dashboard based on role
      const redirectMap: Record<string, string> = {
        admin: '/dashboard/admin',
        manager: '/dashboard/manager',
        executive: '/dashboard/executive',
        respondent: '/dashboard/respondent',
      };
      
      const redirectUrl = redirectMap[userRole] || '/dashboard';
      return NextResponse.redirect(new URL(redirectUrl, request.url));
    }
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
     * - public (public files)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
};