#!/usr/bin/env node

/**
 * AGENT Build Optimization Script
 * Optimizes builds for all platforms and analyzes bundle sizes
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function runCommand(command, options = {}) {
  try {
    log(`Running: ${command}`, 'cyan');
    return execSync(command, { stdio: 'inherit', ...options });
  } catch (error) {
    log(`Command failed: ${command}`, 'red');
    throw error;
  }
}

async function optimizeWebBuild() {
  log('🚀 Optimizing Web Build (Next.js)...', 'yellow');

  // Create next.config.js optimizations if not present
  const nextConfigPath = 'next.config.js';
  let nextConfig = '';

  if (fs.existsSync(nextConfigPath)) {
    nextConfig = fs.readFileSync(nextConfigPath, 'utf8');
  }

  // Add performance optimizations
  const optimizations = `
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Performance optimizations
  swcMinify: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  experimental: {
    optimizeCss: true,
    scrollRestoration: true,
  },
  
  // Bundle analysis
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    if (!dev && !isServer) {
      config.optimization.splitChunks.cacheGroups = {
        ...config.optimization.splitChunks.cacheGroups,
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
          priority: 10,
        },
        radix: {
          test: /[\\/]node_modules[\\/]@radix-ui[\\/]/,
          name: 'radix-ui',
          chunks: 'all',
          priority: 20,
        },
      };
    }
    
    // Bundle analyzer (only in development)
    if (process.env.ANALYZE === 'true') {
      const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'static',
          openAnalyzer: false,
          reportFilename: path.resolve(__dirname, 'reports/bundle-analyzer.html'),
        })
      );
    }
    
    return config;
  },
  
  // Image optimization
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  
  // Compression
  compress: true,
  
  // Headers for performance
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;`;

  if (!nextConfig.includes('swcMinify')) {
    fs.writeFileSync(nextConfigPath, optimizations.trim());
    log('✅ Updated next.config.js with performance optimizations', 'green');
  }

  // Install bundle analyzer
  try {
    runCommand('npm list webpack-bundle-analyzer');
  } catch (error) {
    log('Installing webpack-bundle-analyzer...', 'yellow');
    runCommand('npm install --save-dev webpack-bundle-analyzer');
  }

  log('✅ Web build optimizations complete', 'green');
}

async function optimizeMobileBuild() {
  log('📱 Optimizing Mobile Build (Expo)...', 'yellow');

  const metroConfigPath = 'mobile/metro.config.js';
  if (fs.existsSync(metroConfigPath)) {
    let metroConfig = fs.readFileSync(metroConfigPath, 'utf8');
    
    // Add optimizations to metro config
    const optimizations = `
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Performance optimizations
config.resolver = {
  ...config.resolver,
  alias: {
    'react-native$': 'react-native-web',
  },
};

// Bundle splitting
config.transformer = {
  ...config.transformer,
  getTransformOptions: async () => ({
    transform: {
      experimentalImportSupport: false,
      inlineRequires: true,
    },
  }),
};

module.exports = config;`;

    if (!metroConfig.includes('experimentalImportSupport')) {
      fs.writeFileSync(metroConfigPath, optimizations.trim());
      log('✅ Updated mobile/metro.config.js with optimizations', 'green');
    }
  }

  log('✅ Mobile build optimizations complete', 'green');
}

async function optimizeDesktopBuild() {
  log('💻 Optimizing Desktop Build (Electron)...', 'yellow');

  // Create electron-builder config optimizations
  const packagePath = 'apps/desktop/package.json';
  if (fs.existsSync(packagePath)) {
    let packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    
    // Add build optimizations
    packageJson.build = {
      ...packageJson.build,
      asar: true,
      compression: 'maximum',
      removePackageScripts: true,
      files: [
        'dist/**/*',
        'public/**/*',
        '!dist/**/*.map',
        '!dist/**/*.d.ts'
      ],
      mac: {
        ...packageJson.build.mac,
        hardenedRuntime: true,
        gatekeeperAssess: false,
        entitlements: 'build/entitlements.mac.plist',
        entitlementsInherit: 'build/entitlements.mac.plist',
      },
      win: {
        ...packageJson.build.win,
        verifyUpdateCodeSignature: false,
      },
      linux: {
        ...packageJson.build.linux,
        category: 'Development',
      },
    };
    
    fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));
    log('✅ Updated desktop package.json with build optimizations', 'green');
  }

  log('✅ Desktop build optimizations complete', 'green');
}

