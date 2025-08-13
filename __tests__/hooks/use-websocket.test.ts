import { renderHook, act } from '@testing-library/react';
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
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should have connect, sendChatMessage, joinConversation, and leaveConversation functions', async () => {
    const { result } = renderHook(() => useWebSocket());
    
    expect(result.current.connect).toBeDefined();
    expect(result.current.sendChatMessage).toBeDefined();
    expect(result.current.joinConversation).toBeDefined();
    expect(result.current.leaveConversation).toBeDefined();
    expect(result.current.isConnected).toBe(false);
    expect(result.current.messages).toEqual([]);
  });
});
