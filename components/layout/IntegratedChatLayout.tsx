'use client'

import React, { useState } from 'react'
import { useSidebar } from '@/contexts/sidebar-context'
import { CollapsibleSidebar } from './CollapsibleSidebar'
import { EnhancedChat } from '../chat/EnhancedChat'
import { AgentConnectionPanel, AgentConnection } from '../agent-config/AgentConnectionPanel'
import { MCPModelConfigPanel, MCPModelConfig } from '../agent-config/MCPModelConfig'
import { MessageSquare, Users, Bot, Server, Hash, AtSign, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { PhoneCallUI } from '@/components/calls/phone-call-ui'
import { VideoCallUI } from '@/components/calls/video-call-ui'
// Density is now controlled in Profile Settings
import { useUser } from '@/contexts/user-context'
import { ProfilePopout } from '@/components/messages/profile-popout'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { NewConversationModal } from '@/components/messages/NewConversationModal'

interface Conversation {
  id: string
  name: string
  type: 'dm' | 'group' | 'channel'
  lastMessage?: string
  timestamp?: Date
  unreadCount?: number
  participants?: Array<{
    id: string
    name: string
    avatar?: string
    status?: 'online' | 'offline' | 'away'
  }>
}

export function IntegratedChatLayout() {
  const { leftSidebar, rightSidebar } = useSidebar()
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null)
  const [rightPanel, setRightPanel] = useState<'agents' | 'mcp'>('agents')
  const [agentConnections, setAgentConnections] = useState<AgentConnection[]>([])
  const [mcpConfigs, setMcpConfigs] = useState<MCPModelConfig[]>([])
  const { user } = useUser()
  const currentUserId = user?.id || 'user-unknown'
  const [isPhoneOpen, setIsPhoneOpen] = useState(false)
  const [isVideoOpen, setIsVideoOpen] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const [newModalOpen, setNewModalOpen] = useState(false)

  // Sample conversations
  const [conversations] = useState<Conversation[]>([
    {
      id: '1',
      name: 'Team Chat',
      type: 'group',
      lastMessage: 'Hey everyone, meeting at 3pm',
      timestamp: new Date(),
      unreadCount: 2,
      participants: [
        { id: '1', name: 'Alice', status: 'online' },
        { id: '2', name: 'Bob', status: 'away' },
        { id: '3', name: 'Charlie', status: 'offline' },
      ]
    },
    {
      id: '2',
      name: 'Alice Johnson',
      type: 'dm',
      lastMessage: 'Thanks for the help!',
      timestamp: new Date(Date.now() - 3600000),
      participants: [
        { id: '1', name: 'Alice Johnson', status: 'online' },
      ]
    },
    {
      id: '3',
      name: 'general',
      type: 'channel',
      lastMessage: 'Welcome to the general channel',
      timestamp: new Date(Date.now() - 86400000),
      unreadCount: 5,
    },
  ])

  const getConversationIcon = (type: Conversation['type']) => {
    switch (type) {
      case 'dm': return <AtSign className="h-4 w-4" />
      case 'group': return <Users className="h-4 w-4" />
      case 'channel': return <Hash className="h-4 w-4" />
    }
  }

  const formatTimestamp = (date?: Date) => {
    if (!date) return ''
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const hours = Math.floor(diff / 3600000)
    
    if (hours < 1) return 'Just now'
    if (hours < 24) return `${hours}h ago`
    return date.toLocaleDateString()
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Left Sidebar - Conversations */}
      <CollapsibleSidebar
        side="left"
        minimizedContent={(
          <div className="p-2 space-y-2">
            {conversations.map(conv => (
              <button
                key={conv.id}
                onClick={() => setActiveConversation(conv)}
                className={cn(
                  'w-full p-2 rounded-lg transition-all relative',
                  'hover:bg-accent flex items-center justify-center',
                  activeConversation?.id === conv.id && 'bg-accent'
                )}
                title={conv.name}
              >
                {getConversationIcon(conv.type)}
                {conv.unreadCount && conv.unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full" />
                )}
              </button>
            ))}
            <button
              className="w-full p-2 rounded-lg transition-all hover:bg-accent flex items-center justify-center"
              title="New Conversation"
              onClick={() => setNewModalOpen(true)}
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        )}
      >
        <div className="h-full flex flex-col">
          {/* Sidebar Header */}
          <div className="p-4 border-b flex items-center justify-between">
            <h2 className="font-semibold flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              {leftSidebar === 'expanded' && 'Conversations'}
            </h2>
            <button
              className="ml-2"
              onClick={() => setShowProfile(true)}
              aria-label="Open profile"
              title="Profile"
            >
              <Avatar className="size-8">
                {/* In future we may pull avatar_url from profile. For now, rely on fallback. */}
                <AvatarFallback>{(user?.email?.[0] || 'U').toUpperCase()}</AvatarFallback>
              </Avatar>
            </button>
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto">
            {leftSidebar === 'expanded' ? (
              <div className="p-2 space-y-1">
                {conversations.map(conv => (
                  <button
                    key={conv.id}
                    onClick={() => setActiveConversation(conv)}
                    className={cn(
                      'w-full text-left p-3 rounded-lg transition-all',
                      'hover:bg-accent',
                      activeConversation?.id === conv.id && 'bg-accent'
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">{getConversationIcon(conv.type)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-sm truncate">{conv.name}</p>
                          {conv.unreadCount && conv.unreadCount > 0 && (
                            <span className="px-1.5 py-0.5 bg-primary text-primary-foreground text-xs rounded-full">
                              {conv.unreadCount}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          {conv.lastMessage}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {formatTimestamp(conv.timestamp)}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : leftSidebar === 'minimized' ? (
              <div className="p-2 space-y-2">
                {conversations.map(conv => (
                  <button
                    key={conv.id}
                    onClick={() => setActiveConversation(conv)}
                    className={cn(
                      'w-full p-2 rounded-lg transition-all',
                      'hover:bg-accent flex items-center justify-center',
                      activeConversation?.id === conv.id && 'bg-accent'
                    )}
                    title={conv.name}
                  >
                    {getConversationIcon(conv.type)}
                    {conv.unreadCount && conv.unreadCount > 0 && (
                      <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full" />
                    )}
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          {/* Sidebar Footer */}
          {leftSidebar === 'expanded' && (
            <div className="p-4 border-t">
              <button className="w-full px-3 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90" onClick={() => setNewModalOpen(true)}>
                New Conversation
              </button>
            </div>
          )}
        </div>
      </CollapsibleSidebar>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Density selector moved to Profile Settings */}
        {activeConversation ? (
          <EnhancedChat
            conversationId={activeConversation.id}
            conversationName={activeConversation.name}
            conversationType={activeConversation.type}
            participants={activeConversation.participants || []}
            currentUserId={currentUserId}
            onSendMessage={async (content, media) => {
              console.log('Sending message:', content, media)
              // Implement actual message sending
            }}
            onStartCall={(type) => {
              if (type === 'audio') {
                setIsPhoneOpen(true)
              } else if (type === 'video') {
                setIsVideoOpen(true)
              }
            }}
            onReaction={(messageId, emoji) => {
              console.log('Adding reaction:', messageId, emoji)
              // Implement reaction functionality
            }}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">Select a conversation</p>
              <p className="text-sm mt-2">Choose a conversation from the sidebar to start chatting</p>
            </div>
          </div>
        )}
        {/* Call Popouts */}
        {activeConversation && (
          <>
            <PhoneCallUI
              isOpen={isPhoneOpen}
              onClose={() => setIsPhoneOpen(false)}
              contact={{
                id: activeConversation.id,
                name: activeConversation.name,
              }}
              callType="outgoing"
            />
            <VideoCallUI
              isOpen={isVideoOpen}
              onClose={() => setIsVideoOpen(false)}
              contact={{
                id: activeConversation.id,
                name: activeConversation.name,
              }}
              callType="outgoing"
            />
          </>
        )}
      </div>

      {/* Right Sidebar - AI Agents & MCP Config */}
      <CollapsibleSidebar
        side="right"
        minimizedContent={(
          <div className="flex flex-col gap-2 items-center">
            <button
              onClick={() => setRightPanel('agents')}
              className={cn(
                'p-2 rounded-md transition-colors',
                rightPanel === 'agents' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'hover:bg-accent'
              )}
              title="AI Agents"
            >
              <Bot className="h-4 w-4" />
            </button>
            <button
              onClick={() => setRightPanel('mcp')}
              className={cn(
                'p-2 rounded-md transition-colors',
                rightPanel === 'mcp' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'hover:bg-accent'
              )}
              title="MCP Config"
            >
              <Server className="h-4 w-4" />
            </button>
          </div>
        )}
      >
        <div className="h-full flex flex-col">
          {/* Panel Selector */}
          <div className="p-2 border-b">
            {rightSidebar === 'expanded' ? (
              <div className="flex gap-1">
                <button
                  onClick={() => setRightPanel('agents')}
                  className={cn(
                    'flex-1 px-3 py-1.5 text-sm rounded-md transition-colors',
                    'flex items-center justify-center gap-2',
                    rightPanel === 'agents' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'hover:bg-accent'
                  )}
                >
                  <Bot className="h-4 w-4" />
                  Agents
                </button>
                <button
                  onClick={() => setRightPanel('mcp')}
                  className={cn(
                    'flex-1 px-3 py-1.5 text-sm rounded-md transition-colors',
                    'flex items-center justify-center gap-2',
                    rightPanel === 'mcp' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'hover:bg-accent'
                  )}
                >
                  <Server className="h-4 w-4" />
                  MCP
                </button>
              </div>
            ) : rightSidebar === 'minimized' ? (
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => setRightPanel('agents')}
                  className={cn(
                    'p-2 rounded-md transition-colors',
                    rightPanel === 'agents' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'hover:bg-accent'
                  )}
                  title="AI Agents"
                >
                  <Bot className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setRightPanel('mcp')}
                  className={cn(
                    'p-2 rounded-md transition-colors',
                    rightPanel === 'mcp' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'hover:bg-accent'
                  )}
                  title="MCP Config"
                >
                  <Server className="h-4 w-4" />
                </button>
              </div>
            ) : null}
          </div>

          {/* Panel Content */}
          <div className="flex-1 overflow-hidden">
            {rightSidebar === 'expanded' && (
              <>
                {rightPanel === 'agents' ? (
                  <AgentConnectionPanel
                    connections={agentConnections}
                    onAddConnection={(connection) => {
                      setAgentConnections(prev => [...prev, { 
                        ...connection, 
                        id: Date.now().toString() 
                      }])
                    }}
                    onUpdateConnection={(id, updates) => {
                      setAgentConnections(prev => prev.map(c => 
                        c.id === id ? { ...c, ...updates } : c
                      ))
                    }}
                    onRemoveConnection={(id) => {
                      setAgentConnections(prev => prev.filter(c => c.id !== id))
                    }}
                    onTestConnection={async (id) => {
                      console.log('Testing connection:', id)
                      // Simulate test
                      await new Promise(resolve => setTimeout(resolve, 1000))
                      return true
                    }}
                  />
                ) : (
                  <MCPModelConfigPanel
                    configs={mcpConfigs}
                    onUpdateConfig={(id, updates) => {
                      setMcpConfigs(configs => configs.map(c => 
                        c.id === id ? { ...c, ...updates } : c
                      ))
                    }}
                    onCreateConfig={(config) => {
                      setMcpConfigs(configs => [...configs, { 
                        ...config, 
                        id: Date.now().toString() 
                      }])
                    }}
                    onDeleteConfig={(id) => {
                      setMcpConfigs(configs => configs.filter(c => c.id !== id))
                    }}
                    onTestConfig={async (id) => {
                      console.log('Testing config:', id)
                      return true
                    }}
                  />
                )}
              </>
            )}
          </div>
        </div>
      </CollapsibleSidebar>
      {showProfile && user && (
        <ProfilePopout userId={user.id} onClose={() => setShowProfile(false)} />
      )}
      <NewConversationModal
        open={newModalOpen}
        onOpenChange={setNewModalOpen}
        onCreated={(id) => {
          setNewModalOpen(false)
          setActiveConversation({ id, name: 'New Conversation', type: 'group', participants: [] })
        }}
      />
    </div>
  )
}
