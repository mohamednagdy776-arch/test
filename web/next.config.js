/** @type {import('next').NextConfig} */

// Derive the allowed image host from the API URL instead of hardcoding the VPS
// IP (#26), and pin the image optimizer to that exact host instead of a
// wildcard `**.sslip.io` — the wildcard let the optimizer be pointed at any
// sslip-encoded IP (e.g. 169-254-169-254.sslip.io), an SSRF vector (#100).
const apiHost = (() => {
  try {
    return new URL(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000').hostname;
  } catch {
    return 'localhost';
  }
})();

// Backend origin for the dev proxy rewrite below.
const devApiOrigin = (() => {
  try {
    const u = new URL(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1');
    return u.origin !== 'null' ? u.origin : 'http://localhost:3000';
  } catch {
    return 'http://localhost:3000';
  }
})();

const nextConfig = {
  output: 'standalone',
  // In development the Next.js dev server and the NestJS backend run on
  // different ports. Without this rewrite every /api/v1/* and /uploads/*
  // request from the browser (including <img> src values) hits the Next.js
  // server and 404s. In production nginx handles the proxying, so the
  // rewrite list is empty.
  async rewrites() {
    if (process.env.NODE_ENV === 'production') return [];
    return [
      { source: '/api/v1/:path*', destination: `${devApiOrigin}/api/v1/:path*` },
      { source: '/uploads/:path*', destination: `${devApiOrigin}/uploads/:path*` },
    ];
  },
  images: {
    // The app is deployed behind nginx with NEXT_PUBLIC_API_URL set to a
    // relative path (/api/v1), and uploaded media is served by the backend at
    // /uploads. The Next.js image optimizer can't reach those (apiHost collapses
    // to localhost → it 400s every /_next/image request for backend media), which
    // broke every avatar, chat image and video thumbnail rendered via next/image.
    // Disable optimization so <Image> emits a plain <img>; the relative /uploads
    // src then resolves against the public origin → nginx → backend (200).
    unoptimized: true,
    domains: ['localhost', apiHost, 'images.unsplash.com'],
    remotePatterns: [
      { protocol: 'https', hostname: apiHost },
    ],
  },
  transpilePackages: ['@phosphor-icons/react'],
};
module.exports = nextConfig;
