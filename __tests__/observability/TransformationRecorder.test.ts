import { TransformationRecorder, FileSystemSink } from '../../libs/observability/TransformationRecorder';
import { CoreProtection } from '../../libs/observability/CoreProtection';
import { RecorderConfig, ConsequenceRecord } from '../../src/types/agent-observability';
import { promises as fs } from 'fs';
import { execSync } from 'child_process';

// Mock dependencies
jest.mock('fs', () => ({
  promises: {
    mkdir: jest.fn(),
    appendFile: jest.fn(),
    writeFile: jest.fn(),
  },
}));

jest.mock('child_process', () => ({
  execSync: jest.fn(),
}));

jest.mock('../../libs/observability/CoreProtection');

describe('TransformationRecorder', () => {
  let recorder: TransformationRecorder;
  let mockConfig: RecorderConfig;
  let mockCoreProtection: jest.Mocked<CoreProtection>;

  beforeEach(() => {
    mockConfig = {
      enableFileSystemSink: true,
      enableSupabaseSink: false,
      enableCoreProtection: true,
      redactPatterns: ['.env*', '*secret*'],
      protectedPaths: ['src/types/agent.ts'],
      learningPaths: ['docs/patches/**'],
    };

    mockCoreProtection = {
      validateTransformation: jest.fn(),
      auditCoreIntegrity: jest.fn(),
      isPristineCorePath: jest.fn(),
      isLearningLayerPath: jest.fn(),
      enforceProtection: jest.fn(),
      generateProtectionReport: jest.fn(),
    } as any;

    (CoreProtection as jest.MockedClass<typeof CoreProtection>).mockImplementation(() => mockCoreProtection);

    recorder = new TransformationRecorder(mockConfig);
  });

  describe('start', () => {
    beforeEach(() => {
      mockCoreProtection.validateTransformation.mockResolvedValue({
        isValid: true,
        violations: [],
        protectedPaths: [],
        allowedPaths: ['components/chat/chat-window.tsx'],
        timestamp: new Date().toISOString(),
      });

      (execSync as jest.Mock).mockReturnValue('abc123def\n');
    });

    it('should start transformation recording successfully', async () => {
      const context = {
        patchId: 1,
        branch: 'main',
        authorId: 'user-123',
        filesTouched: ['components/chat/chat-window.tsx'],
      };

      const transformationId = await recorder.start(context);

      expect(transformationId).toMatch(/^patch-1@[a-f0-9]{7}$/);
      expect(mockCoreProtection.validateTransformation).toHaveBeenCalledWith(context.filesTouched);
    });

    it('should throw error for critical core violations', async () => {
      mockCoreProtection.validateTransformation.mockResolvedValue({
        isValid: false,
        violations: [{
          path: 'src/types/agent.ts',
          reason: 'Pristine core violation',
          severity: 'critical',
        }],
        protectedPaths: ['src/types/agent.ts'],
        allowedPaths: [],
        timestamp: new Date().toISOString(),
      });

      const context = {
        patchId: 1,
        branch: 'main',
        authorId: 'user-123',
        filesTouched: ['src/types/agent.ts'],
      };

      await expect(recorder.start(context)).rejects.toThrow('CRITICAL: Pristine core violation detected');
    });

    it('should allow non-critical violations', async () => {
      mockCoreProtection.validateTransformation.mockResolvedValue({
        isValid: false,
        violations: [{
          path: 'some-file.ts',
          reason: 'Minor violation',
          severity: 'warning',
        }],
        protectedPaths: [],
        allowedPaths: ['some-file.ts'],
        timestamp: new Date().toISOString(),
      });

      const context = {
        patchId: 1,
        branch: 'main',
        authorId: 'user-123',
        filesTouched: ['some-file.ts'],
      };

      const transformationId = await recorder.start(context);
      expect(transformationId).toBeDefined();
    });
  });

  describe('attachToolCall', () => {
    beforeEach(async () => {
      mockCoreProtection.validateTransformation.mockResolvedValue({
        isValid: true,
        violations: [],
        protectedPaths: [],
        allowedPaths: ['test.tsx'],
        timestamp: new Date().toISOString(),
      });

      (execSync as jest.Mock).mockReturnValue('abc123def\n');

      await recorder.start({
        patchId: 1,
        branch: 'main',
        authorId: 'user-123',
        filesTouched: ['test.tsx'],
      });
    });

    it('should record tool calls normally', async () => {
      const toolCall = {
        id: 'tool-1',
        name: 'Read',
        timestamp: new Date().toISOString(),
        parameters: { file_path: 'test.tsx' },
        duration: 100,
        coreProtectionCheck: false,
      };

      await recorder.attachToolCall(toolCall);
      // No exception should be thrown
    });

    it('should detect core protection violations in Edit tool calls', async () => {
      mockCoreProtection.isPristineCorePath.mockReturnValue(true);

      const toolCall = {
        id: 'tool-1',
        name: 'Edit',
        timestamp: new Date().toISOString(),
        parameters: { file_path: 'src/types/agent.ts' },
        duration: 100,
        coreProtectionCheck: false,
      };

      await recorder.attachToolCall(toolCall);

      expect(mockCoreProtection.isPristineCorePath).toHaveBeenCalledWith('src/types/agent.ts');
      expect(toolCall.coreProtectionCheck).toBe(true);
    });
  });

  describe('finalize', () => {
    beforeEach(async () => {
      mockCoreProtection.validateTransformation.mockResolvedValue({
        isValid: true,
        violations: [],
        protectedPaths: [],
        allowedPaths: ['test.tsx'],
        timestamp: new Date().toISOString(),
      });

      mockCoreProtection.auditCoreIntegrity.mockResolvedValue({
        isValid: true,
        violations: [],
        protectedPaths: [],
        allowedPaths: [],
        timestamp: new Date().toISOString(),
      });

      (execSync as jest.Mock)
        .mockReturnValueOnce('abc123def\n') // git rev-parse HEAD
        .mockReturnValueOnce('') // typecheck
        .mockReturnValueOnce('') // lint
        .mockReturnValueOnce('All files | 95.2 |') // test coverage
        .mockReturnValueOnce(''); // build

      await recorder.start({
        patchId: 1,
        branch: 'main',
        authorId: 'user-123',
        filesTouched: ['test.tsx'],
      });
    });

    it('should finalize transformation with all guardrails', async () => {
      const record = await recorder.finalize('Test transformation', 'proceed');

      expect(record.transformation.id).toMatch(/^patch-1@[a-f0-9]{7}$/);
      expect(record.summary).toBe('Test transformation');
      expect(record.decision).toBe('proceed');
      expect(record.coreIntegrityVerified).toBe(true);
      expect(record.guardrails).toHaveLength(5); // typecheck, lint, test, build, core_protection
    });

    it('should handle guardrail failures gracefully', async () => {
      (execSync as jest.Mock)
        .mockReturnValueOnce('abc123def\n') // git rev-parse HEAD (for start)
        .mockImplementationOnce(() => { // typecheck failure
          const error = new Error('Type error');
          (error as any).status = 1;
          throw error;
        });

      const record = await recorder.finalize('Test with failures', 'fix_required');

      expect(record.decision).toBe('fix_required');
      expect(record.guardrails.some(g => g.name === 'typecheck' && g.status === 'fail')).toBe(true);
    });

    it('should generate learning insights', async () => {
      await recorder.attachToolCall({
        id: 'tool-1',
        name: 'Edit',
        timestamp: new Date().toISOString(),
        parameters: { file_path: 'test.tsx' },
        duration: 100,
        coreProtectionCheck: false,
      });

      const record = await recorder.finalize('Test insights', 'proceed');

      expect(record.learningInsights).toBeDefined();
      expect(record.learningInsights!.length).toBeGreaterThan(0);
      expect(record.learningInsights!.some(insight => insight.includes('Tools used: Edit'))).toBe(true);
    });
  });

  describe('FileSystemSink', () => {
    let sink: FileSystemSink;
    let mockRecord: ConsequenceRecord;

    beforeEach(() => {
      sink = new FileSystemSink('/test/base/path');
      mockRecord = {
        transformation: {
          id: 'patch-1@abc123',
          patchId: 1,
          branch: 'main',
          authorId: 'user-123',
          timestamp: new Date().toISOString(),
          categories: ['code'],
          filesTouched: ['test.tsx'],
          gitStats: {
            sha: 'abc123def',
            additions: 10,
            deletions: 5,
            changedFiles: 1,
          },
          coreProtectionStatus: 'safe',
        },
        events: [],
        guardrails: [
          {
            name: 'typecheck',
            status: 'pass',
            timestamp: new Date().toISOString(),
            duration: 1000,
            metrics: { errors: 0 },
            artifacts: [],
          },
        ],
        artifacts: [],
        toolCalls: [],
        summary: 'Test transformation',
        decision: 'proceed',
        coreIntegrityVerified: true,
        version: '1.0',
      };
    });

    it('should write JSONL ledger and markdown consequences', async () => {
      await sink.write(mockRecord);

      expect(fs.mkdir).toHaveBeenCalledWith('/test/base/path/docs/patches/patch-1', { recursive: true });
      expect(fs.appendFile).toHaveBeenCalledWith(
        '/test/base/path/docs/patches/patch-1/ledger.jsonl',
        expect.stringContaining('"id":"patch-1@abc123"'),
        'utf8'
      );
      expect(fs.writeFile).toHaveBeenCalledWith(
        '/test/base/path/docs/patches/patch-1/CONSEQUENCES.md',
        expect.stringContaining('# Transformation Consequences - Patch 1'),
        'utf8'
      );
    });

    it('should generate comprehensive markdown report', async () => {
      mockRecord.guardrails.push({
        name: 'test',
        status: 'fail',
        timestamp: new Date().toISOString(),
        duration: 2000,
        metrics: { passed: 0, failed: 1 },
        artifacts: [],
      });

      await sink.write(mockRecord);

      const markdownCall = (fs.writeFile as jest.Mock).mock.calls.find(call => 
        call[0].endsWith('CONSEQUENCES.md')
      );
      const markdown = markdownCall[1];

      expect(markdown).toContain('**Core Integrity**: ✅ VERIFIED');
      expect(markdown).toContain('**Decision**: **PROCEED**');
      expect(markdown).toContain('### ✅ Passed (1)');
      expect(markdown).toContain('### ❌ Failed (1)');
      expect(markdown).toContain('- `test.tsx`');
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
});
