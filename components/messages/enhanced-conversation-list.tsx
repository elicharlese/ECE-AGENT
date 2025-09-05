'use client'

import { useState, useMemo } from 'react'
import { Search, Plus, Filter, Archive, Pin, MoreVertical, Users, Hash } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import type { Conversation } from '@/services/conversation-service'

interface EnhancedConversationListProps {
  conversations?: Conversation[]
  selectedConversationId?: string | null
  onSelect: (conversationId: string) => void
  onNewMessage: () => void
  isCollapsed?: boolean
  className?: string
  onOpenProfile: () => void
  userId: string
  isMobile: boolean
  compact?: boolean
}

type ConversationType = 'all' | 'direct' | 'group' | 'channel' | 'archived'
type SortBy = 'recent' | 'alphabetical' | 'unread'

export function EnhancedConversationList({
  conversations: propConversations,
  selectedConversationId,
  onSelect,
  onNewMessage,
  isCollapsed = false,
  className
}: EnhancedConversationListProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<ConversationType>('all')
  const [sortBy, setSortBy] = useState<SortBy>('recent')
  const [showNewMessage, setShowNewMessage] = useState(false)
  const [newUsername, setNewUsername] = useState('')
  const [pinnedConversations, setPinnedConversations] = useState<Set<string>>(new Set())
  const [archivedConversations, setArchivedConversations] = useState<Set<string>>(new Set())

  // Filter and sort conversations
  const filteredConversations = useMemo(() => {
    let filtered = [...(propConversations || [])]

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(conv => 
        conv.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        conv.last_message?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Apply type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(conv => {
        // Since type is not in the interface, we'll filter based on agent_id for now
        if (filterType === 'direct' && !conv.agent_id) return true
        if (filterType === 'group' && conv.agent_id) return true
        if (filterType === 'archived' && archivedConversations.has(conv.id)) return true
        return false
      })
    }

    // Apply sorting
    if (sortBy === 'alphabetical') {
      filtered.sort((a, b) => (a.title || '').localeCompare(b.title || ''))
    } else if (sortBy === 'unread') {
      filtered.sort((a, b) => (b.unread_count || 0) - (a.unread_count || 0))
    } else {
      // Recent (default)
      filtered.sort((a, b) => 
        new Date(b.updated_at || 0).getTime() - new Date(a.updated_at || 0).getTime()
      )
    }

    // Put pinned conversations at the top
    const pinned = filtered.filter(conv => pinnedConversations.has(conv.id))
    const unpinned = filtered.filter(conv => !pinnedConversations.has(conv.id))
    
    return [...pinned, ...unpinned]
  }, [propConversations, searchQuery, filterType, sortBy, pinnedConversations, archivedConversations])

  const handleStartNewMessage = async () => {
    if (newUsername.trim()) {
      await onNewMessage()
      setNewUsername('')
      setShowNewMessage(false)
    }
  }

  const togglePin = (conversationId: string) => {
    setPinnedConversations(prev => {
      const newSet = new Set(prev)
      if (newSet.has(conversationId)) {
        newSet.delete(conversationId)
      } else {
        newSet.add(conversationId)
      }
      return newSet
    })
  }

  const toggleArchive = (conversationId: string) => {
    setArchivedConversations(prev => {
      const newSet = new Set(prev)
      if (newSet.has(conversationId)) {
        newSet.delete(conversationId)
      } else {
        newSet.add(conversationId)
      }
      return newSet
    })
  }

  const getConversationIcon = (type: string) => {
    switch (type) {
      case 'group':
        return <Users className="w-4 h-4" />
      case 'channel':
        return <Hash className="w-4 h-4" />
      default:
        return null
    }
  }

  if (isCollapsed) {
    return (
      <div className="h-full bg-sidebar text-sidebar-foreground">
        <ScrollArea className="h-full">
          <div className="p-2 space-y-1">
            {filteredConversations.map(conversation => (
              <button
                key={conversation.id}
                onClick={() => onSelect(conversation.id)}
                className={cn(
                  "w-full p-2 rounded-lg transition-colors",
                  selectedConversationId === conversation.id
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-accent"
                )}
                title={conversation.title}
              >
                <Avatar className="w-8 h-8">
                  <AvatarImage src={undefined} />
                  <AvatarFallback>
                    {conversation.title?.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </button>
            ))}
          </div>
        </ScrollArea>
      </div>
    )
  }

  return (
    <div className={cn("h-full bg-card border-r flex flex-col", className)}>
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-foreground">Messages</h2>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowNewMessage(true)}
              className="hover:bg-accent"
            >
              <Plus className="w-5 h-5" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="hover:bg-accent">
                  <Filter className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setFilterType('all')}>
                  All Conversations
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterType('direct')}>
                  Direct Messages
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterType('group')}>
                  Groups
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterType('channel')}>
                  Channels
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setFilterType('archived')}>
                  <Archive className="w-4 h-4 mr-2" />
                  Archived
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Sort Options */}
        <div className="flex gap-1 mt-3">
          <Badge
            variant={sortBy === 'recent' ? 'default' : 'outline'}
            className="cursor-pointer"
            onClick={() => setSortBy('recent')}
          >
            Recent
          </Badge>
          <Badge
            variant={sortBy === 'unread' ? 'default' : 'outline'}
            className="cursor-pointer"
            onClick={() => setSortBy('unread')}
          >
            Unread
          </Badge>
          <Badge
            variant={sortBy === 'alphabetical' ? 'default' : 'outline'}
            className="cursor-pointer"
            onClick={() => setSortBy('alphabetical')}
          >
            A-Z
          </Badge>
        </div>
      </div>

      {/* New Message Input */}
      {showNewMessage && (
        <div className="p-4 border-b bg-accent">
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Enter username..."
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleStartNewMessage()}
              className="flex-1"
              autoFocus
            />
            <Button onClick={handleStartNewMessage} size="sm">
              Start
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setShowNewMessage(false)
                setNewUsername('')
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Conversation List */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {filteredConversations.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchQuery ? 'No conversations found' : 'No conversations yet'}
            </div>
          ) : (
            filteredConversations.map(conversation => (
              <div
                key={conversation.id}
                className={cn(
                  "group relative flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all",
                  selectedConversationId === conversation.id
                    ? "bg-accent border-l-4 border-primary"
                    : "hover:bg-accent"
                )}
                onClick={() => onSelect(conversation.id)}
              >
                {/* Avatar with Status */}
                <div className="relative">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={undefined} />
                    <AvatarFallback>
                      {conversation.title?.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </div>

                {/* Conversation Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    {pinnedConversations.has(conversation.id) && (
                      <Pin className="w-3 h-3 text-muted-foreground" />
                    )}
                    {getConversationIcon(conversation.agent_id ? 'group' : 'direct')}
                    <span className="font-medium text-foreground truncate">
                      {conversation.title}
                    </span>
                    {conversation.unread_count && conversation.unread_count > 0 && (
                      <Badge variant="secondary" className="ml-auto">
                        {conversation.unread_count}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground truncate">
                      {conversation.last_message || 'No messages yet'}
                    </p>
                    <span className="text-xs text-muted-foreground">
                      {conversation.updated_at ? new Date(conversation.updated_at).toLocaleDateString() : ''}
                    </span>
                  </div>
                </div>

                {/* Actions Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => togglePin(conversation.id)}>
                      <Pin className="w-4 h-4 mr-2" />
                      {pinnedConversations.has(conversation.id) ? 'Unpin' : 'Pin'}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => toggleArchive(conversation.id)}>
                      <Archive className="w-4 h-4 mr-2" />
                      {archivedConversations.has(conversation.id) ? 'Unarchive' : 'Archive'}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-destructive">
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
