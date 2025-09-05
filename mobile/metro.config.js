const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Monorepo configuration
config.watchFolders = [
  path.resolve(__dirname, '../libs'),
];

// Performance optimizations
config.resolver = {
  ...config.resolver,
  alias: {
    'react-native$': 'react-native-web',
  },
  extraNodeModules: {
    'libs': path.resolve(__dirname, '../libs'),
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

module.exports = config;
