# PRISTINE CORE CHECKLIST

**Purpose**: Define immutable boundaries that must NEVER be modified during self-observation or learning cycles.

## Core Protection Principle

The AGENT's self-observation system operates with strict separation:
- **PRISTINE CORE**: Immutable foundation that defines the agent's fundamental capabilities
- **LEARNING LAYER**: Adaptive components that evolve based on observed consequences

## PRISTINE CORE BOUNDARIES (IMMUTABLE)

### 1. Model Architecture & Reasoning
- [ ] Base model weights and training data
- [ ] Core reasoning patterns and decision-making algorithms
- [ ] Safety constraints and ethical guidelines
- [ ] Fundamental prompt engineering and context handling
- [ ] Tool calling protocols and function schemas

### 2. Essential Type System
- [ ] Core TypeScript interfaces in `src/types/` (agent.ts, conversation.ts, credits.ts)
- [ ] Base Zod schemas for validation
- [ ] Database schema definitions in `prisma/schema.prisma`
- [ ] API contract definitions and route handlers structure

### 3. Critical Infrastructure
- [ ] Authentication and authorization logic (`middleware.ts`, auth routes)
- [ ] Database connection and RLS policies
- [ ] Core service patterns (`services/*.ts` base structure)
- [ ] Essential UI components (`components/ui/`)
- [ ] Build configuration (`next.config.js`, `tailwind.config.js`, `tsconfig.json`)

### 4. Security & Compliance
- [ ] Environment variable schemas and validation
- [ ] Rate limiting and abuse prevention
- [ ] Data privacy and encryption patterns
- [ ] Supabase RLS policies and user isolation
- [ ] API security headers and CORS configuration

### 5. Core Guardrails
- [ ] TypeScript compilation requirements
- [ ] ESLint rules and code quality standards
- [ ] Test coverage thresholds (≥90%)
- [ ] Build process and deployment pipeline
- [ ] Git workflow and branch protection rules

## LEARNING LAYER (MUTABLE)

### Adaptive Components That CAN Evolve
- [ ] Transformation records and consequence observations
- [ ] Performance metrics and optimization strategies
- [ ] User preference patterns and context adaptation
- [ ] Code generation improvements based on outcomes
- [ ] UI/UX refinements based on usage patterns
- [ ] Feature flags and experimental configurations

### Learning Storage Locations
- [ ] `docs/patches/*/CONSEQUENCES.md` - Human-readable outcomes
- [ ] `docs/patches/*/ledger.jsonl` - Structured transformation records
- [ ] `data/learning/` - Adaptive strategies and patterns
- [ ] Supabase `transformations`, `guardrails`, `artifacts` tables
- [ ] User-specific preferences in `user_profiles` table

## PROTECTION MECHANISMS

### Automated Checks
- [ ] File path validation: Reject modifications to pristine core paths
- [ ] Schema validation: Ensure core types remain unchanged
- [ ] Dependency validation: Prevent removal of essential packages
- [ ] Configuration validation: Block changes to critical config files
- [ ] Database validation: Prevent schema modifications outside migrations

### Fail-Safe Triggers
- [ ] Immediate halt if pristine core modification detected
- [ ] Rollback mechanism for accidental core changes
- [ ] Alert system for attempted core modifications
- [ ] Audit trail of all transformation attempts
- [ ] Manual override requiring explicit admin approval

### Validation Gates
- [ ] Pre-transformation: Validate target files against pristine list
- [ ] During transformation: Monitor for core boundary violations
- [ ] Post-transformation: Verify core integrity unchanged
- [ ] Pre-commit: Block commits that modify pristine core
- [ ] CI/CD: Fail pipeline if core protection violated

## IMPLEMENTATION REQUIREMENTS

### Core Protection Service
```typescript
// libs/observability/CoreProtection.ts
class CoreProtection {
  static validateTransformation(files: string[]): ValidationResult
  static isPristineCorePath(path: string): boolean
  static enforceProtection(): void
  static auditCoreIntegrity(): IntegrityReport
}
```

### Protected Path Patterns
```
/src/types/{agent,conversation,credits,user-tiers}.ts
/prisma/schema.prisma
/middleware.ts
/app/api/auth/**
/components/ui/**
/next.config.js
/tailwind.config.js
/tsconfig*.json
/.github/workflows/**
/lib/supabase/**
```

### Learning Layer Paths
```
/docs/patches/**
/docs/batches/**
/data/learning/**
/config/adaptive/**
/lib/learning/**
```

## VIOLATION RESPONSE PROTOCOL

1. **Detection**: Automated monitoring identifies pristine core modification attempt
2. **Halt**: Immediately stop transformation process
3. **Alert**: Log violation with full context and stack trace
4. **Rollback**: Revert any partial changes to pristine components
5. **Report**: Generate incident report in `docs/incidents/`
6. **Review**: Require manual review before allowing any core-adjacent changes

## TESTING REQUIREMENTS

- [ ] Unit tests for each protection mechanism
- [ ] Integration tests for violation detection
- [ ] E2E tests for complete protection workflow
- [ ] Chaos engineering tests attempting core modifications
- [ ] Performance tests ensuring protection doesn't impact speed

## MAINTENANCE

- [ ] Monthly review of pristine core boundaries
- [ ] Quarterly audit of protection mechanisms
- [ ] Annual assessment of learning layer effectiveness
- [ ] Continuous monitoring of violation attempts
- [ ] Regular backup of pristine core state

---

**Last Updated**: 2025-09-01  
**Version**: 1.0  
**Status**: ACTIVE - All modifications to this checklist require explicit approval
