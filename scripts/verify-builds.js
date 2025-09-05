#!/usr/bin/env node

/**
 * AGENT Build Verification Script
 * Verifies builds across all platforms
 */

const { execSync, spawn } = require('child_process');
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
    const result = execSync(command, { stdio: 'pipe', ...options });
    return result.toString();
  } catch (error) {
    log(`Command failed: ${command}`, 'red');
    log(error.stderr?.toString() || error.message, 'red');
    throw error;
  }
}

async function verifyWebBuild() {
  log('🌐 Verifying Web Build (Next.js)...', 'yellow');

  try {
    // Clean previous build
    if (fs.existsSync('.next')) {
      runCommand('rm -rf .next');
    }

    // Build the application
    log('Building Next.js application...', 'blue');
    runCommand('npm run build');

    // Verify build artifacts
    const buildExists = fs.existsSync('.next');
    const staticExists = fs.existsSync('.next/static');
    const pagesExist = fs.existsSync('.next/server/app');

    if (buildExists && staticExists && pagesExist) {
      log('✅ Web build artifacts verified', 'green');
      
      // Check bundle sizes
      const stats = fs.statSync('.next');
      const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);
      log(`📦 Build size: ${sizeMB} MB`, 'cyan');
      
      return true;
    } else {
      log('❌ Web build verification failed - missing artifacts', 'red');
      return false;
    }
    
  } catch (error) {
    log('❌ Web build verification failed', 'red');
    return false;
  }
}

async function verifyMobileBuild() {
  log('📱 Verifying Mobile Build (Expo)...', 'yellow');

  try {
    const mobileDir = 'mobile';
    
    if (!fs.existsSync(mobileDir)) {
      log('❌ Mobile directory not found', 'red');
      return false;
    }

    // Check if Expo CLI is available
    try {
      runCommand('npx expo --version');
    } catch (error) {
      log('❌ Expo CLI not available', 'red');
      return false;
    }

    // Verify mobile configuration
    const appConfigExists = fs.existsSync(path.join(mobileDir, 'app.config.ts'));
    const packageExists = fs.existsSync(path.join(mobileDir, 'package.json'));
    
    if (appConfigExists && packageExists) {
      log('✅ Mobile configuration verified', 'green');
      return true;
    } else {
      log('❌ Mobile configuration incomplete', 'red');
      return false;
    }
    
  } catch (error) {
    log('❌ Mobile build verification failed', 'red');
    return false;
  }
}

async function verifyDesktopBuild() {
  log('💻 Verifying Desktop Build (Electron)...', 'yellow');

  try {
    const desktopDir = 'apps/desktop';
    
    if (!fs.existsSync(desktopDir)) {
      log('❌ Desktop directory not found', 'red');
      return false;
    }

    // Check Electron availability
    try {
      runCommand('npx electron --version');
    } catch (error) {
      log('❌ Electron not available', 'red');
      return false;
    }

    // Verify desktop configuration
    const packageExists = fs.existsSync(path.join(desktopDir, 'package.json'));
    const srcExists = fs.existsSync(path.join(desktopDir, 'src'));
    
    if (packageExists && srcExists) {
      log('✅ Desktop configuration verified', 'green');
      return true;
    } else {
      log('❌ Desktop configuration incomplete', 'red');
      return false;
    }
    
  } catch (error) {
    log('❌ Desktop build verification failed', 'red');
    return false;
  }
}

async function runQualityChecks() {
  log('🔍 Running Quality Checks...', 'yellow');

  const results = {
    lint: false,
    typecheck: false,
    test: false,
    build: false
  };

  try {
    // Run linting
    log('Running ESLint...', 'blue');
    runCommand('npm run lint');
    results.lint = true;
    log('✅ Linting passed', 'green');
  } catch (error) {
    log('❌ Linting failed', 'red');
  }

  try {
    // Run type checking
    log('Running TypeScript check...', 'blue');
    runCommand('npm run typecheck');
    results.typecheck = true;
    log('✅ Type checking passed', 'green');
  } catch (error) {
    log('❌ Type checking failed', 'red');
  }

  try {
    // Run tests
    log('Running unit tests...', 'blue');
    runCommand('npm run test:ci');
    results.test = true;
    log('✅ Tests passed', 'green');
  } catch (error) {
    log('❌ Tests failed', 'red');
  }

  try {
    // Run build
    log('Running production build...', 'blue');
    runCommand('npm run build');
    results.build = true;
    log('✅ Build passed', 'green');
  } catch (error) {
    log('❌ Build failed', 'red');
  }

  return results;
}

