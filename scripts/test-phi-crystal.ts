#!/usr/bin/env tsx

/**
 * Test script for the Phi Crystal Architecture
 * Tests all components of the self-observation system
 */

import { TransformationRecorder } from '../libs/observability/TransformationRecorder'
import { CoreProtection } from '../libs/observability/CoreProtection'
import { AdaptiveLearningService } from '../data/learning/AdaptiveLearningService'
import { writeFileSync, mkdirSync, existsSync } from 'fs'
import { join } from 'path'

// Test colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
}

function log(color: keyof typeof colors, message: string) {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

async function testPhiCrystalArchitecture() {
  log('cyan', '\n🔮 Testing Phi Crystal Architecture Components\n')
  
  let passed = 0
  let failed = 0
  
  // Test 1: 💎 Blockchain Crystal (Core Protection)
  log('blue', '💎 Testing Blockchain Crystal (Core Protection)...')
  try {
    const coreProtection = new CoreProtection()
    
    // Test protected file detection
    const protectedResult = await coreProtection.validatePath('src/types/agent.ts')
    if (protectedResult.isProtected) {
      log('green', '  ✅ Protected file correctly identified')
      passed++
    } else {
      log('red', '  ❌ Protected file not identified')
      failed++
    }
    
    // Test non-protected file
    const nonProtectedResult = await coreProtection.validatePath('test-file.ts')
    if (!nonProtectedResult.isProtected) {
      log('green', '  ✅ Non-protected file correctly identified')
      passed++
    } else {
      log('red', '  ❌ Non-protected file incorrectly flagged')
      failed++
    }
    
    // Test integrity audit
    const auditResult = await coreProtection.auditIntegrity()
    if (auditResult.isValid) {
      log('green', '  ✅ Core integrity audit completed')
      passed++
    } else {
      log('red', '  ❌ Core integrity audit failed')
      failed++
    }
    
  } catch (error) {
    log('red', `  ❌ Core Protection test failed: ${error}`)
    failed++
  }
  
  // Test 2: ❄️ Oort Cloud Nodes (Adaptive Learning)
  log('blue', '\n❄️ Testing Oort Cloud Nodes (Adaptive Learning)...')
  try {
    const learningService = new AdaptiveLearningService()
    
    // Test strategy storage and retrieval
    const testStrategy = {
      id: 'test-strategy-1',
      name: 'Test File Modification Strategy',
      category: 'code_generation' as const,
      pattern: 'test-pattern',
      confidence: 0.8,
      successRate: 0.9,
      usageCount: 5,
      lastUsed: new Date().toISOString(),
      metadata: { test: true }
    }
    
    await learningService.recordStrategy(testStrategy)
    log('green', '  ✅ Strategy recorded successfully')
    passed++
    
    const strategies = await learningService.getStrategies('file_modification')
    if (strategies.length > 0) {
      log('green', '  ✅ Strategies retrieved successfully')
      passed++
    } else {
      log('red', '  ❌ No strategies retrieved')
      failed++
    }
    
  } catch (error) {
    log('red', `  ❌ Adaptive Learning test failed: ${error}`)
    failed++
  }
  
  // Test 3: 🌊 Quantum Waves (Transformation Recording)
  log('blue', '\n🌊 Testing Quantum Waves (Transformation Recording)...')
  try {
    const testDir = join(process.cwd(), 'test-transformation')
    if (!existsSync(testDir)) {
      mkdirSync(testDir, { recursive: true })
    }
    
    const recorder = new TransformationRecorder({
      enableFileSystemSink: true,
      enableSupabaseSink: false,
      enableCoreProtection: true,
      redactPatterns: [],
      protectedPaths: [],
      learningPaths: []
    })
    
    // Start transformation
    const transformationId = await recorder.start({
      patchId: 999,
      branch: 'test-branch',
      authorId: 'test-script',
      filesTouched: ['test-file.ts']
    })
    
    if (transformationId) {
      log('green', '  ✅ Transformation started successfully')
      passed++
    } else {
      log('red', '  ❌ Failed to start transformation')
      failed++
    }
    
    // Record a tool call
    await recorder.attachToolCall({
      id: 'test-tool-call-1',
      name: 'test_tool',
      parameters: { test: 'parameter' },
      timestamp: new Date().toISOString(),
      duration: 1000,
      coreProtectionCheck: true,
      result: { success: true }
    })
    log('green', '  ✅ Tool call recorded')
    passed++
    
    // Finalize transformation
    await recorder.finalize('Test completed successfully', 'proceed')
    log('green', '  ✅ Transformation finalized')
    passed++
    
  } catch (error) {
    log('red', `  ❌ Transformation Recording test failed: ${error}`)
    failed++
  }
  
  // Test 4: ⚡ Intelligence Rivers (Data Flow)
  log('blue', '\n⚡ Testing Intelligence Rivers (Data Flow)...')
  try {
    // Test that files exist and are accessible
    const observabilityTypes = join(process.cwd(), 'src/types/agent-observability.ts')
    const recorderFile = join(process.cwd(), 'libs/observability/TransformationRecorder.ts')
    const protectionFile = join(process.cwd(), 'libs/observability/CoreProtection.ts')
    const learningFile = join(process.cwd(), 'data/learning/AdaptiveLearningService.ts')
    
    const files = [observabilityTypes, recorderFile, protectionFile, learningFile]
    let filesExist = 0
    
    for (const file of files) {
      if (existsSync(file)) {
        filesExist++
      }
    }
    
    if (filesExist === files.length) {
      log('green', '  ✅ All core architecture files exist')
      passed++
    } else {
      log('red', `  ❌ Missing ${files.length - filesExist} architecture files`)
      failed++
    }
    
    // Test API endpoints exist
    const apiFiles = [
      'app/api/observability/transformations/route.ts',
      'app/api/observability/learning/route.ts'
    ]
    
    let apiFilesExist = 0
    for (const file of apiFiles) {
      if (existsSync(join(process.cwd(), file))) {
        apiFilesExist++
      }
    }
    
    if (apiFilesExist === apiFiles.length) {
      log('green', '  ✅ All API endpoints exist')
      passed++
    } else {
      log('red', `  ❌ Missing ${apiFiles.length - apiFilesExist} API endpoints`)
      failed++
    }
    
  } catch (error) {
    log('red', `  ❌ Intelligence Rivers test failed: ${error}`)
    failed++
  }
  
  // Test 5: 🌟 Frequency Halo (CI/CD Integration)
  log('blue', '\n🌟 Testing Frequency Halo (CI/CD Integration)...')
  try {
    const ciFile = join(process.cwd(), '.github/workflows/agent-observability.yml')
    const scriptFile = join(process.cwd(), 'scripts/record-transformation.ts')
    const checklistFile = join(process.cwd(), 'docs/development/PRISTINE_CORE_CHECKLIST.md')
    
    const systemFiles = [ciFile, scriptFile, checklistFile]
    let systemFilesExist = 0
    
    for (const file of systemFiles) {
      if (existsSync(file)) {
        systemFilesExist++
      }
    }
    
    if (systemFilesExist === systemFiles.length) {
      log('green', '  ✅ All CI/CD and system files exist')
      passed++
    } else {
      log('red', `  ❌ Missing ${systemFiles.length - systemFilesExist} system files`)
      failed++
    }
    
  } catch (error) {
    log('red', `  ❌ Frequency Halo test failed: ${error}`)
    failed++
  }
  
  // Summary
  log('cyan', '\n🔮 Phi Crystal Architecture Test Results')
  log('cyan', '=' .repeat(50))
  log('green', `✅ Passed: ${passed}`)
  log('red', `❌ Failed: ${failed}`)
  log('cyan', `📊 Success Rate: ${Math.round((passed / (passed + failed)) * 100)}%`)
  
  if (failed === 0) {
    log('green', '\n🎉 All Phi Crystal components are functioning correctly!')
    log('cyan', '\n🌟 The architecture is ready:')
    log('cyan', '   💎 Blockchain Crystal (Core) - PROTECTED')
    log('cyan', '   🌊 Quantum Waves (Processing) - ACTIVE') 
    log('cyan', '   ❄️ Oort Cloud Nodes (Learning) - EVOLVING')
    log('cyan', '   ⚡ Intelligence Rivers (Flow) - STREAMING')
    log('cyan', '   🌟 Frequency Halo (Coherence) - HARMONIZED')
  } else {
    log('yellow', '\n⚠️  Some components need attention')
    log('cyan', 'Review the failed tests above for details.')
  }
  
  return { passed, failed, successRate: Math.round((passed / (passed + failed)) * 100) }
}

// Run the test if this script is executed directly
if (require.main === module) {
  testPhiCrystalArchitecture()
    .then((results) => {
      process.exit(results.failed > 0 ? 1 : 0)
    })
    .catch((error) => {
      log('red', `Fatal error: ${error}`)
      process.exit(1)
    })
}

export { testPhiCrystalArchitecture }
