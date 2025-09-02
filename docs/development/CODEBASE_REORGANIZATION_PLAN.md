---
title: Codebase Reorganization Plan
created: 2025-01-09
---

# Codebase Reorganization Plan

## Current Issues

### Root Directory Clutter
- 7 Python test files in root directory
- 6 environment files scattered in root
- Shell script in root instead of scripts folder
- Configuration files could be better organized

### Inconsistent Structure
- Tests split across `__tests__/`, `tests/`, and root
- Python files mixed with TypeScript codebase
- Scripts in multiple locations

## Proposed Changes

### 1. Move Python Files to Proper Locations

**Current Python files in root:**
- `simple_llm_test.py` → `training/scripts/simple_llm_test.py`
- `test_agent_modes.py` → `training/tests/test_agent_modes.py`
- `test_data_collector.py` → `training/tests/test_data_collector.py`
- `test_llm_wrapper.py` → `training/tests/test_llm_wrapper.py`
- `test_llm_wrapper_fixed.py` → `training/tests/test_llm_wrapper_fixed.py`
- `test_local_inference.py` → `training/tests/test_local_inference.py`
- `test_raise_controller.py` → `training/tests/test_raise_controller.py`

**Rationale:** Group all Python training/LLM related files under `training/`

### 2. Move Shell Scripts to Scripts Folder

**Current:**
- `setup_agent_training.sh` → `scripts/setup_agent_training.sh`

**Rationale:** Consolidate all scripts in one location

### 3. Create Environment Configuration Folder

**Current environment files in root:**
- `.env.example`
- `.env.local`
- `.env.local.bak.1756092933` (backup - can be deleted)
- `.env.production.local`
- `.env.training`
- `.env.vercel.production`

**Proposed structure:**
```
config/
├── env/
│   ├── .env.example
│   ├── .env.local
│   ├── .env.production.local
│   ├── .env.training
│   └── .env.vercel.production
└── README.md (environment setup guide)
```

**Note:** Keep `.env.local` in root as it's commonly expected there by Next.js

### 4. Consolidate Test Directories

**Current:**
- `__tests__/` (Jest tests for components/API)
- `tests/` (E2E Playwright tests)
- Root Python test files

**Proposed:**
```
tests/
├── unit/           # Move from __tests__/
├── e2e/           # Keep Playwright tests
└── python/        # Move Python tests from root
```

### 5. Group Configuration Files

**Create `config/` directory:**
```
config/
├── babel.config.json
├── jest.polyfills.ts
├── jest.setup.ts
├── playwright.config.ts
├── postcss.config.js
├── tailwind.config.js
├── tsconfig.base.json
├── tsconfig.json
└── env/           # Environment files
```

**Keep in root (required by tools):**
- `next.config.js` (Next.js expects this in root)
- `nx.json` (Nx expects this in root)
- `package.json` (npm/yarn expects this in root)
- `components.json` (shadcn/ui expects this in root)

## Implementation Steps

### Phase 1: Python Files (Safe - No Import Dependencies)
1. Create `training/tests/` directory
2. Move Python test files from root to `training/tests/`
3. Move `simple_llm_test.py` to `training/scripts/`
4. Move `setup_agent_training.sh` to `scripts/`

### Phase 2: Environment Files (Requires Care)
1. Create `config/env/` directory
2. Move most .env files to `config/env/`
3. Keep `.env.local` in root (Next.js convention)
4. Update any scripts that reference moved env files

### Phase 3: Configuration Files (Requires Import Updates)
1. Create `config/` directory
2. Move configuration files to `config/`
3. Update import paths in affected files
4. Update package.json scripts if needed

### Phase 4: Test Directory Consolidation (Complex)
1. Create new `tests/` structure
2. Move `__tests__/` content to `tests/unit/`
3. Update Jest configuration
4. Update import paths in test files

## Files That Must Stay in Root

- `package.json` - Required by npm/yarn
- `next.config.js` - Required by Next.js
- `nx.json` - Required by Nx
- `components.json` - Required by shadcn/ui
- `.env.local` - Next.js convention
- `.gitignore` - Git requirement
- `README.md` - GitHub convention
- `END_GOAL.md` - Project documentation

## Risk Assessment

### Low Risk (Phase 1)
- Python files have no TypeScript imports
- Shell scripts can be moved safely
- No build tool dependencies

### Medium Risk (Phase 2)
- Environment files may be referenced in scripts
- Need to verify deployment configurations

### High Risk (Phase 3-4)
- Configuration files have import dependencies
- Test files have complex import paths
- Build tools may expect specific locations

## Benefits

1. **Cleaner Root Directory** - Easier navigation and understanding
2. **Logical Grouping** - Related files organized together
3. **Better Maintainability** - Clear separation of concerns
4. **Improved Developer Experience** - Easier to find files
5. **Consistent Structure** - Follows modern project conventions

## Implementation Priority

1. **Start with Phase 1** (Python files) - Lowest risk, immediate benefit
2. **Evaluate Phase 2** (Environment files) - Medium risk, good benefit
3. **Consider Phase 3-4** - Higher risk, requires careful testing

This reorganization will significantly improve codebase organization while maintaining all functionality.
