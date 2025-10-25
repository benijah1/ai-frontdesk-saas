// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  // If a signed-in user hits the public home ("/"), send them to the app dashboard.
  if (pathname === '/' && token) {
    const url = req.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  // Protect app routes for unauthenticated users.
  const isProtected =
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/crm') ||
    pathname.startsWith('/calls') ||
    pathname.startsWith('/settings');

  if (isProtected && !token) {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('callbackUrl', req.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/dashboard/:path*', '/crm/:path*', '/calls/:path*', '/settings/:path*'],
};
