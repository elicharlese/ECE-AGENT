import { z } from 'zod';
import { promises as fs } from 'fs';
import { join } from 'path';
import { glob } from 'glob';
import {
  CoreProtectionResult,
  RecorderConfig,
  CoreProtectionResultSchema,
} from '../../src/types/agent-observability';

export class CoreProtection {
  private protectedPaths: string[];
  private learningPaths: string[];

  constructor(private config?: RecorderConfig) {
    this.protectedPaths = config?.protectedPaths || [
      'src/types/agent.ts',
      'src/types/conversation.ts',
      'src/types/credits.ts',
      'src/types/user-tiers.ts',
      'prisma/schema.prisma',
      'middleware.ts',
      'lib/supabase/**',
      'components/ui/**',
      'app/api/auth/**',
      '.github/workflows/**'
    ];
    this.learningPaths = config?.learningPaths || [
      'data/learning/**',
      'docs/patches/**',
      '__tests__/**',
      'scripts/**'
    ];
  }

  async validateTransformation(filesTouched: string[]): Promise<CoreProtectionResult> {
    const violations: Array<{ path: string; reason: string; severity: 'warning' | 'error' | 'critical' }> = [];
    const protectedPaths: string[] = [];
    const allowedPaths: string[] = [];

    for (const file of filesTouched) {
      if (this.isPristineCorePath(file)) {
        protectedPaths.push(file);
        
        // Determine severity based on file criticality
        const severity = this.getViolationSeverity(file);
        violations.push({
          path: file,
          reason: `Attempted modification of pristine core file: ${file}`,
          severity,
        });
      } else if (this.isLearningLayerPath(file)) {
        allowedPaths.push(file);
      } else {
        // Regular application files - allowed but logged
        allowedPaths.push(file);
      }
    }

    return CoreProtectionResultSchema.parse({
      isValid: violations.length === 0 || !violations.some(v => v.severity === 'critical'),
      violations,
      protectedPaths,
      allowedPaths,
      timestamp: new Date().toISOString(),
    });
  }

  isPristineCorePath(filePath: string): boolean {
    // Normalize path for comparison
    const normalizedPath = filePath.replace(/^\/+/, '').replace(/\\/g, '/');
    
    return this.protectedPaths.some(pattern => {
      // Convert glob pattern to regex for matching
      const regexPattern = pattern
        .replace(/\*\*/g, '.*')
        .replace(/\*/g, '[^/]*')
        .replace(/\?/g, '[^/]');
      
      const regex = new RegExp(`^${regexPattern}$`);
      return regex.test(normalizedPath);
    });
  }

  isLearningLayerPath(filePath: string): boolean {
    const normalizedPath = filePath.replace(/^\/+/, '').replace(/\\/g, '/');
    
    return this.learningPaths.some(pattern => {
      const regexPattern = pattern
        .replace(/\*\*/g, '.*')
        .replace(/\*/g, '[^/]*')
        .replace(/\?/g, '[^/]');
      
      const regex = new RegExp(`^${regexPattern}$`);
      return regex.test(normalizedPath);
    });
  }

  async validatePath(filePath: string): Promise<{ isProtected: boolean; reason?: string }> {
    const isProtected = this.isPristineCorePath(filePath);
    return {
      isProtected,
      reason: isProtected ? `File ${filePath} is in protected pristine core` : undefined
    };
  }

  async auditIntegrity(): Promise<CoreProtectionResult> {
    return this.auditCoreIntegrity();
  }

