#!/usr/bin/env node

/**
 * Production Readiness Check Script
 * Validates environment, dependencies, and build requirements
 */

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

const REQUIRED_ENV_VARS = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'LIVEKIT_API_KEY',
  'LIVEKIT_API_SECRET',
  'NEXT_PUBLIC_LIVEKIT_WS_URL'
]

const OPTIONAL_ENV_VARS = [
  'DATABASE_URL',
  'DIRECT_URL',
  'GOOGLE_SITE_VERIFICATION'
]

function checkEnvironment() {
  console.log('🔍 Checking environment variables...')
  
  const missing = []
  const warnings = []
  
  REQUIRED_ENV_VARS.forEach(envVar => {
    if (!process.env[envVar]) {
      missing.push(envVar)
    }
  })
  
  OPTIONAL_ENV_VARS.forEach(envVar => {
    if (!process.env[envVar]) {
      warnings.push(envVar)
    }
  })
  
  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:')
    missing.forEach(envVar => console.error(`   - ${envVar}`))
    return false
  }
  
  if (warnings.length > 0) {
    console.warn('⚠️  Optional environment variables not set:')
    warnings.forEach(envVar => console.warn(`   - ${envVar}`))
  }
  
  console.log('✅ Environment variables check passed')
  return true
}

function checkFiles() {
  console.log('🔍 Checking required files...')
  
  const requiredFiles = [
    'package.json',
    'next.config.mjs',
    'tailwind.config.ts',
    'tsconfig.json',
    '.env.example'
  ]
  
  const missing = requiredFiles.filter(file => !fs.existsSync(file))
  
  if (missing.length > 0) {
    console.error('❌ Missing required files:')
    missing.forEach(file => console.error(`   - ${file}`))
    return false
  }
  
  console.log('✅ Required files check passed')
  return true
}

function checkDependencies() {
  console.log('🔍 Checking dependencies...')
  
  try {
    execSync('pnpm audit --audit-level moderate', { stdio: 'pipe' })
    console.log('✅ No moderate or high security vulnerabilities found')
  } catch (error) {
    console.warn('⚠️  Security vulnerabilities detected. Run `pnpm audit` for details.')
  }
  
  return true
}

function runTypeCheck() {
  console.log('🔍 Running TypeScript check...')
  
  try {
    execSync('pnpm run typecheck', { stdio: 'pipe' })
    console.log('✅ TypeScript check passed')
    return true
  } catch (error) {
    console.error('❌ TypeScript errors found. Run `pnpm run typecheck` for details.')
    return false
  }
}

function runLinting() {
  console.log('🔍 Running linting check...')
  
  try {
    execSync('pnpm run lint', { stdio: 'pipe' })
    console.log('✅ Linting check passed')
    return true
  } catch (error) {
    console.warn('⚠️  Linting issues found. Run `pnpm run lint` for details.')
    return true // Non-blocking for production
  }
}

function runTests() {
  console.log('🔍 Running tests...')
  
  try {
    execSync('pnpm run test:ci', { stdio: 'pipe' })
    console.log('✅ All tests passed')
    return true
  } catch (error) {
    console.error('❌ Tests failed. Run `pnpm run test` for details.')
    return false
  }
}

function runBuild() {
  console.log('🔍 Testing production build...')
  
  try {
    execSync('pnpm run build', { stdio: 'pipe' })
    console.log('✅ Production build successful')
    return true
  } catch (error) {
    console.error('❌ Production build failed. Run `pnpm run build` for details.')
    return false
  }
}

function generateReport(results) {
  console.log('\n📊 Production Readiness Report')
  console.log('================================')
  
  const passed = results.filter(r => r.passed).length
  const total = results.length
  
  results.forEach(result => {
    const icon = result.passed ? '✅' : '❌'
    const status = result.passed ? 'PASS' : 'FAIL'
    console.log(`${icon} ${result.name}: ${status}`)
  })
  
  console.log(`\nOverall: ${passed}/${total} checks passed`)
  
  if (passed === total) {
    console.log('🎉 Application is ready for production!')
    return true
  } else {
    console.log('⚠️  Please address the failing checks before deploying.')
    return false
  }
}

function main() {
  console.log('🚀 ECE Agent Production Readiness Check\n')
  
  const checks = [
    { name: 'Environment Variables', fn: checkEnvironment },
    { name: 'Required Files', fn: checkFiles },
    { name: 'Dependencies Security', fn: checkDependencies },
    { name: 'TypeScript', fn: runTypeCheck },
    { name: 'Linting', fn: runLinting },
    { name: 'Tests', fn: runTests },
    { name: 'Production Build', fn: runBuild }
  ]
  
  const results = checks.map(check => ({
    name: check.name,
    passed: check.fn()
  }))
  
  const success = generateReport(results)
  process.exit(success ? 0 : 1)
}

if (require.main === module) {
  main()
}

module.exports = { checkEnvironment, checkFiles, runTypeCheck, runTests, runBuild }
