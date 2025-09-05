import nextJest from 'next/jest'

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  testEnvironment: 'jsdom',
  // Load polyfills and env defaults before the test framework and any modules
  setupFiles: ['<rootDir>/jest.polyfills.ts'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    // Ensure '@/types/*' resolves to 'src/types/*' to match tsconfig paths
    '^@/types/(.*)$': '<rootDir>/src/types/$1',
    '^@/(.*)$': '<rootDir>/$1',
    '^react-markdown$': '<rootDir>/__tests__/mocks/react-markdown.tsx',
    '^react-resizable-panels$': '<rootDir>/__tests__/mocks/react-resizable-panels.tsx',
    '^react-syntax-highlighter$': '<rootDir>/__tests__/mocks/react-syntax-highlighter.tsx',
    '^react-syntax-highlighter/dist/esm/styles/prism$': '<rootDir>/__tests__/mocks/prism-styles.ts',
  },
  // Only run files with .test.ts(x) in __tests__ directories; ignore support files
  testMatch: ['**/__tests__/**/*.test.[jt]s?(x)'],
  // Transform ignore patterns: allow transpiling ESM in node_modules if needed later
  transformIgnorePatterns: [
    '/node_modules/(?!(react-markdown|rehype-raw|hast-util-raw|react-resizable-panels|msw)/)'
  ],
}

export default createJestConfig(customJestConfig)

