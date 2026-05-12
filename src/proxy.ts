import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const getSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is missing');
  }
  return new TextEncoder().encode(secret);
};

const JWT_SECRET = getSecret();

export async function proxy(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;
  const { pathname } = request.nextUrl;

  // Protect dashboard and secure APIs
  const isProtectedRoute = pathname.startsWith('/dashboard') || 
                           pathname.startsWith('/api/extract') || 
                           pathname.startsWith('/api/tickets') ||
                           pathname.startsWith('/api/users');
  const isLoginRoute = pathname === '/login';

  // If already authenticated and trying to access login page
  if (token && isLoginRoute) {
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);
      const role = (payload.role as string).toLowerCase();
      return NextResponse.redirect(new URL(`/dashboard/${role}`, request.url));
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
      if (pathname.startsWith('/api/users') && role !== 'ADMIN') {
        return NextResponse.json({ error: 'Forbidden: Admins only' }, { status: 403 });
      }

      // View Restrictions
      if (pathname.startsWith('/dashboard/employee') && role !== 'EMPLOYEE') {
        const dest = role === 'ADMIN' ? 'admin' : 'reviewer';
        return NextResponse.redirect(new URL(`/dashboard/${dest}`, request.url));
      }
      if (pathname.startsWith('/dashboard/reviewer') && role !== 'REVIEWER') {
        const dest = role === 'ADMIN' ? 'admin' : 'employee';
        return NextResponse.redirect(new URL(`/dashboard/${dest}`, request.url));
      }
      if (pathname.startsWith('/dashboard/admin') && role !== 'ADMIN') {
        const dest = role === 'EMPLOYEE' ? 'employee' : 'reviewer';
        return NextResponse.redirect(new URL(`/dashboard/${dest}`, request.url));
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
  matcher: ['/dashboard/:path*', '/api/extract/:path*', '/api/tickets/:path*', '/api/users/:path*', '/login'],
};
