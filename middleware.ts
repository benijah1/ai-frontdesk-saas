import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";


export function middleware(req: NextRequest){
const url = req.nextUrl;
const host = req.headers.get("host")||"";


// Preserve existing NextAuth middleware via re-export pattern if needed.
// Add subdomain -> path rewrite for frontdesk.
const parts = host.split(".");
const isLocal = host.startsWith("localhost");
if(!isLocal && parts.length > 2){
const sub = parts[0];
// Rewrite /frontdesk on subdomain to tenant path route
if(url.pathname === "/frontdesk"){
url.pathname = `/t/${sub}/frontdesk`;
return NextResponse.rewrite(url);
}
}
return NextResponse.next();
}


export const config = {
matcher: [
"/frontdesk",
"/t/:path*",
"/dashboard/:path*",
"/crm/:path*",
"/calls/:path*",
"/settings/:path*",
],
};
