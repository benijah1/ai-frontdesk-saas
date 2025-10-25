/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: { allowedOrigins: ['*'] },
  },
  // no redirects() here, we serve a real homepage at "/"
};
export default nextConfig;
