import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    // Force clean builds
    turbo: {
      rules: {
        '*.css': {
          loaders: ['css-loader'],
          as: '*.css',
        },
      },
    },
  },
  // Disable build cache for deployment
  generateBuildId: async () => {
    return `build-${Date.now()}`;
  },
};

export default nextConfig;