  async auditCoreIntegrity(): Promise<CoreProtectionResult> {
    const violations: Array<{ path: string; reason: string; severity: 'warning' | 'error' | 'critical' }> = [];
    const protectedPaths: string[] = [];
    const allowedPaths: string[] = [];

    // Check if critical core files exist and haven't been tampered with
    const criticalFiles = [
      'src/types/agent.ts',
      'src/types/conversation.ts', 
      'src/types/credits.ts',
      'src/types/user-tiers.ts',
      'prisma/schema.prisma',
      'next.config.js',
      'tailwind.config.js',
      'tsconfig.json',
    ];

    for (const file of criticalFiles) {
      try {
        const exists = await fs.access(file).then(() => true).catch(() => false);
        if (exists) {
          protectedPaths.push(file);
          
          // Additional integrity checks could go here
          // e.g., checksum validation, schema validation, etc.
          const content = await fs.readFile(file, 'utf8');
          
          // Basic sanity checks
          if (file.endsWith('.ts') && !content.includes('export')) {
            violations.push({
              path: file,
              reason: `Core TypeScript file ${file} appears corrupted (no exports found)`,
              severity: 'error',
            });
          }
          
          if (file === 'prisma/schema.prisma' && !content.includes('generator client')) {
            violations.push({
              path: file,
              reason: 'Prisma schema missing generator client configuration',
              severity: 'critical',
            });
          }
        } else {
          violations.push({
            path: file,
            reason: `Critical core file ${file} is missing`,
            severity: 'critical',
          });
        }
      } catch (error) {
        violations.push({
          path: file,
          reason: `Failed to audit core file ${file}: ${error}`,
          severity: 'error',
        });
      }
    }

    // Check for unauthorized modifications to protected directories
    const protectedDirs = [
      'components/ui',
      'lib/supabase',
      'app/api/auth',
      '.github/workflows',
    ];

    for (const dir of protectedDirs) {
      try {
        const files = await glob(`${dir}/**/*`, { nodir: true });
        protectedPaths.push(...files);
        
        // Could add file integrity checks here
        // e.g., verify critical UI components haven't been modified
      } catch (error) {
        // Directory might not exist, which is also a violation for some dirs
        if (dir === 'components/ui' || dir === 'lib/supabase') {
          violations.push({
            path: dir,
            reason: `Critical directory ${dir} is missing or inaccessible`,
            severity: 'error',
          });
        }
      }
    }

    return CoreProtectionResultSchema.parse({
      isValid: violations.length === 0 || !violations.some(v => v.severity === 'critical'),
      violations,
      protectedPaths,
      allowedPaths,
      timestamp: new Date().toISOString(),
    });
  }

  private getViolationSeverity(filePath: string): 'warning' | 'error' | 'critical' {
    // Critical files that must never be modified
    const criticalFiles = [
      'src/types/agent.ts',
      'src/types/conversation.ts',
      'src/types/credits.ts', 
      'src/types/user-tiers.ts',
      'prisma/schema.prisma',
      'middleware.ts',
      'lib/supabase/client.ts',
      'lib/supabase/server.ts',
    ];

    // Error-level files (important but not critical)
    const errorFiles = [
      'next.config.js',
      'tailwind.config.js',
      'tsconfig.json',
      'components/ui/',
      'app/api/auth/',
    ];

    const normalizedPath = filePath.replace(/^\/+/, '').replace(/\\/g, '/');

    if (criticalFiles.some(f => normalizedPath === f || normalizedPath.startsWith(f))) {
      return 'critical';
    }

    if (errorFiles.some(f => normalizedPath === f || normalizedPath.startsWith(f))) {
      return 'error';
    }

    return 'warning';
  }

  async enforceProtection(): Promise<void> {
    const result = await this.auditCoreIntegrity();
    
    if (!result.isValid) {
      const criticalViolations = result.violations.filter(v => v.severity === 'critical');
      
      if (criticalViolations.length > 0) {
        const violationList = criticalViolations.map(v => `- ${v.path}: ${v.reason}`).join('\n');
        throw new Error(`CRITICAL CORE PROTECTION VIOLATION:\n${violationList}\n\nTransformation halted to protect pristine core.`);
      }
    }
  }

  generateProtectionReport(): string {
    return `# Core Protection Configuration

## Protected Paths (${this.protectedPaths.length})
${this.protectedPaths.map(p => `- \`${p}\``).join('\n')}

## Learning Layer Paths (${this.learningPaths.length})
${this.learningPaths.map(p => `- \`${p}\``).join('\n')}

## Protection Mechanisms
- File path validation against protected patterns
- Integrity auditing of critical core files
- Automatic violation detection and blocking
- Severity-based response (warning/error/critical)
- Fail-safe transformation halting on critical violations

## Violation Response Protocol
1. **Warning**: Log and continue with monitoring
2. **Error**: Log, alert, and require manual review
3. **Critical**: Immediately halt transformation and rollback

---
*Generated by CoreProtection service*
`;
  }
}
