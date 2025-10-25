// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth as nextAuth } from "next-auth/middleware"; // Edge-safe

// Single middleware: first do your rewrite, then delegate to NextAuth on protected routes
export default async function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();
  const host = req.headers.get("host") ?? "";

  // --- Subdomain -> tenant path rewrite for /frontdesk
  const parts = host.split(".");
  const isLocal =
    host.startsWith("localhost") ||
    host.startsWith("127.0.0.1") ||
    host.endsWith(".local");

  if (!isLocal && parts.length > 2) {
    const sub = parts[0];
    if (url.pathname === "/frontdesk") {
      url.pathname = `/t/${sub}/frontdesk`;
      return NextResponse.rewrite(url);
    }
  }

  // --- Auth guard (Edge-compatible). Require a session (JWT) on matched routes.
  return nextAuth(req, {
    callbacks: {
      authorized: ({ token }) => !!token, // block if no session
    },
  });
}

// Only the routes below will run this middleware (rewrite + auth)
export const config = {
  matcher: [
    "/frontdesk",
    "/t/:path*",
    "/dashboard/:path*",
    "/crm/:path*",
    "/calls/:path*",
    "/settings/:path*",
    "/setup/:path*",
    "/(app)/(app)/:path*",
  ],
};
