// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth as nextAuthMiddleware } from "@/auth";

// Single middleware that does your rewrite, then delegates to NextAuth.
export async function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();
  const host = req.headers.get("host") ?? "";

  // Subdomain -> /t/:tenant/frontdesk rewrite
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

  // Delegate to NextAuth v5 middleware for auth protection
  return nextAuthMiddleware(req);
}

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
