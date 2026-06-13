/** @type {import('next').NextConfig} */

// Allowed image host derived from the API URL (no hardcoded VPS IP, #26) and
// the optimizer pinned to that exact host (no `**.sslip.io` wildcard SSRF, #100).
const apiHost = (() => {
  try {
    return new URL(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000').hostname;
  } catch {
    return 'localhost';
  }
})();

const nextConfig = {
  // Required for Docker multi-stage build — produces standalone server.js
  output: 'standalone',
  // Admin is served under the /admin/ sub-path behind nginx. basePath makes
  // Next.js prefix all routes, links and _next asset URLs with /admin so they
  // resolve to the admin container instead of falling through to the web app.
  basePath: '/admin',
  assetPrefix: '/admin',
  images: {
    domains: ['localhost', apiHost],
    remotePatterns: [
      { protocol: 'https', hostname: apiHost },
    ],
  },
};

module.exports = nextConfig;
