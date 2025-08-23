import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    // TypeScript checking is now enabled
  },
  eslint: {
    // Temporarily disable ESLint checking during build
    ignoreDuringBuilds: true,
  },
  turbopack: {
    rules: {
      '*.css': {
        loaders: ['css-loader'],
        as: '*.css',
      },
    },
  },
  // Disable build cache for deployment
  generateBuildId: async () => {
    return `build-${Date.now()}`;
  },
  // Handle dynamic API routes properly
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, must-revalidate',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