async function generateReport(results) {
  log('📊 Generating Verification Report...', 'yellow');

  const report = {
    timestamp: new Date().toISOString(),
    platforms: {
      web: await verifyWebBuild(),
      mobile: await verifyMobileBuild(),
      desktop: await verifyDesktopBuild()
    },
    quality: await runQualityChecks(),
    summary: {
      totalChecks: 7,
      passedChecks: 0,
      failedChecks: 0
    }
  };

  // Calculate summary
  const allResults = [
    ...Object.values(report.platforms),
    ...Object.values(report.quality)
  ];
  
  report.summary.passedChecks = allResults.filter(Boolean).length;
  report.summary.failedChecks = allResults.length - report.summary.passedChecks;

  // Save report
  const reportsDir = 'reports';
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }

  fs.writeFileSync(
    path.join(reportsDir, 'build-verification.json'),
    JSON.stringify(report, null, 2)
  );

  // Display results
  log('\n📋 VERIFICATION RESULTS:', 'bright');
  log('='.repeat(50), 'bright');
  
  log(`🌐 Web Platform: ${report.platforms.web ? '✅ PASS' : '❌ FAIL'}`, 
      report.platforms.web ? 'green' : 'red');
  log(`📱 Mobile Platform: ${report.platforms.mobile ? '✅ PASS' : '❌ FAIL'}`, 
      report.platforms.mobile ? 'green' : 'red');
  log(`💻 Desktop Platform: ${report.platforms.desktop ? '✅ PASS' : '❌ FAIL'}`, 
      report.platforms.desktop ? 'green' : 'red');
  
  log(`\n🔍 Quality Checks:`, 'bright');
  log(`Linting: ${report.quality.lint ? '✅ PASS' : '❌ FAIL'}`, 
      report.quality.lint ? 'green' : 'red');
  log(`Type Check: ${report.quality.typecheck ? '✅ PASS' : '❌ FAIL'}`, 
      report.quality.typecheck ? 'green' : 'red');
  log(`Unit Tests: ${report.quality.test ? '✅ PASS' : '❌ FAIL'}`, 
      report.quality.test ? 'green' : 'red');
  log(`Build: ${report.quality.build ? '✅ PASS' : '❌ FAIL'}`, 
      report.quality.build ? 'green' : 'red');

  log(`\n📊 SUMMARY:`, 'bright');
  log(`Total Checks: ${report.summary.totalChecks}`, 'cyan');
  log(`Passed: ${report.summary.passedChecks}`, 'green');
  log(`Failed: ${report.summary.failedChecks}`, 'red');
  
  const successRate = ((report.summary.passedChecks / report.summary.totalChecks) * 100).toFixed(1);
  log(`Success Rate: ${successRate}%`, 
      successRate === '100.0' ? 'green' : successRate >= '75.0' ? 'yellow' : 'red');

  if (report.summary.failedChecks === 0) {
    log('\n🎉 ALL CHECKS PASSED! Ready for deployment.', 'green');
  } else {
    log('\n⚠️  Some checks failed. Please review and fix issues before deployment.', 'yellow');
  }

  return report;
}

async function main() {
  const command = process.argv[2];

  switch (command) {
    case 'web':
      await verifyWebBuild();
      break;
    case 'mobile':
      await verifyMobileBuild();
      break;
    case 'desktop':
      await verifyDesktopBuild();
      break;
    case 'quality':
      await runQualityChecks();
      break;
    case 'report':
      await generateReport({});
      break;
    default:
      log('🔍 Running complete build verification...', 'bright');
      const report = await generateReport({});
      
      log('\n📋 VERIFICATION COMPLETE', 'bright');
      log('Report saved to: reports/build-verification.json', 'cyan');
      break;
  }
}

if (require.main === module) {
  main().catch(error => {
    log(`Verification failed: ${error.message}`, 'red');
    process.exit(1);
  });
}

module.exports = {
  verifyWebBuild,
  verifyMobileBuild,
  verifyDesktopBuild,
  runQualityChecks,
  generateReport
};
