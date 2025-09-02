#!/usr/bin/env tsx

import { TransformationRecorder } from '../libs/observability/TransformationRecorder';
import { RecorderConfig } from '../src/types/agent-observability';
import { execSync } from 'child_process';
import { readFileSync } from 'fs';

/**
 * CLI script to record transformations in the patch/batch workflow
 * Usage: npm run record-transformation -- --patch=18 --files="file1.ts,file2.tsx"
 */

async function main() {
  const args = process.argv.slice(2);
  const patchId = parseInt(args.find(arg => arg.startsWith('--patch='))?.split('=')[1] || '0');
  const filesArg = args.find(arg => arg.startsWith('--files='))?.split('=')[1];
  const files = filesArg ? filesArg.split(',') : [];
  const summary = args.find(arg => arg.startsWith('--summary='))?.split('=')[1] || 'Automated transformation';
  const decision = args.find(arg => arg.startsWith('--decision='))?.split('=')[1] as any || 'proceed';

  if (!patchId || files.length === 0) {
    console.error('Usage: npm run record-transformation -- --patch=N --files="file1.ts,file2.tsx" [--summary="description"] [--decision=proceed]');
    process.exit(1);
  }

  // Get current git branch
  const branch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8' }).trim();
  
  // Get author from git config
  const authorEmail = execSync('git config user.email', { encoding: 'utf8' }).trim();
  const authorId = `git:${authorEmail}`;

  // Initialize recorder with default config
  const config: RecorderConfig = {
    enableFileSystemSink: true,
    enableSupabaseSink: false,
    enableCoreProtection: true,
    redactPatterns: ['.env*', '*secret*', '*key*', '*token*'],
    protectedPaths: [
      'src/types/{agent,conversation,credits,user-tiers}.ts',
      'prisma/schema.prisma',
      'middleware.ts',
      'app/api/auth/**',
      'components/ui/**',
      'next.config.js',
      'tailwind.config.js',
      'tsconfig*.json',
      '.github/workflows/**',
      'lib/supabase/**',
    ],
    learningPaths: [
      'docs/patches/**',
      'docs/batches/**',
      'data/learning/**',
      'config/adaptive/**',
      'lib/learning/**',
    ],
  };

  const recorder = new TransformationRecorder(config);

  try {
    console.log(`🔍 Starting transformation recording for patch ${patchId}...`);
    
    // Start transformation
    const transformationId = await recorder.start({
      patchId,
      branch,
      authorId,
      filesTouched: files,
    });

    console.log(`📝 Transformation started: ${transformationId}`);

    // Record some example events
    await recorder.attachEvent({
      name: 'cli_transformation_started',
      timestamp: new Date().toISOString(),
      severity: 'info',
      payload: { patchId, files, branch },
      category: 'system',
    });

    // Simulate tool calls for file modifications
    for (const file of files) {
      await recorder.attachToolCall({
        id: `edit-${file}-${Date.now()}`,
        name: 'Edit',
        timestamp: new Date().toISOString(),
        parameters: { file_path: file },
        duration: Math.random() * 1000 + 500, // Random duration 500-1500ms
        coreProtectionCheck: false,
      });
    }

    console.log(`⚡ Running guardrails and finalizing...`);

    // Finalize transformation
    const record = await recorder.finalize(summary, decision);

    console.log(`✅ Transformation recorded successfully!`);
    console.log(`📊 Guardrails run: ${record.guardrails.length}`);
    console.log(`🎯 Decision: ${record.decision}`);
    console.log(`🔒 Core integrity: ${record.coreIntegrityVerified ? '✅ VERIFIED' : '❌ COMPROMISED'}`);
    console.log(`📁 Consequences written to: docs/patches/patch-${patchId}/CONSEQUENCES.md`);
    console.log(`📋 Ledger entry added to: docs/patches/patch-${patchId}/ledger.jsonl`);

    if (record.learningInsights && record.learningInsights.length > 0) {
      console.log(`🧠 Learning insights generated: ${record.learningInsights.length}`);
      record.learningInsights.forEach(insight => console.log(`   • ${insight}`));
    }

  } catch (error) {
    console.error(`❌ Transformation recording failed:`, error);
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch(console.error);
}
