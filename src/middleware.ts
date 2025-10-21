import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(req: NextRequest) {
  // For now we allow any slug under `/u/[slug]` and rely on app routes to 404 if unknown
  return NextResponse.next()
}

export const config = {
  matcher: ["/u/:path*"],
}
