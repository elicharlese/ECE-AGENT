# Component Removal Strategy - Safe UI Teardown

## Overview

This document outlines the safe removal strategy for existing UI components during the rebuild process. The goal is to systematically remove old components while maintaining functionality through the migration period.

## Removal Phases

### Phase 1: Inventory & Dependency Mapping

#### 1.1 Component Dependency Analysis
```bash
# Generate component usage map
find components/ -name "*.tsx" -exec grep -l "import.*from.*components/ui" {} \;
find app/ -name "*.tsx" -exec grep -l "import.*from.*components/ui" {} \;
```

#### 1.2 Critical Path Components
**High Risk (Remove Last)**
- `button.tsx` - Used in 50+ components
- `input.tsx` - Core form component
- `dialog.tsx` - Modal system foundation
- `card.tsx` - Layout primitive

**Medium Risk**
- `tabs.tsx` - Navigation component
- `select.tsx` - Form component
- `table.tsx` - Data display

**Low Risk (Remove First)**
- `accordion.tsx` - Limited usage
- `carousel.tsx` - Specific use cases
- `calendar.tsx` - Date picker only

### Phase 2: Systematic Removal Process

#### 2.1 Component Removal Checklist
For each component to be removed:

```typescript
// 1. Create deprecation wrapper
// components/ui/button.tsx
import { Button as NewButton } from '@/libs/design-system/primitives/Button';
import { ComponentProps } from 'react';

/**
 * @deprecated Use Button from @/libs/design-system/primitives/Button instead
 * This wrapper will be removed in v2.0
 */
export const Button = (props: ComponentProps<typeof NewButton>) => {
  if (process.env.NODE_ENV === 'development') {
    console.warn('Using deprecated Button component. Migrate to @/libs/design-system/primitives/Button');
  }
  return <NewButton {...props} />;
};
```

#### 2.2 Migration Script Template
```typescript
// scripts/migrate-component.ts
import { Project } from 'ts-morph';

export function migrateComponent(
  oldImport: string,
  newImport: string,
  componentName: string
) {
  const project = new Project();
  project.addSourceFilesAtPaths("**/*.{ts,tsx}");
  
  for (const sourceFile of project.getSourceFiles()) {
    const importDeclarations = sourceFile.getImportDeclarations();
    
    for (const importDecl of importDeclarations) {
      if (importDecl.getModuleSpecifierValue() === oldImport) {
        // Replace import
        importDecl.setModuleSpecifier(newImport);
        
        // Update named imports if needed
        const namedImports = importDecl.getNamedImports();
        // ... migration logic
      }
    }
    
    sourceFile.saveSync();
  }
}
```

### Phase 3: Feature Flag Integration

#### 3.1 Component Feature Flags
```typescript
// libs/feature-flags/ui-components.ts
export const UI_FEATURE_FLAGS = {
  NEW_BUTTON: process.env.NEXT_PUBLIC_NEW_BUTTON === 'true',
  NEW_INPUT: process.env.NEXT_PUBLIC_NEW_INPUT === 'true',
  NEW_DIALOG: process.env.NEXT_PUBLIC_NEW_DIALOG === 'true',
  // ... other flags
} as const;

// components/ui/button.tsx
import { UI_FEATURE_FLAGS } from '@/libs/feature-flags/ui-components';
import { Button as NewButton } from '@/libs/design-system/primitives/Button';
import { Button as OldButton } from './button-legacy';

export const Button = UI_FEATURE_FLAGS.NEW_BUTTON ? NewButton : OldButton;
```

#### 3.2 Gradual Rollout Strategy
```typescript
// libs/rollout/component-rollout.ts
export function shouldUseNewComponent(
  componentName: string,
  userId?: string,
  route?: string
): boolean {
  // Rollout percentage (0-100)
  const rolloutPercentage = getRolloutPercentage(componentName);
  
  // Hash user ID for consistent experience
  const userHash = userId ? hashString(userId) : Math.random();
  
  // Route-specific rollout
  if (route && ROUTE_ROLLOUT[route]) {
    return userHash < ROUTE_ROLLOUT[route] / 100;
  }
  
  return userHash < rolloutPercentage / 100;
}
```

## Removal Timeline

### Week 1-2: Setup & Low-Risk Removal
- [ ] Set up deprecation system
- [ ] Create migration scripts
- [ ] Remove low-risk components:
  - `accordion.tsx`
  - `carousel.tsx` 
  - `calendar.tsx`
  - `hover-card.tsx`
  - `menubar.tsx`

### Week 3-4: Medium-Risk Components
- [ ] Replace with feature-flagged versions:
  - `tabs.tsx`
  - `select.tsx`
  - `table.tsx`
  - `navigation-menu.tsx`
  - `breadcrumb.tsx`

### Week 5-8: High-Risk Components (Gradual)
- [ ] Gradual rollout with monitoring:
  - `button.tsx` (50% rollout)
  - `input.tsx` (25% rollout)
  - `card.tsx` (75% rollout)
  - `dialog.tsx` (25% rollout)

### Week 9-12: Complete Migration
- [ ] 100% rollout for all components
- [ ] Remove old component files
- [ ] Clean up feature flags
- [ ] Update all imports

## Safety Measures

