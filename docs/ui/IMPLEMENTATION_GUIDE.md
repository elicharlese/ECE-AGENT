# UI Rebuild Implementation Guide

## Immediate Next Steps

### 1. Create Design System Foundation

```bash
# Create new design system structure
mkdir -p libs/design-system/{tokens,primitives,patterns,utils}
mkdir -p libs/design-system/primitives/{Button,Input,Card,Dialog,Layout}
mkdir -p libs/design-system/patterns/{Navigation,Forms,DataDisplay,Feedback}
```

### 2. Setup Design Tokens

```typescript
// libs/design-system/tokens/colors.ts
export const colors = {
  // Semantic colors
  primary: {
    50: 'hsl(222, 47%, 95%)',
    100: 'hsl(222, 47%, 90%)',
    500: 'hsl(222, 47%, 50%)',
    900: 'hsl(222, 47%, 11%)',
  },
  // ... other color scales
} as const;

// libs/design-system/tokens/spacing.ts
export const spacing = {
  0: '0',
  1: '0.25rem', // 4px
  2: '0.5rem',  // 8px
  3: '0.75rem', // 12px
  4: '1rem',    // 16px
  6: '1.5rem',  // 24px
  8: '2rem',    // 32px
  12: '3rem',   // 48px
  16: '4rem',   // 64px
} as const;
```

### 3. Create Component Primitives

```typescript
// libs/design-system/primitives/Button/Button.tsx
import { cva, type VariantProps } from 'class-variance-authority';
import { forwardRef } from 'react';
import { cn } from '@/libs/design-system/utils';

const buttonVariants = cva(
  // Base styles
  'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
      },
      size: {
        sm: 'h-9 px-3',
        md: 'h-10 px-4 py-2',
        lg: 'h-11 px-8',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, leftIcon, rightIcon, children, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={loading || props.disabled}
        {...props}
      >
        {loading && <Spinner className="mr-2 h-4 w-4" />}
        {leftIcon && <span className="mr-2">{leftIcon}</span>}
        {children}
        {rightIcon && <span className="ml-2">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';
```

### 4. Migration Scripts

```typescript
// scripts/migrate-components.ts
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

interface MigrationConfig {
  oldPath: string;
  newPath: string;
  componentName: string;
  propMappings?: Record<string, string>;
}

const MIGRATIONS: MigrationConfig[] = [
  {
    oldPath: 'components/ui/button',
    newPath: 'libs/design-system/primitives/Button',
    componentName: 'Button',
    propMappings: {
      'variant="default"': 'variant="primary"',
    },
  },
  // Add more migrations...
];

export function runMigration(config: MigrationConfig) {
  console.log(`Migrating ${config.componentName}...`);
  
  // Find all files using the old component
  const files = execSync(`grep -r "from.*${config.oldPath}" . --include="*.tsx" --include="*.ts"`)
    .toString()
    .split('\n')
    .filter(Boolean);
  
  files.forEach(file => {
    const filePath = file.split(':')[0];
    let content = fs.readFileSync(filePath, 'utf-8');
    
    // Replace import
    content = content.replace(
      new RegExp(`from ['"]${config.oldPath}['"]`, 'g'),
      `from '${config.newPath}'`
    );
    
    // Apply prop mappings
    if (config.propMappings) {
      Object.entries(config.propMappings).forEach(([oldProp, newProp]) => {
        content = content.replace(new RegExp(oldProp, 'g'), newProp);
      });
    }
    
    fs.writeFileSync(filePath, content);
  });
  
  console.log(`✓ Migrated ${files.length} files for ${config.componentName}`);
}
```

### 5. Feature Flag System

```typescript
// libs/feature-flags/index.ts
export interface FeatureFlags {
  NEW_BUTTON: boolean;
  NEW_INPUT: boolean;
  NEW_DIALOG: boolean;
  NEW_LAYOUT: boolean;
}

export const getFeatureFlags = (): FeatureFlags => ({
  NEW_BUTTON: process.env.NEXT_PUBLIC_NEW_BUTTON === 'true',
  NEW_INPUT: process.env.NEXT_PUBLIC_NEW_INPUT === 'true',
  NEW_DIALOG: process.env.NEXT_PUBLIC_NEW_DIALOG === 'true',
  NEW_LAYOUT: process.env.NEXT_PUBLIC_NEW_LAYOUT === 'true',
});

