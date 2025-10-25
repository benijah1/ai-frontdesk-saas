export { default } from "next-auth/middleware";
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/leads/:path*",
    "/calls/:path*",
    "/settings/:path*",
    "/crm/:path*",
  ],
};
