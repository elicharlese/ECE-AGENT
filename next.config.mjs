/** @type {import('next').NextConfig} */
// Use Next's compiled mini-css-extract-plugin to match the loader instance
import MiniCssExtractPlugin from 'next/dist/compiled/mini-css-extract-plugin/cjs.js'

const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // SWC minification is enabled by default in Next.js 15
  // Optimize bundle splitting
  experimental: {
    // Disabling optimizeCss to avoid missing 'critters' module in Vercel build
    optimizeCss: false,
    // Disable optimizePackageImports in dev to avoid stale Webpack chunk errors like './80.js'
    optimizePackageImports:
      process.env.NODE_ENV === 'production'
        ? ['lucide-react', '@radix-ui/react-icons']
        : undefined,
  },
  // Enable strict mode for better performance
  reactStrictMode: true,
  // Compress output
  compress: true,
  // Optimize for production
  productionBrowserSourceMaps: false,
  // Ensure CSS is correctly extracted so the loader doesn't error about missing plugin
  webpack: (config, { isServer, dev }) => {
    // Only inject MiniCssExtractPlugin in production client builds.
    // In dev, forcing this plugin breaks Next's dev asset serving, causing 404s for chunks.
    if (!isServer && !dev) {
      const hasMiniCss = config.plugins?.some(
        (p) => p && p.constructor && p.constructor.name === 'MiniCssExtractPlugin'
      )
      if (!hasMiniCss) {
        config.plugins.push(
          new MiniCssExtractPlugin({
            filename: 'static/css/[contenthash].css',
            chunkFilename: 'static/css/[contenthash].css',
          })
        )
      }
    }
    return config
  },
  async rewrites() {
    return [
      // Serve a favicon to avoid 404s from browsers requesting /favicon.ico
      { source: '/favicon.ico', destination: '/agent-bot.svg' },
      // Nested: /u/:id -> /messages
      { source: '/u/:id([\\w-]+)', destination: '/messages' },
      // Nested passthrough: /u/:id/<path> -> /<path>
      { source: '/u/:id([\\w-]+)/:path*', destination: '/:path*' },
      // Compact: /u123 -> /messages
      { source: '/:compact(u[\\w-]+)', destination: '/messages' },
      // Compact passthrough: /u123/<path> -> /<path>
      { source: '/:compact(u[\\w-]+)/:path*', destination: '/:path*' },
    ]
  },
}

export default nextConfig


