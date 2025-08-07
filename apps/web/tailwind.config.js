const { createGlobPatternsForDependencies } = require('@nx/react/tailwind');
const { join } = require('path');

// Use CommonJS export for Tailwind config compatibility
module.exports = {
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
    // Include dependent libraries in the workspace
    ...createGlobPatternsForDependencies(join(__dirname, 'src')),
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
