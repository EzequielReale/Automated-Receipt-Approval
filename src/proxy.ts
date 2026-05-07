import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'super-secret-key-for-demo');

export async function proxy(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;
  const { pathname } = request.nextUrl;

  // Protect dashboard and secure APIs
  const isProtectedRoute = pathname.startsWith('/dashboard') || pathname.startsWith('/api/extract') || pathname.startsWith('/api/tickets');
  const isLoginRoute = pathname === '/login';

  // If already authenticated and trying to access login page
  if (token && isLoginRoute) {
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);
      const role = payload.role as string;
      return NextResponse.redirect(new URL(`/dashboard/${role.toLowerCase()}`, request.url));
    } catch {
      // Invalid token, ignore and let them access login
    }
  }

  // If no token and trying to access protected routes
  if (!token && isProtectedRoute) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // If token exists, verify and check roles for protected routes
  if (token && isProtectedRoute) {
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);
      const role = payload.role as string;

      // API Restrictions
      if (pathname.startsWith('/api/extract') && role !== 'EMPLOYEE') {
        return NextResponse.json({ error: 'Forbidden: Employees only' }, { status: 403 });
      }

      // View Restrictions
      if (pathname.startsWith('/dashboard/employee') && role !== 'EMPLOYEE') {
        return NextResponse.redirect(new URL('/dashboard/reviewer', request.url));
      }
      if (pathname.startsWith('/dashboard/reviewer') && role !== 'REVIEWER') {
        return NextResponse.redirect(new URL('/dashboard/employee', request.url));
      }
      
      // Base dashboard redirect
      if (pathname === '/dashboard') {
        return NextResponse.redirect(new URL(`/dashboard/${role.toLowerCase()}`, request.url));
      }

    } catch {
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('auth_token');
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/api/extract/:path*', '/api/tickets/:path*', '/login'],
};
