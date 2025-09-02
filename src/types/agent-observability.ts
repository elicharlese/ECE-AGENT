import { z } from 'zod';

// Core transformation tracking
export const TransformationSchema = z.object({
  id: z.string(), // e.g., "patch-17@c1a2b3"
  patchId: z.number(),
  batchId: z.number().optional(),
  branch: z.string(),
  authorId: z.string(),
  timestamp: z.string().datetime(),
  categories: z.array(z.enum(['code', 'config', 'database', 'infrastructure', 'docs'])),
  filesTouched: z.array(z.string()),
  gitStats: z.object({
    sha: z.string(),
    additions: z.number(),
    deletions: z.number(),
    changedFiles: z.number(),
  }),
  coreProtectionStatus: z.enum(['safe', 'violation_detected', 'violation_blocked']),
});

export type Transformation = z.infer<typeof TransformationSchema>;

// Observation events during transformation
export const ObservationEventSchema = z.object({
  name: z.string(),
  timestamp: z.string().datetime(),
  severity: z.enum(['info', 'warn', 'error', 'critical']),
  payload: z.record(z.any()), // Structured log data
  category: z.enum(['tool_call', 'guardrail', 'core_protection', 'user_action', 'system']),
});

export type ObservationEvent = z.infer<typeof ObservationEventSchema>;

// Guardrail execution results
export const GuardrailResultSchema = z.object({
  name: z.enum(['typecheck', 'lint', 'test', 'build', 'e2e', 'coverage', 'bundle_size', 'db_health', 'core_protection']),
  status: z.enum(['pass', 'fail', 'warn', 'skip', 'error']),
  timestamp: z.string().datetime(),
  duration: z.number(), // milliseconds
  metrics: z.record(z.union([z.string(), z.number(), z.boolean()])),
  artifacts: z.array(z.string()), // paths to generated files/reports
  exitCode: z.number().optional(),
  stdout: z.string().optional(),
  stderr: z.string().optional(),
});

export type GuardrailResult = z.infer<typeof GuardrailResultSchema>;

// Artifacts generated during transformation
export const ArtifactSchema = z.object({
  id: z.string(),
  transformationId: z.string(),
  kind: z.enum(['diff', 'log', 'coverage', 'junit', 'html', 'json', 'screenshot', 'bundle_report']),
  path: z.string(), // file path or URL
  hash: z.string().optional(), // SHA256 for integrity
  size: z.number().optional(), // bytes
  metadata: z.record(z.any()).optional(),
});

export type Artifact = z.infer<typeof ArtifactSchema>;

// Tool calls made during transformation
export const ToolCallSchema = z.object({
  id: z.string(),
  name: z.string(),
  timestamp: z.string().datetime(),
  parameters: z.record(z.any()),
  result: z.any().optional(),
  error: z.string().optional(),
  duration: z.number(), // milliseconds
  coreProtectionCheck: z.boolean(), // was this call validated against core protection
});

export type ToolCall = z.infer<typeof ToolCallSchema>;

// Complete consequence record
export const ConsequenceRecordSchema = z.object({
  transformation: TransformationSchema,
  events: z.array(ObservationEventSchema),
  guardrails: z.array(GuardrailResultSchema),
  artifacts: z.array(ArtifactSchema),
  toolCalls: z.array(ToolCallSchema),
  summary: z.string(),
  decision: z.enum(['proceed', 'fix_required', 'rollback', 'manual_review']),
  coreIntegrityVerified: z.boolean(),
  learningInsights: z.array(z.string()).optional(), // adaptive insights for learning layer
  redactions: z.array(z.string()).optional(), // paths/patterns that were redacted
  version: z.string().default('1.0'),
});

export type ConsequenceRecord = z.infer<typeof ConsequenceRecordSchema>;

// Core protection validation result
export const CoreProtectionResultSchema = z.object({
  isValid: z.boolean(),
  violations: z.array(z.object({
    path: z.string(),
    reason: z.string(),
    severity: z.enum(['warning', 'error', 'critical']),
  })),
  protectedPaths: z.array(z.string()),
  allowedPaths: z.array(z.string()),
  timestamp: z.string().datetime(),
});

export type CoreProtectionResult = z.infer<typeof CoreProtectionResultSchema>;

// Learning layer adaptive strategy
export const AdaptiveStrategySchema = z.object({
  id: z.string(),
  name: z.string(),
  category: z.enum(['code_generation', 'error_recovery', 'optimization', 'user_preference', 'context_adaptation']),
  pattern: z.string(), // description of the pattern learned
  confidence: z.number().min(0).max(1),
  usageCount: z.number(),
  successRate: z.number().min(0).max(1),
  lastUsed: z.string().datetime(),
  metadata: z.record(z.any()).optional(),
});

export type AdaptiveStrategy = z.infer<typeof AdaptiveStrategySchema>;

// Transformation recorder configuration
export const RecorderConfigSchema = z.object({
  enableFileSystemSink: z.boolean().default(true),
  enableSupabaseSink: z.boolean().default(false),
  enableCoreProtection: z.boolean().default(true),
  redactPatterns: z.array(z.string()).default(['.env*', '*secret*', '*key*', '*token*']),
  protectedPaths: z.array(z.string()).default([
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
  ]),
  learningPaths: z.array(z.string()).default([
    'docs/patches/**',
    'docs/batches/**',
    'data/learning/**',
    'config/adaptive/**',
    'lib/learning/**',
  ]),
});

export type RecorderConfig = z.infer<typeof RecorderConfigSchema>;

// Database schemas for Supabase persistence
export const TransformationRowSchema = z.object({
  id: z.string(),
  patch_id: z.number(),
  batch_id: z.number().nullable(),
  branch: z.string(),
  author_id: z.string(),
  created_at: z.string(),
  categories: z.array(z.string()),
  files_touched: z.array(z.string()),
  git_stats: z.record(z.any()),
  core_protection_status: z.string(),
  summary: z.string(),
  decision: z.string(),
  core_integrity_verified: z.boolean(),
});

export type TransformationRow = z.infer<typeof TransformationRowSchema>;

export const GuardrailRowSchema = z.object({
  id: z.string(),
  transformation_id: z.string(),
  name: z.string(),
  status: z.string(),
  created_at: z.string(),
  duration: z.number(),
  metrics: z.record(z.any()),
  exit_code: z.number().nullable(),
});

export type GuardrailRow = z.infer<typeof GuardrailRowSchema>;

export const ArtifactRowSchema = z.object({
  id: z.string(),
  transformation_id: z.string(),
  kind: z.string(),
  path: z.string(),
  hash: z.string().nullable(),
  size: z.number().nullable(),
  metadata: z.record(z.any()).nullable(),
  created_at: z.string(),
});

export type ArtifactRow = z.infer<typeof ArtifactRowSchema>;
