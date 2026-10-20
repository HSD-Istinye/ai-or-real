import type { NextConfig } from 'next';
const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Allows a production check while a local dev server uses .next.
  distDir: process.env.NEXT_BUILD_DIR || '.next',
  images: { unoptimized: true },
};
export default nextConfig;
