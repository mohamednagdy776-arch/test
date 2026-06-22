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

const nextConfig = {
  output: 'standalone',
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
