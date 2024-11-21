import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { routeConfigs } from '@/config/routes';

export function middleware(request: NextRequest) {
  const authToken = request.cookies.get('auth-token')?.value;
  const userRole = request.cookies.get('user-role')?.value;
  
  const path = request.nextUrl.pathname;
  const route = routeConfigs.find(route => route.path === path);
  
  if (!route) return NextResponse.next();
  
  // Allow public routes
  if (route.access === 'public') return NextResponse.next();
  
  // Redirect to login if no auth token
  if (!authToken) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', path);
    return NextResponse.redirect(loginUrl);
  }
  
  // Check admin access
  if (route.access === 'admin' && userRole !== 'admin') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
};