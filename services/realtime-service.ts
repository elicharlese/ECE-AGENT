import { supabase } from '@/lib/supabase/client'
import type { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js'

type MessagePayload = RealtimePostgresChangesPayload<{
  [key: string]: any
}>

type PresenceState = {
  [key: string]: any[]
}

interface RealtimeCallbacks {
  onMessage?: (payload: MessagePayload) => void
  onTyping?: (userId: string, isTyping: boolean) => void
  onPresence?: (presenceState: PresenceState) => void
  onConversationUpdate?: (payload: any) => void
}

class RealtimeService {
  private channels: Map<string, RealtimeChannel> = new Map()
  private presenceChannel: RealtimeChannel | null = null

  // Subscribe to conversation messages
  subscribeToConversation(
    conversationId: string,
    callbacks: RealtimeCallbacks
  ): () => void {
    // Clean up existing subscription
    this.unsubscribeFromConversation(conversationId)

    const channel = supabase.channel(`conversation:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          callbacks.onMessage?.(payload)
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          callbacks.onMessage?.(payload)
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          callbacks.onMessage?.(payload)
        }
      )
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState()
        callbacks.onPresence?.(state)
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }: any) => {
        const state = channel.presenceState()
        callbacks.onPresence?.(state)
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }: any) => {
        const state = channel.presenceState()
        callbacks.onPresence?.(state)
      })
      .subscribe()

    this.channels.set(conversationId, channel)

    // Return cleanup function
    return () => {
      this.unsubscribeFromConversation(conversationId)
    }
  }

  // Unsubscribe from conversation
  unsubscribeFromConversation(conversationId: string) {
    const channel = this.channels.get(conversationId)
    if (channel) {
      supabase.removeChannel(channel)
      this.channels.delete(conversationId)
    }
  }

  // Track user presence
  async trackPresence(conversationId: string, userId: string, userData: any) {
    const channel = this.channels.get(conversationId)
    if (channel) {
      await channel.track({
        user_id: userId,
        online_at: new Date().toISOString(),
        ...userData,
      })
    }
  }

  // Update user presence
  async updatePresence(conversationId: string, userData: any) {
    const channel = this.channels.get(conversationId)
    if (channel) {
      await channel.track(userData)
    }
  }

  // Send typing indicator
  async sendTypingIndicator(conversationId: string, userId: string, isTyping: boolean) {
    const channel = this.channels.get(conversationId)
    if (channel) {
      await channel.send({
        type: 'broadcast',
        event: 'typing',
        payload: { user_id: userId, is_typing: isTyping },
      })
    }
  }

  // Subscribe to user status updates
  subscribeToUserStatus(userId: string, callback: (status: any) => void) {
    const channel = supabase.channel(`user:${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${userId}`,
        },
        (payload: any) => {
          callback(payload.new)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }

  // Subscribe to all conversations for a user
  subscribeToUserConversations(userId: string, callback: (payload: any) => void) {
    const channel = supabase.channel(`user-conversations:${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversation_participants',
          filter: `user_id=eq.${userId}`,
        },
        (payload: any) => {
          callback(payload)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }

  // Subscribe to global presence
  subscribeToGlobalPresence(callback: (presenceState: any) => void) {
    const channel = supabase.channel('global:presence')
      .on(
        'presence',
        { event: 'sync' },
        () => {
          const state = channel.presenceState()
          callback(state)
        }
      )
      .subscribe()

    this.presenceChannel = channel

    return () => {
      if (this.presenceChannel) {
        supabase.removeChannel(this.presenceChannel)
        this.presenceChannel = null
      }
    }
  }

  // Clean up all subscriptions
  cleanup() {
    this.channels.forEach((channel) => {
      supabase.removeChannel(channel)
    })
    this.channels.clear()

    if (this.presenceChannel) {
      supabase.removeChannel(this.presenceChannel)
      this.presenceChannel = null
    }
  }
}

// Export singleton instance
export const realtimeService = new RealtimeService()
