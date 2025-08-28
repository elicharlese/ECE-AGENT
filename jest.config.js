const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  testEnvironment: 'jsdom',
  setupFiles: ['<rootDir>/jest.polyfills.ts'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    // Mocks for ESM-only packages used in components to avoid Jest ESM parse errors
    '^react-markdown$': '<rootDir>/__mocks__/react-markdown.tsx',
    '^react-syntax-highlighter$': '<rootDir>/__mocks__/react-syntax-highlighter.tsx',
    '^react-syntax-highlighter/dist/esm/styles/prism$': '<rootDir>/__mocks__/rhs-styles-prism.ts',
  },
  testPathIgnorePatterns: [
    '<rootDir>/.next/',
    '<rootDir>/node_modules/',
    '<rootDir>/__tests__/msw/',
    '<rootDir>/tests/e2e/',
  ],
}

module.exports = createJestConfig(customJestConfig)
