#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up AGENT testing infrastructure...\n');

// Create test directories
const testDirs = [
  '__tests__/components',
  '__tests__/hooks',
  '__tests__/utils',
  '__tests__/integration',
  'tests/e2e'
];

testDirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`✅ Created: ${dir}`);
  }
});

// Create example test files
const componentTest = `import { render, screen } from '@testing-library/react';
import { Button } from '@/components/ui/button';

describe('Button Component', () => {
  it('renders with correct text', () => {
    render(<Button>Hello World</Button>);
    expect(screen.getByText('Hello World')).toBeInTheDocument();
  });
});`;

const e2eTest = `import { test, expect } from '@playwright/test';

test('homepage loads', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/AGENT/);
});`;

if (!fs.existsSync('__tests__/components/Button.test.tsx')) {
  fs.writeFileSync('__tests__/components/Button.test.tsx', componentTest);
  console.log('✅ Created: __tests__/components/Button.test.tsx');
}

if (!fs.existsSync('tests/e2e/homepage.spec.ts')) {
  fs.writeFileSync('tests/e2e/homepage.spec.ts', e2eTest);
  console.log('✅ Created: tests/e2e/homepage.spec.ts');
}

console.log('\n🎉 Testing infrastructure setup complete!');
console.log('\n📋 Available test commands:');
console.log('  npm test              - Run unit tests');
console.log('  npm run test:e2e      - Run E2E tests');
console.log('  npm run test:coverage - Run tests with coverage');
