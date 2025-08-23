import { useEffect, useRef, useCallback } from 'react'
import { realtimeService } from '@/services/realtime-service'
import { useToast } from '@/hooks/use-toast'

interface UseRealtimeOptions {
  conversationId?: string
  userId?: string
  onMessage?: (payload: any) => void
  onTyping?: (userId: string, isTyping: boolean) => void
  onPresence?: (presenceState: any) => void
  onConversationUpdate?: (payload: any) => void
}

export function useRealtime({
  conversationId,
  userId,
  onMessage,
  onTyping,
  onPresence,
  onConversationUpdate,
}: UseRealtimeOptions) {
  const { toast } = useToast()
  const cleanupRef = useRef<(() => void) | null>(null)

  // Subscribe to conversation
  useEffect(() => {
    if (!conversationId) return

    cleanupRef.current = realtimeService.subscribeToConversation(conversationId, {
      onMessage: (payload) => {
        onMessage?.(payload)
        
        // Show notification for new messages
        if (payload.eventType === 'INSERT' && payload.new) {
          const message = payload.new
          if (message.sender_id !== userId) {
            toast({
              title: 'New message',
              description: message.content.substring(0, 50) + '...',
            })
          }
        }
      },
      onTyping,
      onPresence,
      onConversationUpdate,
    })

    // Track user presence
    if (userId) {
      realtimeService.trackPresence(conversationId, userId, {
        status: 'online',
        last_seen: new Date().toISOString(),
      })
    }

    return () => {
      cleanupRef.current?.()
    }
  }, [conversationId, userId, onMessage, onTyping, onPresence, onConversationUpdate])

  // Send typing indicator
  const sendTypingIndicator = useCallback(
    (isTyping: boolean) => {
      if (conversationId && userId) {
        realtimeService.sendTypingIndicator(conversationId, userId, isTyping)
      }
    },
    [conversationId, userId]
  )

  // Update presence
  const updatePresence = useCallback(
    (data: any) => {
      if (conversationId) {
        realtimeService.updatePresence(conversationId, data)
      }
    },
    [conversationId]
  )

  return {
    sendTypingIndicator,
    updatePresence,
  }
}

// Hook for global presence
export function useGlobalPresence(callback: (presenceState: any) => void) {
  useEffect(() => {
    const cleanup = realtimeService.subscribeToGlobalPresence(callback)
    return cleanup
  }, [callback])
}

// Hook for user status
export function useUserStatus(userId: string, callback: (status: any) => void) {
  useEffect(() => {
    if (!userId) return
    const cleanup = realtimeService.subscribeToUserStatus(userId, callback)
    return cleanup
  }, [userId, callback])
}

// Hook for user conversations
export function useUserConversations(userId: string, callback: (payload: any) => void) {
  useEffect(() => {
    if (!userId) return
    const cleanup = realtimeService.subscribeToUserConversations(userId, callback)
    return cleanup
  }, [userId, callback])
}
