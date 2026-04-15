import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || '',
  output: 'standalone', // For ECS Docker deploy (node server.js)
  reactStrictMode: true,

  // Tree-shake large icon/animation packages: only the symbols actually imported
  // are included in the production bundle.
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion'],
  },

  // Serve images as WebP for smaller payloads; keep existing remote hostnames.
  images: {
    formats: ['image/webp'],
    remotePatterns: [
      { protocol: 'https', hostname: 'randomuser.me' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'i.pravatar.cc' },
    ],
  },

  // Enable gzip/brotli compression on the Node server response.
  compress: true,
};

export default nextConfig;

