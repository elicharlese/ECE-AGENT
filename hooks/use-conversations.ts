"use client"

import { useState, useEffect } from 'react'
import { Conversation } from '@/services/conversation-service'
import * as conversationService from '@/services/conversation-service'
import { supabase } from '@/lib/supabase/client'

export function useConversations() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchConversations = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await conversationService.getConversations()
      setConversations(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch conversations')
      console.error('Error fetching conversations:', err)
    } finally {
      setLoading(false)
    }
  }

  const createConversation = async (title: string) => {
    try {
      const newConversation = await conversationService.createConversation(title)
      setConversations(prev => [newConversation, ...prev])
      return newConversation
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create conversation')
      console.error('Error creating conversation:', err)
      throw err
    }
  }

  const createConversationWithParticipants = async (
    title: string,
    participantIds: string[] = [],
    agentId?: string,
  ) => {
    try {
      const newConversation = await conversationService.createConversationWithParticipants(
        title,
        participantIds,
        agentId,
      )
      setConversations(prev => [newConversation, ...prev])
      return newConversation
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create conversation')
      console.error('Error creating conversation with participants:', err)
      throw err
    }
  }

  const updateConversation = async (id: string, updates: Partial<Conversation>) => {
    try {
      const updatedConversation = await conversationService.updateConversation(id, updates)
      setConversations(prev => 
        prev.map(conv => conv.id === id ? updatedConversation : conv)
      )
      return updatedConversation
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update conversation')
      console.error('Error updating conversation:', err)
      throw err
    }
  }

  const deleteConversation = async (id: string) => {
    try {
      await conversationService.deleteConversation(id)
      setConversations(prev => prev.filter(conv => conv.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete conversation')
      console.error('Error deleting conversation:', err)
      throw err
    }
  }

  // New actions
  const pinConversation = async (conversationId: string, pinned: boolean) => {
    try {
      await conversationService.pinConversation(conversationId, pinned)
      await fetchConversations()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to pin conversation')
      throw err
    }
  }

  const archiveConversation = async (conversationId: string, archived: boolean) => {
    try {
      await conversationService.archiveConversation(conversationId, archived)
      await fetchConversations()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to archive conversation')
      throw err
    }
  }

  const leaveConversation = async (conversationId: string) => {
    try {
      await conversationService.leaveConversation(conversationId)
      setConversations(prev => prev.filter(c => c.id !== conversationId))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to leave conversation')
      throw err
    }
  }

  const inviteParticipants = async (conversationId: string, userIds: string[]) => {
    try {
      await conversationService.inviteParticipants(conversationId, userIds)
      // No change to list needed; server will emit participant events
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to invite participants')
      throw err
    }
  }

  useEffect(() => {
    fetchConversations()
    // Subscribe to conversation updates so sidebar stays fresh
    const channel = supabase
      .channel('conversations-changes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'conversations' }, () => {
        fetchConversations()
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'conversations' }, () => {
        fetchConversations()
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'conversations' }, () => {
        fetchConversations()
      })
      // Listen for membership flag changes and joins/leaves
      .on('postgres_changes', { event: '*', schema: 'public', table: 'conversation_participants' }, () => {
        fetchConversations()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  return {
    conversations,
    loading,
    error,
    fetchConversations,
    createConversation,
    createConversationWithParticipants,
    updateConversation,
    deleteConversation,
    pinConversation,
    archiveConversation,
    leaveConversation,
    inviteParticipants,
  }
}
