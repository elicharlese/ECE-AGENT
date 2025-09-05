const { createExpoWebpackConfigAsync } = require('@expo/webpack-config');
const path = require('path');

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(env, argv);

  // Ensure a single copy of React/React DOM/React Native is used
  config.resolve = config.resolve || {};
  config.resolve.alias = {
    ...(config.resolve.alias || {}),
    // Workspace library aliases
    '@ece-agent/shared-ui': path.resolve(__dirname, '../libs/shared-ui/src/index.ts'),
    '@ece-agent/shared-ui/native': path.resolve(__dirname, '../libs/shared-ui/src/native.ts'),
    // Single renderer/runtime copies
    react: path.resolve(__dirname, '../node_modules/react'),
    'react-dom': path.resolve(__dirname, '../node_modules/react-dom'),
    'react/jsx-runtime': path.resolve(__dirname, '../node_modules/react/jsx-runtime.js'),
    'react/jsx-dev-runtime': path.resolve(__dirname, '../node_modules/react/jsx-dev-runtime.js'),
    // IMPORTANT: Let Expo's default alias map `react-native` -> `react-native-web`.
    // Do NOT override `react-native` to the native package on web, as it causes hook/runtime mismatches.
    'react-native-web': path.resolve(__dirname, '../node_modules/react-native-web'),
    // Explicit end-of-string alias (in case defaults are changed) to guarantee RN -> RNW on web
    'react-native$': path.resolve(__dirname, '../node_modules/react-native-web'),
  };

  // Transpile our monorepo libraries for web
  config.module = config.module || {};
  config.module.rules = config.module.rules || [];
  config.module.rules.push({
    test: /\.[jt]sx?$/,
    include: [
      path.resolve(__dirname, 'src'),
      path.resolve(__dirname, '../libs'),
    ],
    use: {
      loader: 'babel-loader',
      options: {
        presets: ['babel-preset-expo'],
      },
    },
  });

  return config;
};
