export { default } from "next-auth/middleware";
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/crm/:path*",
    "/calls/:path*",
    "/settings/:path*",
    "/crm/:path*",
  ],
};
