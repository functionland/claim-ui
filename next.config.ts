import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  eslint: {
    ignoreDuringBuilds: true, // This will ignore ESLint errors during builds
  },
  images: {
    domains: [
      'raw.githubusercontent.com',
      'github.com',
    ],
    remotePatterns: [
      {
        hostname: '**',
      },
    ],
    unoptimized: true,
    loader: 'custom',
    path: 'https://claim-ui.fula.network/images',
  },
  experimental: {
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },
}

export default nextConfig