// components/ui/button.tsx (transition wrapper)
import { getFeatureFlags } from '@/libs/feature-flags';
import { Button as NewButton } from '@/libs/design-system/primitives/Button';
import { Button as LegacyButton } from './button-legacy';

const flags = getFeatureFlags();

export const Button = flags.NEW_BUTTON ? NewButton : LegacyButton;
```

## Execution Plan

### Week 1: Foundation Setup

```bash
# Day 1-2: Create structure
npm run setup-design-system

# Day 3-4: Implement tokens and utilities
npm run build-tokens

# Day 5: Create first primitive (Button)
npm run create-button-primitive
```

### Week 2: Core Primitives

```bash
# Implement essential components
npm run create-input-primitive
npm run create-card-primitive
npm run create-dialog-primitive
```

### Week 3-4: Migration Infrastructure

```bash
# Setup migration tools
npm run setup-migration-scripts

# Create feature flag system
npm run setup-feature-flags

# Begin gradual rollout
npm run migrate-button -- --percentage=25
```

## Testing Strategy

### Component Tests

```typescript
// libs/design-system/primitives/Button/Button.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from './Button';

describe('Button', () => {
  it('renders with correct variant styles', () => {
    render(<Button variant="primary">Test</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-primary');
  });

  it('handles loading state', () => {
    render(<Button loading>Test</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
    expect(screen.getByTestId('spinner')).toBeInTheDocument();
  });

  it('supports keyboard navigation', async () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Test</Button>);
    
    await userEvent.tab();
    expect(screen.getByRole('button')).toHaveFocus();
    
    await userEvent.keyboard('{Enter}');
    expect(handleClick).toHaveBeenCalled();
  });
});
```

### Visual Regression Tests

```typescript
// __tests__/visual/button.visual.test.ts
import { test, expect } from '@playwright/test';

test.describe('Button Visual Tests', () => {
  test('button variants', async ({ page }) => {
    await page.goto('/test/button-variants');
    await expect(page).toHaveScreenshot('button-variants.png');
  });

  test('button states', async ({ page }) => {
    await page.goto('/test/button-states');
    await expect(page).toHaveScreenshot('button-states.png');
  });
});
```

## Monitoring & Rollback

### Performance Monitoring

```typescript
// libs/monitoring/performance.ts
export function trackComponentPerformance(componentName: string, renderTime: number) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'component_performance', {
      component_name: componentName,
      render_time: renderTime,
      timestamp: Date.now(),
    });
  }
}

// Usage in components
const Button = (props) => {
  const startTime = performance.now();
  
  useEffect(() => {
    const endTime = performance.now();
    trackComponentPerformance('Button', endTime - startTime);
  }, []);
  
  // ... component logic
};
```

### Error Boundary

```typescript
// libs/design-system/utils/ErrorBoundary.tsx
export class ComponentErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, componentName: props.componentName };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error(`Error in ${this.state.componentName}:`, error, errorInfo);
    
    // Track error
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'component_error', {
        component_name: this.state.componentName,
        error_message: error.message,
        error_stack: error.stack,
      });
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 border border-red-200 rounded-md bg-red-50">
          <p className="text-red-800">Component Error: {this.state.componentName}</p>
        </div>
      );
    }

    return this.props.children;
  }
}
```

## Package.json Scripts

```json
{
  "scripts": {
    "setup-design-system": "tsx scripts/setup-design-system.ts",
    "build-tokens": "tsx scripts/build-tokens.ts",
    "create-primitive": "tsx scripts/create-primitive.ts",
    "migrate-component": "tsx scripts/migrate-component.ts",
    "validate-migration": "tsx scripts/validate-migration.ts",
    "rollback-component": "tsx scripts/rollback-component.ts",
    "test:visual": "playwright test --config=playwright.visual.config.ts",
    "test:components": "jest --testPathPattern=design-system",
    "analyze-bundle": "npm run build && npx bundle-analyzer"
  }
}
```

## Success Metrics Dashboard

```typescript
// Create monitoring dashboard for migration progress
export interface MigrationMetrics {
  componentsTotal: number;
  componentsMigrated: number;
  migrationPercentage: number;
  performanceImpact: number;
  errorRate: number;
  userSatisfaction: number;
}

export function getMigrationMetrics(): MigrationMetrics {
  // Implementation to track migration progress
}
```

This implementation guide provides the concrete steps to begin the UI rebuild process safely and systematically. The approach prioritizes maintaining functionality while gradually introducing the new design system.
