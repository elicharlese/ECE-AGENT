/** @type {import('next').NextConfig} */
const nextConfig = {
  // Use SWC minifier (recommended by Next.js)
  swcMinify: true,
  webpack: (config) => {
    // Fix deep imports expecting deprecated zod/lib path
    config.resolve = config.resolve || {}
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      'zod/lib': 'zod',
      'zod/lib/index.mjs': 'zod',
    }
    return config
  },
}

// Security headers for production
const securityHeaders = [
  {
    key: 'X-Frame-Options',
    value: 'DENY'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin'
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()'
  }
]

module.exports = {
  ...nextConfig,
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ]
  },
}
