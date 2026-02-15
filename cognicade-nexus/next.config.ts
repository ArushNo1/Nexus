
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // cacheComponents: true, // This is not a valid Next.js config option.
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  }
};

export default nextConfig;