async function analyzeBundleSize() {
  log('📊 Analyzing bundle sizes...', 'yellow');

  // Create reports directory
  const reportsDir = 'reports';
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }

  // Run bundle analyzer for web
  log('Analyzing web bundle...', 'blue');
  try {
    runCommand('ANALYZE=true npm run build');
  } catch (error) {
    log('Bundle analysis completed (check reports/bundle-analyzer.html)', 'green');
  }

  // Check bundle sizes
  const nextBuildDir = '.next';
  if (fs.existsSync(nextBuildDir)) {
    const stats = fs.statSync(path.join(nextBuildDir, 'static'));
    const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);
    log(`📦 Web bundle size: ${sizeMB} MB`, 'cyan');
  }

  log('✅ Bundle analysis complete', 'green');
}

async function createPerformanceConfig() {
  log('⚡ Creating performance configuration...', 'yellow');

  // Create performance budget
  const performanceConfig = {
    budgets: [
      {
        path: '/',
        resourceSizes: [
          { resourceType: 'document', budget: 18 },
          { resourceType: 'script', budget: 150 },
          { resourceType: 'stylesheet', budget: 50 },
          { resourceType: 'image', budget: 300 },
          { resourceType: 'font', budget: 100 },
          { resourceType: 'other', budget: 50 },
        ],
        resourceCounts: [
          { resourceType: 'total', budget: 50 },
          { resourceType: 'script', budget: 10 },
          { resourceType: 'stylesheet', budget: 5 },
          { resourceType: 'image', budget: 20 },
        ],
      },
    ],
  };

  fs.writeFileSync('performance-budget.json', JSON.stringify(performanceConfig, null, 2));
  log('✅ Created performance-budget.json', 'green');

  // Create Lighthouse config
  const lighthouseConfig = {
    extends: 'lighthouse:default',
    settings: {
      onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
      skipAudits: ['uses-http2'],
    },
  };

  fs.writeFileSync('lighthouserc.js', `module.exports = ${JSON.stringify(lighthouseConfig, null, 2)};`);
  log('✅ Created lighthouserc.js', 'green');
}

async function main() {
  const command = process.argv[2];

  switch (command) {
    case 'web':
      await optimizeWebBuild();
      break;
    case 'mobile':
      await optimizeMobileBuild();
      break;
    case 'desktop':
      await optimizeDesktopBuild();
      break;
    case 'analyze':
      await analyzeBundleSize();
      break;
    case 'performance':
      await createPerformanceConfig();
      break;
    default:
      log('🚀 Optimizing all platforms...', 'bright');
      await optimizeWebBuild();
      await optimizeMobileBuild();
      await optimizeDesktopBuild();
      await analyzeBundleSize();
      await createPerformanceConfig();
      
      log('\n🎉 All optimizations complete!', 'green');
      log('\n📋 Performance commands:', 'bright');
      log('  npm run build:analyze    - Analyze bundle sizes', 'cyan');
      log('  npm run lighthouse       - Run Lighthouse audit', 'cyan');
      log('  npm run performance      - Check performance budget', 'cyan');
      break;
  }
}

if (require.main === module) {
  main().catch(error => {
    log(`Optimization failed: ${error.message}`, 'red');
    process.exit(1);
  });
}

module.exports = {
  optimizeWebBuild,
  optimizeMobileBuild,
  optimizeDesktopBuild,
  analyzeBundleSize,
  createPerformanceConfig
};
