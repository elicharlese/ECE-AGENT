'use client'

import { useEffect, useState } from 'react'
import { Search, MessageCircle, Settings, User, Plus, Bot, Users, Loader2 } from 'lucide-react'
import type { Conversation } from '@/services/conversation-service'
import { profileService } from '@/services/profile-service'
import type { Profile } from '@/services/profile-service'

interface ConversationListProps {
  conversations: Conversation[]
  selectedConversation: string | null
  onSelectConversation: (id: string) => void
  onStartDirectMessage: (username: string) => Promise<void>
  onOpenProfile: () => void
  userId: string
  isMobile: boolean
}

export function ConversationList({
  conversations,
  selectedConversation,
  onSelectConversation,
  onStartDirectMessage,
  onOpenProfile,
  userId,
  isMobile
}: ConversationListProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [showNewDm, setShowNewDm] = useState(false)
  const [dmUsername, setDmUsername] = useState('')
  const [isStarting, setIsStarting] = useState(false)
  const [inlineError, setInlineError] = useState<string | null>(null)
  const [lookupLoading, setLookupLoading] = useState(false)
  const [lookupResult, setLookupResult] = useState<Profile | null | undefined>(undefined)

  const filteredConversations = conversations.filter(conv =>
    conv.title?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Separate AI and human conversations
  const aiConversations = filteredConversations.filter(conv => 
    conv.agent_id === 'ai' || conv.title?.includes('AI') || conv.title?.includes('Assistant')
  )
  
  const humanConversations = filteredConversations.filter(conv => 
    conv.agent_id !== 'ai' && !conv.title?.includes('AI') && !conv.title?.includes('Assistant')
  )

  const handleStartDm = async () => {
    setInlineError(null)
    const value = dmUsername.trim()
    if (!value) {
      setInlineError('Please enter a username, email, or user ID')
      return
    }
    try {
      setIsStarting(true)
      await onStartDirectMessage(value)
      setDmUsername('')
      setShowNewDm(false)
      setLookupResult(undefined)
    } catch (e: any) {
      setInlineError(e?.message || 'Failed to start chat')
    } finally {
      setIsStarting(false)
    }
  }

  // Lightweight identifier lookup (username/email/user_id)
  useEffect(() => {
    setInlineError(null)
    const q = dmUsername.trim()
    if (!q) {
      setLookupResult(undefined)
      setLookupLoading(false)
      return
    }
    let active = true
    setLookupLoading(true)
    const handle = window.setTimeout(async () => {
      try {
        const profile = await profileService.getProfileByIdentifier(q)
        if (!active) return
        setLookupResult(profile)
      } catch (err) {
        if (!active) return
        // suppress network errors; show no result
        setLookupResult(null)
      } finally {
        if (active) setLookupLoading(false)
      }
    }, 350)
    return () => {
      active = false
      window.clearTimeout(handle)
    }
  }, [dmUsername])

  return (
    <div className={`${isMobile ? 'w-full' : 'w-80'} bg-white border-r flex flex-col`}>
      {/* Header with user profile */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold">Messages</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowNewDm(true)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Plus className="w-5 h-5 text-gray-600" />
            </button>
            <button
              onClick={onOpenProfile}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <User className="w-5 h-5 text-gray-600" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Settings className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Search bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* New DM input */}
      {showNewDm && (
        <div className="p-4 border-b bg-blue-50">
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Enter username, email, or user ID..."
              value={dmUsername}
              onChange={(e) => setDmUsername(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !isStarting && handleStartDm()}
              className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
            <button
              onClick={handleStartDm}
              disabled={isStarting || !dmUsername.trim()}
              className={`px-4 py-2 rounded-lg text-white ${
                isStarting || !dmUsername.trim()
                  ? 'bg-blue-300 cursor-not-allowed'
                  : 'bg-blue-500 hover:bg-blue-600'
              }`}
            >
              {isStarting ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Starting
                </span>
              ) : (
                'Start'
              )}
            </button>
            <button
              onClick={() => {
                setShowNewDm(false)
                setDmUsername('')
              }}
              disabled={isStarting}
              className={`px-4 py-2 rounded-lg ${
                isStarting ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Cancel
            </button>
          </div>
          {/* Lookup results and inline errors */}
          <div className="mt-2">
            {inlineError && (
              <div className="text-sm text-red-600">{inlineError}</div>
            )}
            {!inlineError && dmUsername.trim() && (
              <div className="text-sm">
                {lookupLoading ? (
                  <div className="text-gray-500">Searching…</div>
                ) : lookupResult === undefined ? null : lookupResult ? (
                  <button
                    onClick={() => setDmUsername(lookupResult.username)}
                    className="w-full text-left px-3 py-2 bg-white rounded-lg border hover:bg-gray-50 flex items-center justify-between"
                  >
                    <span>
                      <span className="font-medium">{lookupResult.full_name || lookupResult.username}</span>
                      <span className="text-gray-500 ml-2">@{lookupResult.username}</span>
                    </span>
                    <span className="text-blue-600 text-xs">Use</span>
                  </button>
                ) : (
                  <div className="text-gray-500">No user found</div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Conversations list */}
      <div className="flex-1 overflow-y-auto">
        {/* AI Conversations Section */}
        {aiConversations.length > 0 && (
          <div className="p-2">
            <div className="flex items-center gap-2 px-2 py-1 text-xs font-semibold text-purple-600 uppercase">
              <Bot className="w-3 h-3" />
              AI Assistants
            </div>
            {aiConversations.map((conversation) => (
              <button
                key={conversation.id}
                onClick={() => onSelectConversation(conversation.id)}
                className={`w-full p-3 flex items-center gap-3 rounded-lg transition-colors ${
                  selectedConversation === conversation.id
                    ? 'bg-purple-100 hover:bg-purple-200'
                    : 'hover:bg-gray-100'
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-purple-600 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 text-left">
                  <div className="font-medium text-gray-900">
                    {conversation.title || 'AI Assistant'}
                  </div>
                  <div className="text-sm text-gray-500 truncate">
                    {conversation.last_message || 'No messages yet'}
                  </div>
                </div>
                {!!conversation.unread_count && conversation.unread_count > 0 && (
                  <div className="px-2 py-1 bg-purple-500 text-white text-xs rounded-full">
                    {conversation.unread_count}
                  </div>
                )}
              </button>
            ))}
          </div>
        )}

        {/* Human Conversations Section */}
        {humanConversations.length > 0 && (
          <div className="p-2">
            <div className="flex items-center gap-2 px-2 py-1 text-xs font-semibold text-blue-600 uppercase">
              <Users className="w-3 h-3" />
              People
            </div>
            {humanConversations.map((conversation) => (
              <button
                key={conversation.id}
                onClick={() => onSelectConversation(conversation.id)}
                className={`w-full p-3 flex items-center gap-3 rounded-lg transition-colors ${
                  selectedConversation === conversation.id
                    ? 'bg-blue-100 hover:bg-blue-200'
                    : 'hover:bg-gray-100'
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 text-left">
                  <div className="font-medium text-gray-900">
                    {conversation.title || 'User'}
                  </div>
                  <div className="text-sm text-gray-500 truncate">
                    {conversation.last_message || 'No messages yet'}
                  </div>
                </div>
                {!!conversation.unread_count && conversation.unread_count > 0 && (
                  <div className="px-2 py-1 bg-blue-500 text-white text-xs rounded-full">
                    {conversation.unread_count}
                  </div>
                )}
              </button>
            ))}
          </div>
        )}

        {/* Empty state */}
        {conversations.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            <MessageCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No conversations yet</p>
            <p className="text-sm mt-1">Start a new chat to get started</p>
          </div>
        )}
      </div>
    </div>
  )
}
