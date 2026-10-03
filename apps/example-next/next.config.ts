import type { NextConfig } from 'next';

// The kit ships pre-built ESM (dist) with a 'use client' banner, so no transpilePackages needed.
const nextConfig: NextConfig = {
  reactStrictMode: true,
};

export default nextConfig;
