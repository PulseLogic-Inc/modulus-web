import type { NextConfig } from 'next'

const config: NextConfig = {
  eslint: {
    // Linting runs as a separate CI step, not during builds
    ignoreDuringBuilds: true,
  },
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000'],
    },
  },
}

export default config
