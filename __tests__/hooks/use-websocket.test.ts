import { renderHook, act, waitFor } from '@testing-library/react';
import { useWebSocket } from '@/hooks/use-websocket';

// Mock the Supabase client
jest.mock('@/lib/supabase/client', () => ({
  supabase: {
    auth: {
      getSession: jest.fn().mockResolvedValue({
        data: {
          session: {
            access_token: 'test-token'
          }
        },
        error: null
      })
    }
  }
}));

describe('useWebSocket', () => {
  const originalWSUrl = process.env.NEXT_PUBLIC_WEBSOCKET_URL;
  beforeEach(() => {
    jest.clearAllMocks();
    // Force hook into mock-connect path for tests
    delete process.env.NEXT_PUBLIC_WEBSOCKET_URL;
  });

  afterAll(() => {
    if (originalWSUrl !== undefined) {
      process.env.NEXT_PUBLIC_WEBSOCKET_URL = originalWSUrl;
    }
  });

  it('should have connect, sendChatMessage, joinConversation, and leaveConversation functions', async () => {
    const { result } = renderHook(() => useWebSocket());
    
    expect(result.current.connect).toBeDefined();
    expect(result.current.sendChatMessage).toBeDefined();
    expect(result.current.joinConversation).toBeDefined();
    expect(result.current.leaveConversation).toBeDefined();
    // Hook establishes a mock connection on mount
    await waitFor(() => expect(result.current.isConnected).toBe(true));
    expect(result.current.messages).toEqual([]);
  });
});
