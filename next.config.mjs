/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: ['*'],
    },
  },
  async redirects() {
    return [
      { source: '/', destination: '/dashboard', permanent: false },
    ];
  },
};

export default nextConfig;
