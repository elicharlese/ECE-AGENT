'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Video, Phone, MoreVertical, Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import { MessageReactions } from './EmojiPicker'
import { ReadReceipts, MessageStatus } from './ReadReceipts'
import { MediaThumbnail, MediaLightbox, MediaGallery } from './MediaPreview'
import { RichMessageInput } from '@/components/messages/rich-message-input'
import { useDensity } from '@/contexts/density-context'
import { useMessages, useRealtimeMessages } from '@/hooks/use-messages'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuLabel, DropdownMenuCheckboxItem } from '@/components/ui/dropdown-menu'
import { toast } from '@/components/ui/use-toast'
import { supabase } from '@/lib/supabase/client'
import { SidebarTrigger } from '@/components/layout/CollapsibleSidebar'

interface Message {
  id: string
  content: string
  senderId: string
  senderName: string
  senderAvatar?: string
  timestamp: Date
  status: MessageStatus
  reactions?: { emoji: string; users: string[] }[]
  media?: Array<{
    id: string
    url: string
    type: 'image' | 'video' | 'audio' | 'document'
    name: string
    thumbnail?: string
  }>
  readBy?: Array<{
    userId: string
    userName: string
    avatar?: string
    readAt: Date
  }>
  isEdited?: boolean
  replyTo?: {
    id: string
    content: string
    senderName: string
  }
}

interface EnhancedChatProps {
  conversationId: string
  conversationName: string
  conversationType: 'dm' | 'group' | 'channel'
  participants: Array<{
    id: string
    name: string
    avatar?: string
    status?: 'online' | 'offline' | 'away'
  }>
  currentUserId: string
  onSendMessage: (content: string, media?: File[]) => Promise<void>
  onStartCall?: (type: 'audio' | 'video') => void
  onReaction?: (messageId: string, emoji: string) => void
  onDeleteMessage?: (messageId: string) => void
  onEditMessage?: (messageId: string, newContent: string) => void
}