### 1. Rollback Strategy
```typescript
// Emergency rollback script
// scripts/rollback-component.ts
export function rollbackComponent(componentName: string) {
  // Disable feature flag
  setFeatureFlag(`NEW_${componentName.toUpperCase()}`, false);
  
  // Revert imports in critical files
  revertImports(componentName, CRITICAL_FILES);
  
  // Notify monitoring systems
  notifyRollback(componentName);
}
```

### 2. Monitoring & Alerts
```typescript
// libs/monitoring/component-monitoring.ts
export function trackComponentUsage(componentName: string, isNew: boolean) {
  analytics.track('component_usage', {
    component: componentName,
    version: isNew ? 'new' : 'legacy',
    timestamp: Date.now(),
    route: window.location.pathname,
  });
}

export function trackComponentError(componentName: string, error: Error) {
  analytics.track('component_error', {
    component: componentName,
    error: error.message,
    stack: error.stack,
    timestamp: Date.now(),
  });
}
```

### 3. Automated Testing
```typescript
// __tests__/migration/component-migration.test.ts
describe('Component Migration', () => {
  it('should maintain API compatibility', () => {
    const oldProps = { variant: 'primary', size: 'md' };
    const OldButton = require('../components/ui/button-legacy').Button;
    const NewButton = require('../libs/design-system/primitives/Button').Button;
    
    // Both should accept same props
    expect(() => render(<OldButton {...oldProps} />)).not.toThrow();
    expect(() => render(<NewButton {...oldProps} />)).not.toThrow();
  });
  
  it('should render consistently', async () => {
    const props = { children: 'Test Button' };
    
    const oldSnapshot = render(<OldButton {...props} />);
    const newSnapshot = render(<NewButton {...props} />);
    
    // Visual regression test
    expect(await compareSnapshots(oldSnapshot, newSnapshot)).toBeLessThan(0.1);
  });
});
```

## File Removal Order

### Batch 1: Utility Components (Week 1)
```bash
rm components/ui/accordion.tsx
rm components/ui/carousel.tsx
rm components/ui/calendar.tsx
rm components/ui/hover-card.tsx
rm components/ui/menubar.tsx
rm components/ui/aspect-ratio.tsx
rm components/ui/collapsible.tsx
```

### Batch 2: Navigation Components (Week 3)
```bash
rm components/ui/tabs.tsx
rm components/ui/navigation-menu.tsx
rm components/ui/breadcrumb.tsx
rm components/ui/pagination.tsx
```

### Batch 3: Form Components (Week 5)
```bash
rm components/ui/select.tsx
rm components/ui/checkbox.tsx
rm components/ui/radio-group.tsx
rm components/ui/input-otp.tsx
rm components/ui/slider.tsx
rm components/ui/switch.tsx
```

### Batch 4: Layout Components (Week 7)
```bash
rm components/ui/card.tsx
rm components/ui/sheet.tsx
rm components/ui/sidebar.tsx
rm components/ui/resizable.tsx
rm components/ui/scroll-area.tsx
```

### Batch 5: Core Components (Week 10)
```bash
rm components/ui/button.tsx
rm components/ui/input.tsx
rm components/ui/textarea.tsx
rm components/ui/dialog.tsx
rm components/ui/alert-dialog.tsx
```

### Batch 6: Final Cleanup (Week 12)
```bash
rm components/ui/toast.tsx
rm components/ui/sonner.tsx
rm components/ui/command.tsx
rm components/ui/popover.tsx
rm components/ui/tooltip.tsx
```

## Validation Scripts

### Pre-removal Validation
```bash
#!/bin/bash
# scripts/validate-removal.sh

COMPONENT=$1

echo "Validating removal of $COMPONENT..."

# Check for remaining imports
echo "Checking for imports..."
grep -r "from.*components/ui/$COMPONENT" . --exclude-dir=node_modules

# Check for direct usage
echo "Checking for direct usage..."
grep -r "components/ui/$COMPONENT" . --exclude-dir=node_modules

# Run tests
echo "Running tests..."
npm test -- --testPathPattern="$COMPONENT"

echo "Validation complete for $COMPONENT"
```

### Post-removal Verification
```bash
#!/bin/bash
# scripts/verify-removal.sh

echo "Verifying component removal..."

# Build check
npm run build

# Test suite
npm test

# Type check
npm run typecheck

# Lint check
npm run lint

echo "Verification complete"
```

## Documentation Updates

### Component Migration Guide
For each removed component, create migration documentation:

```markdown
# Button Migration Guide

## Old Usage
```tsx
import { Button } from '@/components/ui/button';

<Button variant="default" size="sm">
  Click me
</Button>
```

## New Usage
```tsx
import { Button } from '@/libs/design-system/primitives/Button';

<Button variant="primary" size="sm">
  Click me
</Button>
```

## Breaking Changes
- `variant="default"` → `variant="primary"`
- New `loading` prop available
- Improved accessibility with ARIA attributes
```

## Success Criteria

### Removal Complete When:
- [ ] All old component files deleted
- [ ] No remaining imports to old components
- [ ] All tests passing
- [ ] Build successful
- [ ] No TypeScript errors
- [ ] Performance metrics maintained or improved
- [ ] User experience unchanged or improved

### Monitoring Metrics
- **Error Rate**: Should not increase during migration
- **Performance**: Bundle size should decrease
- **User Satisfaction**: No increase in support tickets
- **Accessibility**: WCAG compliance maintained or improved
