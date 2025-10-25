/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: ['*'],
    },
  },
  // No root redirect here; we serve a real homepage at "/"
};

export default nextConfig;
