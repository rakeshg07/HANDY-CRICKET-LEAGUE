import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@hcl/shared'],
  output: 'standalone',
  outputFileTracingRoot: require('path').join(__dirname, '..'),
};

export default nextConfig;
