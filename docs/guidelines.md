# 📋 Project Guidelines

## Overview

This document outlines the development guidelines and standards for the AGENT project, ensuring consistency and quality across all development phases.

## 1. Code Style Standards

### TypeScript/React Requirements
- All code must be written in **TypeScript** (never use `.js` unless auto-generated)
- UI must use **React + Tailwind CSS** with atomic component design
- Use **PascalCase filenames** for React components
- Apply **named exports** only; barrel files allowed only as `index.ts` within folders

### Validation & Types
- Apply **Zod** (or equivalent) for runtime validation
- Keep types in `src/types/` for reuse across components
- Ensure all interfaces are properly typed with no `any` usage

## 2. Project Structure

### Nx Monorepo Organization
```
apps/            # Nx-managed platforms (React web + Expo mobile/desktop)
libs/            # Shared TS code, UI libs, hooks, test utilities
tools/           # Generators, CLI helpers, scripts
docs/            # Documentation and guidelines
├─ guidelines.md
├─ architecture/   # Mermaid C4 diagrams
├─ patches/
└─ batches/
```

### Component Organization
- Atomic component design with clear separation of concerns
- Shared components in `libs/ui/` with proper exports
- Domain-specific components in respective app directories

## 3. Development Workflow

### Patch/Batch System
- Development organized into **patches** (small feature sets)
- **Batches** group related patches for major releases
- Each patch/batch has detailed checklists and summaries
- All work tracked in `docs/patches/` and `docs/batches/`

### Git Workflow
- Feature branches: `windsprint/batch-N` for batch work
- Commit messages follow conventional format with tags
- All changes must pass CI/CD pipeline before merge

## 4. Quality Assurance

### Testing Requirements
- Maintain **≥90% test coverage** across all components
- Unit tests for all business logic
- Integration tests for API endpoints
- E2E tests for critical user flows

### Code Quality
- TypeScript strict mode enabled
- ESLint and Prettier for code formatting
- No compilation errors or warnings allowed
- All dependencies properly typed

## 5. CLI Flag Enforcement

All CLI scaffolding commands must include explicit, non-interactive flags:

### Nx Commands
```bash
npx create-nx-workspace … --preset=react-ts --appName=web --style=css \
  --defaultBase=main --no-interactive
```

### Expo Commands
```bash
nx g @nx/expo:app mobile --no-interactive
```

### Deployment Commands
```bash
vercel link --yes --token="${VERCEL_TOKEN}"
```

**Critical**: Missing or incorrect flags trigger creation of issue documentation and halt execution.

## 6. Architecture Standards

### Component Architecture
- **BaseModeLayout** foundation for all UI modes
- Consistent theming and responsive design
- Proper state management with Zustand
- Clean separation between UI and business logic

### Training Pipeline Architecture
- **WebCrawler**: Async content extraction
- **DataProcessor**: Content analysis and concept extraction
- **RAISEDomainTrainer**: AI training integration
- **WorkflowExecutor**: Complete pipeline orchestration

### Security Standards
- Wallet-based authentication with multi-network support
- Role-based permissions (admin, user, viewer)
- API security with rate limiting
- Data encryption at rest and in transit

## 7. Documentation Requirements

### Code Documentation
- All public APIs documented with JSDoc
- README files for all major components
- Architecture diagrams using Mermaid
- Deployment and setup instructions

### Process Documentation
- Patch checklists with clear success criteria
- Batch summaries with technical details
- Production readiness assessments
- Troubleshooting guides

## 8. Production Deployment

### CI/CD Pipeline
- **Kilo Pipeline**: Automated build, test, and deployment
- **Semantic Release**: Automated versioning and changelogs
- **Vercel Integration**: Production deployment automation
- **Quality Gates**: All tests must pass before deployment

### Monitoring & Observability
- Application performance monitoring
- Error tracking and alerting
- User analytics and engagement metrics
- Infrastructure monitoring and scaling

## 9. Training System Standards

### Domain Specialists
- **Developer**: JavaScript, React, TypeScript expertise
- **Trader**: Financial analysis and trading strategies
- **Lawyer**: Legal research and document analysis
- **Designer**: UI/UX design and visual systems

### Training Data Quality
- Verified sources with credibility scoring
- Regular content updates and validation
- Bias detection and mitigation
- Performance improvement tracking

## 10. Compliance & Standards

### END_GOAL Criteria
All development must align with acceptance criteria:
- Admin login security
- Responsive UI design
- Mobile/desktop consistency
- Routing functionality
- Test coverage requirements
- Runtime validation
- CI/CD deployment success

### Version Control
- Semantic versioning for all releases
- Tagged releases with detailed changelogs
- Branch protection rules enforced
- Code review requirements

---

This document serves as the source of truth for all development standards and practices. All team members must follow these guidelines to ensure consistent, high-quality deliverables.
