import withPWA from 'next-pwa'
import runtimeCaching from 'next-pwa/cache.js'

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  images: { unoptimized: true },
}

const withPWANext = withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  runtimeCaching,
  fallbacks: {
    document: '/offline', // offline fallback route
  },
})

export default withPWANext(nextConfig)
