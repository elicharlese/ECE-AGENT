"use client"

import { useState, useEffect } from 'react'
import { Conversation } from '@/services/conversation-service'
import * as conversationService from '@/services/conversation-service'

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

  useEffect(() => {
    fetchConversations()
  }, [])

  return {
    conversations,
    loading,
    error,
    fetchConversations,
    createConversation,
    updateConversation,
    deleteConversation
  }
}
