/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: { domains: ['localhost'] },
  transpilePackages: ['@phosphor-icons/react'],
};
module.exports = nextConfig;
