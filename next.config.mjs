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
  // Ensure CSS is correctly extracted so the loader doesn't error about missing plugin
  webpack: (config, { isServer }) => {
    if (!isServer) {
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
}

export default nextConfig
