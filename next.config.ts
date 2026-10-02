import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
  // better-sqlite3 native (C++) bir modül — webpack paketlemesin, Node doğrudan yüklesin
  serverExternalPackages: ['better-sqlite3'],
};

export default nextConfig;
