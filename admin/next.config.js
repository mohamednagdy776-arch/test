/** @type {import('next').NextConfig} */
const nextConfig = {
  // Required for Docker multi-stage build — produces standalone server.js
  output: 'standalone',
  images: {
    domains: ['localhost'],
  },
};

module.exports = nextConfig;
