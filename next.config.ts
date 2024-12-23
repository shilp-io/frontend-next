import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true
  },
  output: 'export',
  skipTrailingSlashRedirect: true,
  distDir: '.next'
};

export default nextConfig;
