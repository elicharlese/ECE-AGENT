import { CoreProtection } from '../../libs/observability/CoreProtection';
import { RecorderConfig } from '../../src/types/agent-observability';

describe('CoreProtection', () => {
  let coreProtection: CoreProtection;
  let mockConfig: RecorderConfig;

  beforeEach(() => {
    mockConfig = {
      enableFileSystemSink: true,
      enableSupabaseSink: false,
      enableCoreProtection: true,
      redactPatterns: ['.env*', '*secret*'],
      protectedPaths: [
        'src/types/agent.ts',
        'src/types/conversation.ts',
        'prisma/schema.prisma',
        'middleware.ts',
        'components/ui/**',
        'lib/supabase/**',
      ],
      learningPaths: [
        'docs/patches/**',
        'data/learning/**',
      ],
    };
    coreProtection = new CoreProtection(mockConfig);
  });

  describe('isPristineCorePath', () => {
    it('should identify pristine core files correctly', () => {
      expect(coreProtection.isPristineCorePath('src/types/agent.ts')).toBe(true);
      expect(coreProtection.isPristineCorePath('src/types/conversation.ts')).toBe(true);
      expect(coreProtection.isPristineCorePath('prisma/schema.prisma')).toBe(true);
      expect(coreProtection.isPristineCorePath('middleware.ts')).toBe(true);
    });

    it('should identify protected directories with wildcards', () => {
      expect(coreProtection.isPristineCorePath('components/ui/button.tsx')).toBe(true);
      expect(coreProtection.isPristineCorePath('components/ui/dialog.tsx')).toBe(true);
      expect(coreProtection.isPristineCorePath('lib/supabase/client.ts')).toBe(true);
      expect(coreProtection.isPristineCorePath('lib/supabase/server.ts')).toBe(true);
    });

    it('should allow non-protected files', () => {
      expect(coreProtection.isPristineCorePath('components/chat/chat-window.tsx')).toBe(false);
      expect(coreProtection.isPristineCorePath('app/page.tsx')).toBe(false);
      expect(coreProtection.isPristineCorePath('lib/utils.ts')).toBe(false);
    });

    it('should handle path normalization', () => {
      expect(coreProtection.isPristineCorePath('/src/types/agent.ts')).toBe(true);
      expect(coreProtection.isPristineCorePath('./src/types/agent.ts')).toBe(false); // relative paths not normalized
      expect(coreProtection.isPristineCorePath('src\\types\\agent.ts')).toBe(true); // Windows paths
    });
  });

  describe('isLearningLayerPath', () => {
    it('should identify learning layer paths correctly', () => {
      expect(coreProtection.isLearningLayerPath('docs/patches/patch-1/CONSEQUENCES.md')).toBe(true);
      expect(coreProtection.isLearningLayerPath('docs/patches/patch-2/ledger.jsonl')).toBe(true);
      expect(coreProtection.isLearningLayerPath('data/learning/strategy-123.json')).toBe(true);
    });

    it('should reject non-learning paths', () => {
      expect(coreProtection.isLearningLayerPath('src/types/agent.ts')).toBe(false);
      expect(coreProtection.isLearningLayerPath('components/chat/chat-window.tsx')).toBe(false);
    });
  });

  describe('validateTransformation', () => {
    it('should pass validation for safe files', async () => {
      const result = await coreProtection.validateTransformation([
        'components/chat/chat-window.tsx',
        'app/page.tsx',
        'lib/utils.ts',
      ]);

      expect(result.isValid).toBe(true);
      expect(result.violations).toHaveLength(0);
      expect(result.allowedPaths).toHaveLength(3);
      expect(result.protectedPaths).toHaveLength(0);
    });

    it('should detect pristine core violations', async () => {
      const result = await coreProtection.validateTransformation([
        'src/types/agent.ts',
        'components/chat/chat-window.tsx',
      ]);

      expect(result.isValid).toBe(false);
      expect(result.violations).toHaveLength(1);
      expect(result.violations[0].path).toBe('src/types/agent.ts');
      expect(result.violations[0].severity).toBe('critical');
      expect(result.protectedPaths).toContain('src/types/agent.ts');
      expect(result.allowedPaths).toContain('components/chat/chat-window.tsx');
    });

    it('should handle multiple violations with different severities', async () => {
      const result = await coreProtection.validateTransformation([
        'src/types/agent.ts', // critical
        'next.config.js', // error (if configured)
        'components/ui/button.tsx', // error
      ]);

      expect(result.isValid).toBe(false);
      expect(result.violations.length).toBeGreaterThan(0);
      
      const criticalViolations = result.violations.filter(v => v.severity === 'critical');
      expect(criticalViolations.length).toBeGreaterThan(0);
    });

    it('should allow learning layer modifications', async () => {
      const result = await coreProtection.validateTransformation([
        'docs/patches/patch-1/CONSEQUENCES.md',
        'data/learning/new-strategy.json',
      ]);

      expect(result.isValid).toBe(true);
      expect(result.violations).toHaveLength(0);
      expect(result.allowedPaths).toHaveLength(2);
    });
  });

  describe('auditCoreIntegrity', () => {
    it('should pass audit when core files are intact', async () => {
      // Mock fs.access to simulate existing files
      const mockFs = require('fs').promises;
      jest.spyOn(mockFs, 'access').mockResolvedValue(undefined);
      jest.spyOn(mockFs, 'readFile').mockImplementation((path: string) => {
        if (path.includes('agent.ts')) {
          return Promise.resolve('export interface Agent { id: string; }');
        }
        if (path.includes('schema.prisma')) {
          return Promise.resolve('generator client { provider = "prisma-client-js" }');
        }
        return Promise.resolve('export const test = true;');
      });

      const result = await coreProtection.auditCoreIntegrity();
      
      expect(result.isValid).toBe(true);
      expect(result.violations).toHaveLength(0);
      expect(result.protectedPaths.length).toBeGreaterThan(0);
    });

    it('should detect missing critical files', async () => {
      // Mock fs.access to simulate missing files
      const mockFs = require('fs').promises;
      jest.spyOn(mockFs, 'access').mockRejectedValue(new Error('ENOENT'));

      const result = await coreProtection.auditCoreIntegrity();
      
      expect(result.isValid).toBe(false);
      expect(result.violations.length).toBeGreaterThan(0);
      
      const criticalViolations = result.violations.filter(v => v.severity === 'critical');
      expect(criticalViolations.length).toBeGreaterThan(0);
    });

    it('should detect corrupted core files', async () => {
      const mockFs = require('fs').promises;
      jest.spyOn(mockFs, 'access').mockResolvedValue(undefined);
      jest.spyOn(mockFs, 'readFile').mockImplementation((path: string) => {
        if (path.includes('agent.ts')) {
          return Promise.resolve('// corrupted file with no exports');
        }
        if (path.includes('schema.prisma')) {
          return Promise.resolve('// missing generator client');
        }
        return Promise.resolve('export const test = true;');
      });

      const result = await coreProtection.auditCoreIntegrity();
      
      expect(result.isValid).toBe(false);
      expect(result.violations.length).toBeGreaterThan(0);
    });
  });

  describe('enforceProtection', () => {
    it('should not throw for valid core state', async () => {
      const mockFs = require('fs').promises;
      jest.spyOn(mockFs, 'access').mockResolvedValue(undefined);
      jest.spyOn(mockFs, 'readFile').mockImplementation(() => 
        Promise.resolve('export const valid = true;')
      );

      await expect(coreProtection.enforceProtection()).resolves.not.toThrow();
    });

    it('should throw for critical violations', async () => {
      const mockFs = require('fs').promises;
      jest.spyOn(mockFs, 'access').mockRejectedValue(new Error('ENOENT'));

      await expect(coreProtection.enforceProtection()).rejects.toThrow('CRITICAL CORE PROTECTION VIOLATION');
    });

    it('should not throw for non-critical violations', async () => {
      const mockFs = require('fs').promises;
      jest.spyOn(mockFs, 'access').mockResolvedValue(undefined);
      jest.spyOn(mockFs, 'readFile').mockImplementation((path: string) => {
        if (path.includes('agent.ts')) {
          return Promise.resolve('export interface Agent { id: string; }');
        }
        if (path.includes('schema.prisma')) {
          return Promise.resolve('generator client { provider = "prisma-client-js" }');
        }
        // Simulate a warning-level issue
        return Promise.resolve('export const test = true;');
      });

      await expect(coreProtection.enforceProtection()).resolves.not.toThrow();
    });
  });

  describe('generateProtectionReport', () => {
    it('should generate a comprehensive protection report', () => {
      const report = coreProtection.generateProtectionReport();
      
      expect(report).toContain('# Core Protection Configuration');
      expect(report).toContain('Protected Paths');
      expect(report).toContain('Learning Layer Paths');
      expect(report).toContain('Protection Mechanisms');
      expect(report).toContain('Violation Response Protocol');
      
      // Should include configured paths
      expect(report).toContain('src/types/agent.ts');
      expect(report).toContain('docs/patches/**');
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });
});
