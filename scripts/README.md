# Scripts Directory

This directory contains various scripts for the Kilo Agent project, organized by category.

## Directory Structure

### `auth/`
Authentication-related scripts for testing and verification:
- `final-authentication-test.js` - Comprehensive authentication flow testing
- `test-authentication.js` - Basic authentication verification
- `verify-authentication.js` - Authentication fixes verification

### `database/`
Database setup and migration scripts:
- `create_agents_table.sql` - SQL script for creating agents table
- `create_credits_tables.sql` - SQL script for creating credits/billing tables

### `dev/`
Development and utility scripts:
- `capture-screenshots.ts` - Screenshot capture utility
- `quick-dev.sh` - Quick development setup script
- `record-transformation.ts` - Data transformation recording
- `setup_agent_training.sh` - Agent training setup script
- `test-phi-crystal.ts` - PHI crystal testing utility

### `testing/`
Production and testing verification scripts:
- `production-check.js` - Production environment verification

## Usage

Run scripts from the project root directory:

```bash
# Authentication testing
node scripts/auth/final-authentication-test.js

# Database setup
psql -f scripts/database/create_agents_table.sql

# Development utilities
bash scripts/dev/quick-dev.sh
```

## Contributing

When adding new scripts:
1. Place them in the appropriate category directory
2. Add executable permissions if needed: `chmod +x script.sh`
3. Update this README with the new script description
4. Include comments in the script explaining its purpose and usage
