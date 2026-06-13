/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    domains: [
      'localhost',
      '145-14-158-100.sslip.io',
      'images.unsplash.com',
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.sslip.io',
      },
    ],
  },
  transpilePackages: ['@phosphor-icons/react'],
};
module.exports = nextConfig;
