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
import { ContactsManager } from '@/components/chat/contacts-manager'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { NewConversationModal } from '@/components/messages/NewConversationModal'
import { useConversations } from '@/hooks/use-conversations'
import { useSendMessage, useDeleteMessage, useEditMessage } from '@/hooks/use-messages'
import { supabase } from '@/lib/supabase/client'
import { usePresence } from '@/hooks/use-presence'
import { getProfileByIdentifier } from '@/services/profile-service'
import { createConversationWithParticipants } from '@/services/conversation-service'
import { toast } from '@/components/ui/use-toast'
import { Skeleton } from '@/components/ui/skeleton'
import { aiService } from '@/services/ai-service'

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
  const [selectedAgentByConversation, setSelectedAgentByConversation] = useState<Record<string, string | undefined>>({})
  const [mcpConfigs, setMcpConfigs] = useState<MCPModelConfig[]>([])
  const { user } = useUser()
  const currentUserId = user?.id || 'user-unknown'
  const [isPhoneOpen, setIsPhoneOpen] = useState(false)
  const [isVideoOpen, setIsVideoOpen] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const [newModalOpen, setNewModalOpen] = useState(false)
  const { conversations, loading, error } = useConversations()
  const sendMessage = useSendMessage()
  const deleteMessage = useDeleteMessage()
  const editMessage = useEditMessage()
  const [activeParticipants, setActiveParticipants] = useState<Array<{ id: string; name: string; avatar?: string; status?: 'online' | 'offline' | 'away' }>>([])
  const { onlineIds, onlineArray } = usePresence(activeConversation?.id, currentUserId)
  const [headerProfile, setHeaderProfile] = React.useState<{ user_id: string; username?: string | null; avatar_url?: string | null } | null>(null)
  const [clearedUnread, setClearedUnread] = React.useState<Set<string>>(new Set())

  // Map service conversations to UI shape
  const displayConversations: Conversation[] = React.useMemo(() => {
    return (conversations || []).map((c: any) => ({
      id: c.id,
      name: c.title,
      type: c.agent_id === 'dm' ? 'dm' : 'group',
      lastMessage: c.last_message,
      timestamp: c.updated_at ? new Date(c.updated_at) : undefined,
      unreadCount: clearedUnread.has(c.id) ? 0 : c.unread_count,
      participants: [],
    }))
  }, [conversations, clearedUnread])

  const selectConversation = React.useCallback((conv: Conversation) => {
    setActiveConversation(conv)
    setClearedUnread(prev => {
      const next = new Set(prev)
      next.add(conv.id)
      return next
    })
  }, [])

  // Auto-select first conversation for smoother UX
  React.useEffect(() => {
    if (!activeConversation && displayConversations.length > 0) {
      selectConversation(displayConversations[0])
    }
  }, [displayConversations, activeConversation, selectConversation])

  // Resolve header avatar to show the other participant for DMs
  React.useEffect(() => {
    let cancelled = false
    async function resolveHeaderProfile() {
      try {
        if (activeConversation?.type === 'dm' && activeConversation?.name) {
          const prof = await getProfileByIdentifier(activeConversation.name)
          if (!cancelled) setHeaderProfile(prof ? { user_id: prof.user_id, username: prof.username, avatar_url: prof.avatar_url } : null)
          return
        }
        // For groups, prefer first participant that's not the current user (if available)
        const other = activeParticipants.find(p => p.id !== currentUserId)
        if (!cancelled) setHeaderProfile(other ? { user_id: other.id, username: other.name, avatar_url: other.avatar } : null)
      } catch (e) {
        if (!cancelled) setHeaderProfile(null)
      }
    }
    resolveHeaderProfile()
    return () => { cancelled = true }
  }, [activeConversation?.id, activeConversation?.name, activeConversation?.type, activeParticipants, currentUserId])

  // Load participants when the active conversation changes (do not refetch on presence changes)
  React.useEffect(() => {
    let cancelled = false
    async function loadParticipants() {
      if (!activeConversation?.id) {
        setActiveParticipants([])
        return
      }
      try {
        const { data: partRows, error: partErr } = await supabase
          .from('conversation_participants')
          .select('user_id')
          .eq('conversation_id', activeConversation.id)

        if (partErr) {
          console.error('loadParticipants conversation_participants error', partErr)
          setActiveParticipants([])
          return
        }
        const ids = (partRows || []).map((r: any) => r.user_id)
        if (ids.length === 0) {
          setActiveParticipants([])
          return
        }
        const { data: profiles, error: profErr } = await supabase
          .from('profiles')
          .select('user_id, username, avatar_url, full_name')
          .in('user_id', ids)

        if (profErr) {
          console.error('loadParticipants profiles error', profErr)
          setActiveParticipants([])
          return
        }
        const mapped = (profiles || []).map((p: any): { id: string; name: string; avatar?: string; status: 'online' | 'offline' | 'away' } => ({
          id: String(p.user_id),
          name: (p.full_name || p.username || 'Member') as string,
          avatar: (p.avatar_url || undefined) as string | undefined,
          status: 'offline',
        }))
        if (!cancelled) setActiveParticipants(mapped)
      } catch (e) {
        console.error('loadParticipants exception', e)
        setActiveParticipants([])
      }
    }
    loadParticipants()
    return () => {
      cancelled = true
    }
  }, [activeConversation?.id])

  // Update participant online status from presence without refetching profiles
  React.useEffect(() => {
    if (!activeParticipants.length) return
    const onlineSet = new Set(onlineArray)
    setActiveParticipants(prev => prev.map(p => ({
      ...p,
      status: onlineSet.has(p.id) ? 'online' : 'offline',
    })))
  }, [onlineArray])

  // Mark messages as read when opening a conversation (server-side read receipts)
  React.useEffect(() => {
    if (!activeConversation?.id || !currentUserId) return
    const markRead = async () => {
      try {
        await supabase
          .from('messages')
          .update({ read_at: new Date().toISOString() })
          .eq('conversation_id', activeConversation.id)
          .neq('user_id', currentUserId)
          .is('read_at', null)
      } catch (e) {
        console.warn('markRead failed', e)
        toast({
          title: 'Failed to mark messages as read',
          description: e instanceof Error ? e.message : String(e),
          variant: 'destructive',
        })
      }
    }
    markRead()
  }, [activeConversation?.id, currentUserId])

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

  const handleStartChat = React.useCallback(async (identifier: string) => {
    try {
      const prof = await getProfileByIdentifier(identifier)
      if (!prof?.user_id) {
        toast({
          title: 'User not found',
          description: `No profile found for "${identifier}"`,
          variant: 'destructive',
        })
        return
      }
      const convo = await createConversationWithParticipants(`@${prof.username}`, [prof.user_id], 'dm')
      // Optimistically select the new conversation
      const mapped = { id: convo.id, name: convo.title, type: 'dm', participants: [] } as Conversation
      selectConversation(mapped)
    } catch (e) {
      console.error('Failed to start DM from contacts', e)
      toast({
        title: 'Failed to start chat',
        description: e instanceof Error ? e.message : String(e),
        variant: 'destructive',
      })
    }
  }, [selectConversation])

  return (
    <div className="flex h-screen bg-background">
      {/* Left Sidebar - Conversations */}
      <CollapsibleSidebar
        side="left"
        minimizedContent={(
          <div className="p-2 space-y-2">
            {displayConversations.map(conv => (
              <button
                key={conv.id}
                onClick={() => selectConversation(conv)}
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
              <Bot className="h-5 w-5 text-blue-600" aria-hidden="true" />
              {leftSidebar === 'expanded' && 'AGENT'}
            </h2>
            <div className="flex items-center gap-1">
              <ContactsManager onStartChat={handleStartChat} />
              <button
                className="ml-2"
                onClick={() => setShowProfile(true)}
                aria-label="Open profile"
                title="Profile"
              >
                <Avatar className="size-8">
                  {headerProfile?.avatar_url ? (
                    <AvatarImage src={headerProfile.avatar_url || undefined} alt={headerProfile?.username || 'User'} />
                  ) : (
                    <AvatarFallback>{(
                      (activeConversation?.name?.[0] || user?.email?.[0] || 'U')
                    )?.toUpperCase()}</AvatarFallback>
                  )}
                </Avatar>
              </button>
            </div>
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto">
            {leftSidebar === 'expanded' ? (
              <div className="p-2 space-y-1">
                {error && (
                  <div className="mb-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded p-2">
                    Failed to load conversations: {error}
                  </div>
                )}
                {loading && (
                  <div className="mb-3">
                    <div className="space-y-2">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="w-full p-3 rounded-lg border bg-card/40">
                          <div className="flex items-start gap-3">
                            <Skeleton className="h-4 w-4 mt-0.5 rounded" />
                            <div className="flex-1 min-w-0 space-y-2">
                              <Skeleton className="h-4 w-2/3" />
                              <Skeleton className="h-3 w-5/6" />
                              <Skeleton className="h-3 w-1/4" />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {displayConversations.map(conv => (
                  <button
                    key={conv.id}
                    onClick={() => selectConversation(conv)}
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
                {error && (
                  <div className="mb-2 text-[10px] text-red-600" title={String(error)}>
                    !
                  </div>
                )}
                {loading && (
                  <div className="mb-2 space-y-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Skeleton key={i} className="h-8 w-full rounded-md" />
                    ))}
                  </div>
                )}
                {displayConversations.map(conv => (
                  <button
                    key={conv.id}
                    onClick={() => selectConversation(conv)}
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
            participants={activeParticipants}
            currentUserId={currentUserId}
            onSendMessage={async (content, media) => {
              // Persist message to Supabase
              if (!activeConversation?.id || !content?.trim()) return
              await sendMessage.mutateAsync({ conversationId: activeConversation.id, content, type: 'text' })

              // Trigger AI response using selected agent overrides (per-conversation)
              try {
                const selectedId = selectedAgentByConversation[activeConversation.id]
                const agent = selectedId ? agentConnections.find(a => a.id === selectedId) : undefined
                if (agent) {
                  await aiService.processConversationMessage(activeConversation.id, content, {
                    provider: agent.provider,
                    apiKey: agent.config.apiKey,
                    endpoint: agent.config.endpoint,
                    model: agent.model,
                    temperature: agent.config.temperature,
                    maxTokens: agent.config.maxTokens,
                    systemPrompt: agent.config.systemPrompt,
                  })
                }
              } catch (e) {
                console.error('AI generation failed', e)
                toast({
                  title: 'AI response failed',
                  description: e instanceof Error ? e.message : String(e),
                  variant: 'destructive',
                })
              }
            }}
            onStartCall={(type) => {
              if (type === 'audio') {
                setIsPhoneOpen(true)
              } else if (type === 'video') {
                setIsVideoOpen(true)
              }
            }}
            onReaction={(messageId, emoji) => {
              ;(async () => {
                try {
                  // Fetch existing reactions for the message
                  const { data, error } = await supabase
                    .from('messages')
                    .select('reactions')
                    .eq('id', messageId)
                    .single()
                  if (error) throw error

                  const list = Array.isArray((data as any)?.reactions) ? ((data as any).reactions as Array<any>) : []
                  const idx = list.findIndex((r: any) => r && r.emoji === emoji)
                  if (idx >= 0) {
                    const users: string[] = Array.isArray(list[idx].users) ? list[idx].users : []
                    const has = users.includes(currentUserId)
                    const nextUsers = has ? users.filter(u => u !== currentUserId) : [...users, currentUserId]
                    if (nextUsers.length === 0) {
                      // Remove reaction entry entirely if no users remain
                      list.splice(idx, 1)
                    } else {
                      list[idx] = { emoji, users: nextUsers }
                    }
                  } else {
                    list.push({ emoji, users: [currentUserId] })
                  }

                  const { error: upErr } = await supabase
                    .from('messages')
                    .update({ reactions: list })
                    .eq('id', messageId)
                  if (upErr) throw upErr
                } catch (e) {
                  console.error('toggle reaction failed', e)
                  toast({
                    title: 'Reaction failed',
                    description: e instanceof Error ? e.message : String(e),
                    variant: 'destructive',
                  })
                }
              })()
            }}
            onDeleteMessage={(messageId) => {
              deleteMessage.mutateAsync(messageId).catch((e) => {
                toast({
                  title: 'Delete message failed',
                  description: e instanceof Error ? e.message : String(e),
                  variant: 'destructive',
                })
              })
            }}
            onEditMessage={(messageId, newContent) => {
              editMessage.mutateAsync({ messageId, content: newContent }).catch((e) => {
                toast({
                  title: 'Edit message failed',
                  description: e instanceof Error ? e.message : String(e),
                  variant: 'destructive',
                })
              })
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
                    selectedId={activeConversation?.id ? selectedAgentByConversation[activeConversation.id] : undefined}
                    onSelectConnection={(id) => {
                      if (!activeConversation?.id) return
                      setSelectedAgentByConversation(prev => ({ ...prev, [activeConversation.id]: id }))
                    }}
                    onTestConnection={async (id) => {
                      const agent = agentConnections.find(a => a.id === id)
                      if (!agent) return false
                      return aiService.testConnection({
                        provider: agent.provider,
                        apiKey: agent.config.apiKey,
                        endpoint: agent.config.endpoint,
                        model: agent.model,
                        temperature: agent.config.temperature,
                        maxTokens: agent.config.maxTokens,
                        systemPrompt: agent.config.systemPrompt,
                      })
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
      {showProfile && (headerProfile?.user_id || user?.id) && (
        <ProfilePopout userId={(headerProfile?.user_id || user?.id)!} onClose={() => setShowProfile(false)} />
      )}
      <NewConversationModal
        open={newModalOpen}
        onOpenChange={setNewModalOpen}
        onCreated={(id) => {
          setNewModalOpen(false)
          // Prefer selecting the actual conversation object if present
          const found = displayConversations.find(c => c.id === id)
          if (found) {
            selectConversation(found)
          } else {
            // Fallback placeholder until hook refreshes
            const placeholder = { id, name: 'New Conversation', type: 'group', participants: [] } as Conversation
            selectConversation(placeholder)
          }
        }}
      />
    </div>
  )
}
