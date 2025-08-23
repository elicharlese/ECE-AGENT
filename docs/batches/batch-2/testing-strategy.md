# Testing Strategy - Batch 2

## Testing Goals
- Achieve 95% code coverage
- Zero critical bugs in production
- < 5% test flakiness
- < 10 minute CI/CD pipeline

## Testing Pyramid

### 1. Unit Tests (70%)

#### Component Testing
```typescript
// __tests__/components/messages/message-item.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { MessageItem } from '@/components/messages/message-item';

describe('MessageItem', () => {
  it('renders message content', () => {
    const message = mockMessage();
    render(<MessageItem message={message} />);
    expect(screen.getByText(message.content)).toBeInTheDocument();
  });
  
  it('handles reactions', async () => {
    const onReact = jest.fn();
    render(<MessageItem message={mockMessage()} onReact={onReact} />);
    
    fireEvent.click(screen.getByRole('button', { name: /react/i }));
    await screen.findByRole('dialog');
    fireEvent.click(screen.getByText('👍'));
    
    expect(onReact).toHaveBeenCalledWith('👍');
  });
});
```

#### Service Testing
```typescript
// __tests__/services/realtime-service.test.ts
describe('RealtimeService', () => {
  let service: RealtimeService;
  let mockSupabase: jest.Mocked<SupabaseClient>;
  
  beforeEach(() => {
    mockSupabase = createMockSupabase();
    service = new RealtimeService(mockSupabase);
  });
  
  it('subscribes to conversation messages', async () => {
    const callback = jest.fn();
    await service.subscribeToConversation('conv-1', callback);
    
    mockSupabase.channel.mockTrigger('INSERT', mockMessage());
    
    expect(callback).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'message', payload: mockMessage() })
    );
  });
});
```

### 2. Integration Tests (20%)

#### API Integration
```typescript
// __tests__/integration/messages-api.test.ts
describe('Messages API Integration', () => {
  it('creates and retrieves messages', async () => {
    const message = await createMessage({
      content: 'Test message',
      conversation_id: 'test-conv'
    });
    
    expect(message.id).toBeDefined();
    
    const retrieved = await getMessage(message.id);
    expect(retrieved.content).toBe('Test message');
  });
  
  it('handles real-time updates', async () => {
    const updates = [];
    subscribeToUpdates((update) => updates.push(update));
    
    await createMessage({ content: 'Realtime test' });
    await waitFor(() => expect(updates).toHaveLength(1));
    
    expect(updates[0].content).toBe('Realtime test');
  });
});
```

### 3. E2E Tests (10%)

#### Critical User Flows
```typescript
// __tests__/e2e/messaging-flow.test.ts
import { test, expect } from '@playwright/test';

test('complete messaging flow', async ({ page }) => {
  // Login
  await page.goto('/auth');
  await page.fill('[name="email"]', 'test@example.com');
  await page.fill('[name="password"]', 'password');
  await page.click('[type="submit"]');
  
  // Navigate to messages
  await page.waitForURL('/messages');
  
  // Send message
  await page.fill('[data-testid="message-input"]', 'Hello World');
  await page.press('[data-testid="message-input"]', 'Enter');
  
  // Verify message appears
  await expect(page.locator('text=Hello World')).toBeVisible();
  
  // Add reaction
  await page.hover('[data-testid="message-item"]');
  await page.click('[data-testid="react-button"]');
  await page.click('text=👍');
  
  // Verify reaction
  await expect(page.locator('[data-testid="reaction-👍"]')).toBeVisible();
});
```

## Testing Infrastructure

### Test Data Management
```typescript
// __tests__/fixtures/index.ts
export const fixtures = {
  user: () => ({
    id: faker.datatype.uuid(),
    email: faker.internet.email(),
    name: faker.name.fullName()
  }),
  
  conversation: (overrides = {}) => ({
    id: faker.datatype.uuid(),
    title: faker.lorem.sentence(),
    created_at: faker.date.past(),
    ...overrides
  }),
  
  message: (overrides = {}) => ({
    id: faker.datatype.uuid(),
    content: faker.lorem.paragraph(),
    user_id: fixtures.user().id,
    conversation_id: fixtures.conversation().id,
    ...overrides
  })
};
```

### Mock Services
```typescript
// __tests__/mocks/supabase.ts
export function createMockSupabase() {
  return {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockResolvedValue({ data: [], error: null }),
    update: jest.fn().mockResolvedValue({ data: [], error: null }),
    delete: jest.fn().mockResolvedValue({ data: [], error: null }),
    channel: createMockChannel(),
    auth: createMockAuth()
  };
}
```

## Performance Testing

### Load Testing
```javascript
// k6/load-test.js
import http from 'k6/http';
import { check } from 'k6';

export const options = {
  stages: [
    { duration: '2m', target: 100 },
    { duration: '5m', target: 100 },
    { duration: '2m', target: 200 },
    { duration: '5m', target: 200 },
    { duration: '2m', target: 0 }
  ]
};

export default function() {
  const response = http.post('https://api.example.com/messages', {
    content: 'Load test message',
    conversation_id: 'test-conv'
  });
  
  check(response, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500
  });
}
```

## Accessibility Testing

### Automated Testing
```typescript
// __tests__/a11y/messages.test.tsx
import { axe } from 'jest-axe';

describe('Accessibility', () => {
  it('messages page has no violations', async () => {
    const { container } = render(<MessagesPage />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
```

## Security Testing

### Penetration Testing
```yaml
# .github/workflows/security.yml
security-scan:
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v3
    - name: Run OWASP ZAP
      uses: zaproxy/action-full-scan@v0.4.0
      with:
        target: 'https://staging.example.com'
    - name: Run Snyk
      uses: snyk/actions/node@master
      env:
        SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
```

## CI/CD Integration

### Test Pipeline
```yaml
# .github/workflows/test.yml
name: Test Suite
on: [push, pull_request]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm ci
      - run: npm run test:unit
      - uses: codecov/codecov-action@v3
  
  integration-tests:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: supabase/postgres
    steps:
      - uses: actions/checkout@v3
      - run: npm ci
      - run: npm run test:integration
  
  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm ci
      - run: npx playwright install
      - run: npm run test:e2e
```

## Test Coverage Requirements

### Coverage Targets
- Statements: 95%
- Branches: 90%
- Functions: 95%
- Lines: 95%

### Critical Path Coverage
- Authentication: 100%
- Message sending: 100%
- Real-time updates: 100%
- Data encryption: 100%

## Success Metrics
- All tests passing in CI
- < 5% test flakiness
- < 10 minute test execution
- 95% code coverage
- Zero critical vulnerabilities
