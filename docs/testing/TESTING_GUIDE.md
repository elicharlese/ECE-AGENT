# Testing Guide

This document provides comprehensive testing guidelines for the ECE-AGENT project, covering unit tests, integration tests, and end-to-end tests.

## Test Structure

### Unit Tests (`__tests__/`)
- **Component Tests**: Located in `__tests__/components/`
- **Hook Tests**: Located in `__tests__/hooks/`
- **API Tests**: Located in `__tests__/api/`

### End-to-End Tests (`tests/e2e/`)
- **Feature Tests**: Playwright tests for complete user workflows
- **Integration Tests**: Cross-component interaction tests

## Feature Flag Testing

### IMMERSIVE_CHAT Feature Flag

The immersive 3D headset view is gated behind the `IMMERSIVE_CHAT` feature flag.

**Environment Setup:**
```bash
# Enable feature flag
NEXT_PUBLIC_IMMERSIVE_CHAT=true

# Disable feature flag  
NEXT_PUBLIC_IMMERSIVE_CHAT=false
```

**Testing Scenarios:**
1. **Feature Enabled**: 3D toggle button visible on desktop, functional immersive view
2. **Feature Disabled**: 3D toggle button hidden, no immersive functionality
3. **Mobile**: 3D toggle always hidden regardless of flag state

**Test Files:**
- `__tests__/components/ChatWindow.immersive-3d.test.tsx` - Unit tests
- `tests/e2e/immersive-3d-toggle.spec.ts` - E2E tests

## Mock Strategy

### CreditsPopover Mock
To prevent `act()` warnings from async fetch calls in tests, the `CreditsPopover` component is mocked in `jest.setup.ts`:

```typescript
jest.mock('@/components/credits/CreditsPopover', () => {
  const React = require('react')
  return {
    CreditsPopover: () => React.createElement('div', { 
      'data-testid': 'credits-popover-mock',
      'aria-label': 'Credits'
    }, React.createElement('span', null, '42'))
  }
})
```

### MSW (Mock Service Worker)
API calls are mocked using MSW handlers in `__tests__/msw/handlers.ts`:
- Credits API endpoints
- Authentication endpoints
- Chat/conversation endpoints

## Running Tests

### Unit Tests
```bash
# Run all tests
npm test

# Run specific test pattern
npm test -- --testNamePattern="ChatWindow"

# Run with coverage
npm test -- --coverage

# Run in watch mode
npm test -- --watch
```

### End-to-End Tests
```bash
# Run Playwright tests
npx playwright test

# Run specific test file
npx playwright test tests/e2e/immersive-3d-toggle.spec.ts

# Run with UI mode
npx playwright test --ui

# Run headed (visible browser)
npx playwright test --headed
```

## Test Utilities

### renderWithAct Helper
For components that trigger async state updates:

```typescript
import { act } from '@testing-library/react'

const renderWithAct = async (component: React.ReactElement) => {
  let result: RenderResult
  await act(async () => {
    result = render(component)
  })
  return result!
}
```

### Feature Flag Testing
```typescript
import { isFeatureEnabled } from '@/lib/feature-flags'

// Mock feature flag in tests
jest.mock('@/lib/feature-flags')
const isFeatureEnabledMock = isFeatureEnabled as jest.MockedFunction<typeof isFeatureEnabled>

// Enable feature for test
isFeatureEnabledMock.mockReturnValue(true)

// Disable feature for test  
isFeatureEnabledMock.mockReturnValue(false)
```

## Common Test Patterns

### Testing Component Rendering
```typescript
test('renders component with expected elements', async () => {
  await renderWithAct(<Component {...props} />)
  
  expect(screen.getByRole('button')).toBeInTheDocument()
  expect(screen.getByText('Expected Text')).toBeInTheDocument()
})
```

### Testing User Interactions
```typescript
test('handles user click events', async () => {
  const mockHandler = jest.fn()
  await renderWithAct(<Component onClick={mockHandler} />)
  
  const button = screen.getByRole('button')
  fireEvent.click(button)
  
  expect(mockHandler).toHaveBeenCalledTimes(1)
})
```

### Testing Async Operations
```typescript
test('handles async operations', async () => {
  await renderWithAct(<Component />)
  
  // Wait for async operation to complete
  await waitFor(() => {
    expect(screen.getByText('Loaded Content')).toBeInTheDocument()
  })
})
```

### Testing Feature Flags
```typescript
test('shows feature when flag enabled', async () => {
  isFeatureEnabledMock.mockReturnValue(true)
  
  await renderWithAct(<Component />)
  
  expect(screen.getByTestId('feature-element')).toBeVisible()
})

test('hides feature when flag disabled', async () => {
  isFeatureEnabledMock.mockReturnValue(false)
  
  await renderWithAct(<Component />)
  
  expect(screen.queryByTestId('feature-element')).not.toBeInTheDocument()
})
```

## Troubleshooting

### Act() Warnings
If you see `act()` warnings:
1. Wrap async operations in `act()`
2. Use `renderWithAct` helper for components with async effects
3. Mock components that make fetch calls (like `CreditsPopover`)

### Feature Flag Issues
1. Ensure environment variables are set correctly
2. Check that feature flag mocks are properly configured
3. Verify feature flag logic in component code

### Playwright Issues
1. Ensure test server is running on correct port
2. Check viewport settings for mobile/desktop tests
3. Use appropriate selectors and wait strategies

## Best Practices

1. **Isolation**: Each test should be independent and not rely on other tests
2. **Mocking**: Mock external dependencies and API calls
3. **Assertions**: Use specific, meaningful assertions
4. **Cleanup**: Ensure proper cleanup of mocks and state between tests
5. **Coverage**: Aim for high test coverage, especially for critical paths
6. **Documentation**: Document complex test scenarios and edge cases

## CI/CD Integration

Tests are automatically run in the CI/CD pipeline:
- Unit tests run on every PR
- E2E tests run on main branch merges
- Coverage reports are generated and tracked
- Feature flag tests ensure proper gating behavior
