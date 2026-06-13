/** @type {import('next').NextConfig} */
const nextConfig = {
  // Required for Docker multi-stage build — produces standalone server.js
  output: 'standalone',
  // Admin is served under the /admin/ sub-path behind nginx. basePath makes
  // Next.js prefix all routes, links and _next asset URLs with /admin so they
  // resolve to the admin container instead of falling through to the web app.
  basePath: '/admin',
  assetPrefix: '/admin',
  images: {
    domains: [
      'localhost',
      '145-14-158-100.sslip.io',
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.sslip.io',
      },
    ],
  },
};

module.exports = nextConfig;
