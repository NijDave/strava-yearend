/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    optimizePackageImports: ['recharts', 'react-leaflet', 'leaflet'],
  },
}

module.exports = nextConfig

