import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Ignore ESLint errors during `next build` so the build will not fail on lint issues.
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  }
};

export default nextConfig;