export function EnhancedChat({
  conversationId,
  conversationName,
  conversationType,
  participants,
  currentUserId,
  onSendMessage,
  onStartCall,
  onReaction,
  onDeleteMessage,
  onEditMessage,
}: EnhancedChatProps) {
  const { density } = useDensity()
  const [lightboxMedia, setLightboxMedia] = useState<any>(null)
  const [replyingTo, setReplyingTo] = useState<Message | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [muted, setMuted] = useState(false)

  // Load messages via react-query and subscribe to realtime updates
  const {
    data: messagesData,
    isLoading: messagesLoading,
    error: messagesError,
  } = useMessages({ conversationId, pageSize: 50 })

  // Subscribe to realtime changes for this conversation
  useRealtimeMessages(conversationId)

  // Flatten, sort ascending by created_at, and apply search filter
  const fetchedMessages = React.useMemo(() => {
    const raw: any = messagesData as any
    const arrays: any[] = Array.isArray(raw?.pages) ? raw.pages.flat() : Array.isArray(raw) ? raw : []
    const sorted = arrays
      .slice()
      .sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    const filtered = searchQuery.trim().length
      ? sorted.filter((m: any) => m.content?.toLowerCase().includes(searchQuery.toLowerCase()))
      : sorted
    // Map to UI Message shape
    const mapped: Message[] = filtered.map((m: any) => ({
      id: m.id,
      content: m.content,
      senderId: m.user_id,
      senderName: (m.user && (m.user.name || m.user.full_name)) || (m.user_id === currentUserId ? 'You' : 'Member'),
      senderAvatar: m.user?.avatar_url || undefined,
      timestamp: new Date(m.created_at),
      status: 'sent',
      reactions: Array.isArray(m.reactions)
        ? (m.reactions as any[]).map((r: any) => ({ emoji: r.emoji, users: [] as string[] }))
        : undefined,
      media: undefined,
      isEdited: !!m.edited_at,
      replyTo: undefined,
    }))
    return mapped
  }, [messagesData, searchQuery, currentUserId])

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [fetchedMessages?.length])

  const handleSendRich = async (content: string, media?: File[]) => {
    if (!content.trim() && (!media || media.length === 0)) return
    setReplyingTo(null)
    await onSendMessage(content, media)
  }

  const handleReaction = (messageId: string, emoji: string) => {
    onReaction?.(messageId, emoji)
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    })
  }

  const formatDate = (date: Date) => {
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today'
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday'
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
      })
    }
  }

  // Group messages by date
  const groupedMessages = fetchedMessages.reduce((groups: Record<string, Message[]>, message: Message) => {
    const date = formatDate(message.timestamp)
    if (!groups[date]) {
      groups[date] = []
    }
    groups[date].push(message)
    return groups
  }, {} as Record<string, Message[]>)

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="flex items-center justify-between px-4 md:px-16 pb-3 border-b pt-[env(safe-area-inset-top)] md:pt-3">
        <div className="flex items-center gap-3">
          {/* Mobile: open left sidebar */}
          <SidebarTrigger side="left" />
          <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center">
            {conversationName[0].toUpperCase()}
          </div>
          <div>
            <h2 className="font-semibold">{conversationName}</h2>
            <p className="text-xs text-muted-foreground">
              {participants.filter(p => p.status === 'online').length} online
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSearch(!showSearch)}
            className="p-2 hover:bg-accent rounded-md transition-colors"
            aria-label={showSearch ? 'Hide search' : 'Show search'}
            title={showSearch ? 'Hide search' : 'Show search'}
          >
            <Search className="h-4 w-4" />
          </button>
          {onStartCall && (
            <>
              <button
                onClick={() => onStartCall('audio')}
                className="p-2 hover:bg-accent rounded-md transition-colors"
                aria-label="Start audio call"
                title="Start audio call"
              >
                <Phone className="h-4 w-4" />
              </button>
              <button
                onClick={() => onStartCall('video')}
                className="p-2 hover:bg-accent rounded-md transition-colors"
                aria-label="Start video call"
                title="Start video call"
              >
                <Video className="h-4 w-4" />
              </button>
            </>
          )}
          {/* Settings popout */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="p-2 hover:bg-accent rounded-md transition-colors"
                aria-label="Conversation options"
                title="Conversation options"
              >
                <MoreVertical className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Conversation</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={async () => {
                  try {
                    await supabase
                      .from('conversation_participants')
                      .update({ last_read_at: new Date().toISOString() })
                      .eq('conversation_id', conversationId)
                      .eq('user_id', currentUserId)
                    toast({ title: 'Marked as read' })
                  } catch (e) {
                    toast({ title: 'Failed to mark as read', description: e instanceof Error ? e.message : String(e), variant: 'destructive' })
                  }
                }}
              >
                Mark all as read
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(conversationId)
                    toast({ title: 'Conversation ID copied' })
                  } catch (e) {
                    toast({ title: 'Copy failed', description: 'Could not copy Conversation ID', variant: 'destructive' })
                  }
                }}
              >
                Copy Conversation ID
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem
                checked={muted}
                onCheckedChange={(v) => {
                  setMuted(!!v)
                  toast({ title: !!v ? 'Notifications muted' : 'Notifications unmuted' })
                }}
              >
                Mute notifications
              </DropdownMenuCheckboxItem>
              {conversationType !== 'dm' && (
                <DropdownMenuItem
                  onClick={() => {
                    toast({ title: 'Leave conversation', description: 'Coming soon', variant: 'default' })
                  }}
                  variant="destructive"
                >
                  Leave conversation
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
          {/* Mobile: open right sidebar */}
          <SidebarTrigger side="right" />
        </div>
      </div>

      {/* Search Bar */}
      {showSearch && (
        <div className="px-4 py-2 border-b">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search messages..."
            className="w-full px-3 py-1.5 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      )}

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {messagesError && (
          <div className="mb-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded p-2">
            Failed to load messages{typeof messagesError === 'object' && (messagesError as any)?.message ? `: ${(messagesError as any).message}` : ''}
          </div>
        )}
        {messagesLoading && (
          <div className="mb-2 text-xs text-muted-foreground">Loading messages...</div>
        )}
        {Object.entries(groupedMessages).map(([date, dateMessages]) => (
          <div key={date}>
            {/* Date Separator */}
            <div className="flex items-center gap-4 my-4">
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs text-muted-foreground font-medium">{date}</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            {/* Messages */}
            {dateMessages.map((message) => {
              const isOwn = message.senderId === currentUserId
              
              return (
                <div
                  key={message.id}
                  className={cn(
                    'flex gap-3 mb-4',
                    isOwn && 'flex-row-reverse'
                  )}
                >
                  {/* Avatar */}
                  {!isOwn && (
                    <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center flex-shrink-0">
                      {message.senderAvatar ? (
                        <img
                          src={message.senderAvatar}
                          alt={message.senderName}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-xs">
                          {message.senderName[0].toUpperCase()}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Message Content */}
                  <div className={cn('max-w-[82%] max-[380px]:max-w-[62%] sm:max-w-[75%] md:max-w-[70%]', isOwn && 'items-end')}>
                    {/* Sender Name */}
                    {!isOwn && conversationType !== 'dm' && (
                      <p className="text-xs font-medium text-muted-foreground mb-1">
                        {message.senderName}
                      </p>
                    )}

                    {/* Reply Reference */}
                    {message.replyTo && (
                      <div className="text-xs bg-accent/50 rounded p-2 mb-1 border-l-2 border-primary">
                        <p className="font-medium">{message.replyTo.senderName}</p>
                        <p className="text-muted-foreground truncate">
                          {message.replyTo.content}
                        </p>
                      </div>
                    )}

                    {/* Message Bubble */}
                    <div
                      className={cn(
                        'rounded-lg px-3 py-2',
                        isOwn
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-accent'
                      )}
                    >
                      {/* Media */}
                      {message.media && message.media.length > 0 && (
                        <div className="mb-2">
                          <MediaGallery
                            items={message.media}
                            onItemClick={(item) => setLightboxMedia(item)}
                          />
                        </div>
                      )}

                      {/* Text Content */}
                      {message.content && (
                        <p className="text-sm whitespace-pre-wrap break-words [hyphens:auto]">
                          {message.content}
                        </p>
                      )}

                      {/* Time & Status */}
                      <div className={cn(
                        'flex items-center gap-1 mt-1',
                        isOwn ? 'justify-end' : 'justify-start'
                      )}>
                        <span className={cn(
                          'text-xs',
                          isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'
                        )}>
                          {formatTime(message.timestamp)}
                        </span>
                        {message.isEdited && (
                          <span className={cn(
                            'text-xs',
                            isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'
                          )}>
                            (edited)
                          </span>
                        )}
                        {isOwn && (
                          <ReadReceipts
                            status={message.status}
                            receipts={message.readBy}
                            className="ml-1"
                          />
                        )}
                      </div>
                    </div>

                    {/* Reactions */}
                    {message.reactions && message.reactions.length > 0 && (
                      <div className="mt-1">
                        <MessageReactions
                          reactions={message.reactions}
                          onAddReaction={(emoji) => handleReaction(message.id, emoji)}
                          onRemoveReaction={(emoji) => handleReaction(message.id, emoji)}
                          currentUserId={currentUserId}
                        />
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        ))}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t pb-[env(safe-area-inset-bottom)]">
        <RichMessageInput
          className="px-4"
          placeholder="Type a message..."
          density={density}
          onSendMessage={handleSendRich}
        />
      </div>

      {/* Media Lightbox */}
      {lightboxMedia && (
        <MediaLightbox
          media={lightboxMedia}
          isOpen={!!lightboxMedia}
          onClose={() => setLightboxMedia(null)}
        />
      )}
    </div>
  )
}
