# AGENT Documentation Index

## 📚 Main Documentation

- [README.md](../README.md) - Main project overview, features, and architecture

- [END_GOAL.md](END_GOAL.md) - Project vision and final objectives

## 📁 Development Documentation

### Core Architecture

- [PROJECT_STRUCTURE.md](development/PROJECT_STRUCTURE.md) - Detailed project organization
- [CODEBASE_AUDIT_REPORT.md](development/CODEBASE_AUDIT_REPORT.md) - Comprehensive codebase analysis

### Framework Implementation

- [RAISE_IMPLEMENTATION_COMPLETE.md](development/RAISE_IMPLEMENTATION_COMPLETE.md) - Complete RAISE framework integration details

### System Integration

- [nebius_integration_guide.md](development/nebius_integration_guide.md) - Cloud infrastructure setup
- [IMPLEMENTING_MEDIA.md](development/IMPLEMENTING_MEDIA.md) - Media processing workflows
- [job_search_contract_management_summary.md](development/job_search_contract_management_summary.md) - Job search and contract management features

### Quality Assurance

- [preset_verification_report.md](development/preset_verification_report.md) - System verification results
- [BATCH_COMPLETION_SUMMARY.md](development/BATCH_COMPLETION_SUMMARY.md) - Batch development summaries

## 📁 Release Documentation

### 📁 `/patches`

Development patches and incremental updates:
- Each patch gets its own `/patch-n` folder
- Contains: `PATCHN_CHECKLIST.md` and `PATCHN_SUMMARY.md`
- Use for bug fixes, small features, and incremental improvements

### 📁 `/batches`

Major feature batches and releases:
- Each batch gets its own `/batch-n` folder  
- Contains: `BATCHN_CHECKLIST.md` and `BATCHN_SUMMARY.md`
- Use for major features, version releases, and significant changes

## 🚀 System Status

### ✅ Completed

- Rust-Python hybrid architecture
- High-performance core utilities
- Container orchestration
- Security tools
- Performance monitoring
- Domain-specific agents (Developer, Trader, Lawyer)

### 🚀 Production Ready

- All Rust components compiled and deployed
- Python integration layer functional
- Performance benchmarks passed
- Fallback systems operational

## 🛠 Quick Start

See the main [README.md](../README.md) for setup and usage instructions.

## 📁 Scripts Organization

The `/scripts` directory has been reorganized for better maintainability:

### `scripts/auth/`
- `final-authentication-test.js` - Comprehensive authentication flow testing
- `test-authentication.js` - Basic authentication verification  
- `verify-authentication.js` - Authentication fixes verification

### `scripts/database/`
- `create_agents_table.sql` - SQL script for creating agents table
- `create_credits_tables.sql` - SQL script for creating credits/billing tables

### `scripts/dev/`
- `capture-screenshots.ts` - Screenshot capture utility
- `quick-dev.sh` - Quick development setup script
- `record-transformation.ts` - Data transformation recording
- `setup_agent_training.sh` - Agent training setup script
- `test-phi-crystal.ts` - PHI crystal testing utility

### `scripts/testing/`
- `production-check.js` - Production environment verification

## 📁 Development Pages

Development and testing pages have been moved to `app/dev/`:
- `workspace-test/` - Manual testing interface for workspace sidebar component

## 📁 File Organization Changes

- Moved `END_GOAL.md` from root to `docs/` directory
- Removed backup files (`babel.config.backup.json`, `package.minimal.json`)
- Cleaned up empty directories (`test-transformation/`)
- Fixed broken documentation links
