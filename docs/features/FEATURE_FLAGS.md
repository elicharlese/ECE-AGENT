# Feature Flags Guide

This document describes the feature flag system used in ECE-AGENT to control feature rollouts and enable/disable functionality.

## Overview

Feature flags allow us to:
- Safely deploy new features behind toggles
- Perform A/B testing and gradual rollouts
- Quickly disable problematic features
- Test features in different environments

## Available Feature Flags

### IMMERSIVE_CHAT

**Description**: Controls the immersive 3D headset view toggle in chat windows.

**Environment Variable**: `NEXT_PUBLIC_IMMERSIVE_CHAT`

**Values**:
- `true` - Enable 3D headset view toggle (desktop only)
- `false` - Disable 3D headset view toggle
- `undefined` - Defaults to `false`

**Usage**:
```typescript
import { isFeatureEnabled } from '@/lib/feature-flags'

const show3DToggle = isFeatureEnabled('IMMERSIVE_CHAT') && !isMobile
```

**Components Affected**:
- `components/chat/enhanced-chat-header.tsx` - Toggle button visibility
- `components/chat/chat-window.tsx` - 3D view rendering
- `components/chat/Headset3DView.tsx` - 3D view implementation

**Testing**:
- Unit tests: `__tests__/components/ChatWindow.immersive-3d.test.tsx`
- E2E tests: `tests/e2e/immersive-3d-toggle.spec.ts`

### CREDITS_ENABLED

**Description**: Controls the display of credits-related UI components.

**Environment Variable**: `NEXT_PUBLIC_CREDITS_ENABLED`

**Values**:
- `true` - Show credits UI (balance, purchase buttons, estimates)
- `false` - Hide credits UI
- `undefined` - Defaults to `true`

**Components Affected**:
- `components/credits/CreditsPopover.tsx` - Credits balance display
- `components/chat/mobile-message-input.tsx` - Credit estimates
- `components/chat/enhanced-chat-header.tsx` - Credit badge

## Implementation

### Feature Flag Function

```typescript
// lib/feature-flags.ts
export function isFeatureEnabled(flag: string): boolean {
  const value = process.env[`NEXT_PUBLIC_${flag}`]
  return value === 'true'
}
```

### Usage Patterns

#### Component Conditional Rendering
```typescript
import { isFeatureEnabled } from '@/lib/feature-flags'

export function MyComponent() {
  const showNewFeature = isFeatureEnabled('NEW_FEATURE')
  
  return (
    <div>
      {showNewFeature && <NewFeatureComponent />}
      <ExistingComponent />
    </div>
  )
}
```

#### Hook-based Feature Flags
```typescript
import { useMemo } from 'react'
import { isFeatureEnabled } from '@/lib/feature-flags'

export function useFeatureFlag(flag: string) {
  return useMemo(() => isFeatureEnabled(flag), [flag])
}
```

#### Combined Conditions
```typescript
const showFeature = isFeatureEnabled('FEATURE_FLAG') && 
                   !isMobile && 
                   userHasPermission
```

## Environment Configuration

### Development
```bash
# .env.local
NEXT_PUBLIC_IMMERSIVE_CHAT=true
NEXT_PUBLIC_CREDITS_ENABLED=true
```

### Production
```bash
# Environment variables in deployment
NEXT_PUBLIC_IMMERSIVE_CHAT=false
NEXT_PUBLIC_CREDITS_ENABLED=true
```

### Testing
```bash
# Test environment
NEXT_PUBLIC_IMMERSIVE_CHAT=true  # Enable for testing
NEXT_PUBLIC_CREDITS_ENABLED=false  # Disable to avoid API calls
```

## Testing Feature Flags

### Unit Tests
```typescript
import { isFeatureEnabled } from '@/lib/feature-flags'

jest.mock('@/lib/feature-flags')
const isFeatureEnabledMock = isFeatureEnabled as jest.MockedFunction<typeof isFeatureEnabled>

describe('Feature Flag Tests', () => {
  test('shows feature when enabled', () => {
    isFeatureEnabledMock.mockReturnValue(true)
    // Test feature enabled behavior
  })
  
  test('hides feature when disabled', () => {
    isFeatureEnabledMock.mockReturnValue(false)
    // Test feature disabled behavior
  })
})
```

### E2E Tests
```typescript
// Set environment variable before test
process.env.NEXT_PUBLIC_FEATURE_FLAG = 'true'

test('feature works when flag enabled', async ({ page }) => {
  // Test feature functionality
})
```

## Best Practices

### 1. Naming Conventions
- Use SCREAMING_SNAKE_CASE for flag names
- Prefix with `NEXT_PUBLIC_` for client-side access
- Use descriptive names that indicate the feature

### 2. Default Values
- Always provide sensible defaults
- Document the default behavior
- Consider backwards compatibility

### 3. Cleanup
- Remove feature flags after full rollout
- Update documentation when flags are removed
- Clean up related test code

### 4. Testing
- Test both enabled and disabled states
- Include feature flag tests in CI/CD
- Test flag combinations and edge cases

### 5. Documentation
- Document all feature flags and their purpose
- Include usage examples
- Maintain up-to-date flag status

## Rollout Strategy

### Phase 1: Development
- Enable flag in development environment
- Implement feature behind flag
- Add comprehensive tests

### Phase 2: Staging
- Enable flag in staging environment
- Perform integration testing
- Validate feature behavior

### Phase 3: Production (Gradual)
- Enable for internal users first
- Monitor metrics and error rates
- Gradually expand to all users

### Phase 4: Cleanup
- Remove feature flag code
- Update documentation
- Clean up environment variables

## Monitoring

### Metrics to Track
- Feature usage rates
- Error rates when feature enabled/disabled
- Performance impact
- User feedback

### Alerting
- Set up alerts for feature flag changes
- Monitor error rates after flag toggles
- Track feature adoption metrics

## Troubleshooting

### Common Issues

1. **Flag not working in browser**
   - Ensure `NEXT_PUBLIC_` prefix is used
   - Check environment variable is set correctly
   - Verify build includes the environment variable

2. **Tests failing with feature flags**
   - Mock the feature flag function properly
   - Set up test environment variables
   - Clean up mocks between tests

3. **Inconsistent behavior**
   - Check for caching issues
   - Verify flag evaluation logic
   - Ensure proper cleanup in tests

### Debugging
```typescript
// Add logging to debug feature flags
console.log('Feature flag IMMERSIVE_CHAT:', isFeatureEnabled('IMMERSIVE_CHAT'))
console.log('Environment variables:', process.env)
```

## Migration Guide

When removing a feature flag:

1. **Assess Impact**: Ensure feature is stable and widely adopted
2. **Update Code**: Remove conditional logic, keep feature enabled
3. **Clean Environment**: Remove environment variables
4. **Update Tests**: Remove flag-specific test cases
5. **Update Documentation**: Remove flag references
6. **Deploy**: Deploy changes with feature permanently enabled
