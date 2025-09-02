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

module.exports = nextConfig
