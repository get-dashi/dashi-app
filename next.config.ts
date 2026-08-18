import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // /v2 root → /
      { source: '/v2', destination: '/', permanent: true },
      // /v2/* → /* (covers all sub-routes)
      { source: '/v2/:path*', destination: '/:path*', permanent: true },
      // /adventures → /plans (old main-app plans tab)
      { source: '/adventures', destination: '/plans', permanent: true },
      { source: '/adventures/:path*', destination: '/plans/:path*', permanent: true },
    ]
  },
  allowedDevOrigins: ['192.168.1.66'],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'maps.googleapis.com' },
      { protocol: 'https', hostname: '*.supabase.co' },
    ],
  },
}

export default nextConfig
