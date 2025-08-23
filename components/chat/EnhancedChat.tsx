'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Video, Phone, MoreVertical, Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import { MessageReactions } from './EmojiPicker'
import { ReadReceipts, MessageStatus } from './ReadReceipts'
import { MediaThumbnail, MediaLightbox, MediaGallery } from './MediaPreview'
import { RichMessageInput } from '@/components/messages/rich-message-input'
import { useDensity } from '@/contexts/density-context'

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
  const [messages, setMessages] = useState<Message[]>([])
  const [lightboxMedia, setLightboxMedia] = useState<any>(null)
  const [replyingTo, setReplyingTo] = useState<Message | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendRich = async (content: string, media?: File[]) => {
    if (!content.trim() && (!media || media.length === 0)) return

    const newMessage: Message = {
      id: Math.random().toString(36).substr(2, 9),
      content,
      senderId: currentUserId,
      senderName: 'You',
      timestamp: new Date(),
      status: 'sending',
      replyTo: replyingTo || undefined,
    }

    setMessages(prev => [...prev, newMessage])
    setReplyingTo(null)

    try {
      await onSendMessage(content, media)
      setMessages(prev => prev.map(m => 
        m.id === newMessage.id ? { ...m, status: 'sent' } : m
      ))
    } catch (error) {
      setMessages(prev => prev.map(m => 
        m.id === newMessage.id ? { ...m, status: 'error' } : m
      ))
    }
  }

  const handleReaction = (messageId: string, emoji: string) => {
    setMessages(prev => prev.map(msg => {
      if (msg.id !== messageId) return msg
      
      const reactions = msg.reactions || []
      const existingReaction = reactions.find(r => r.emoji === emoji)
      
      if (existingReaction) {
        if (existingReaction.users.includes(currentUserId)) {
          // Remove reaction
          existingReaction.users = existingReaction.users.filter(u => u !== currentUserId)
          if (existingReaction.users.length === 0) {
            return {
              ...msg,
              reactions: reactions.filter(r => r.emoji !== emoji)
            }
          }
        } else {
          // Add user to reaction
          existingReaction.users.push(currentUserId)
        }
      } else {
        // Add new reaction
        reactions.push({ emoji, users: [currentUserId] })
      }
      
      return { ...msg, reactions }
    }))
    
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
  const groupedMessages = messages.reduce((groups, message) => {
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
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <div className="flex items-center gap-3">
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
          >
            <Search className="h-4 w-4" />
          </button>
          {onStartCall && (
            <>
              <button
                onClick={() => onStartCall('audio')}
                className="p-2 hover:bg-accent rounded-md transition-colors"
              >
                <Phone className="h-4 w-4" />
              </button>
              <button
                onClick={() => onStartCall('video')}
                className="p-2 hover:bg-accent rounded-md transition-colors"
              >
                <Video className="h-4 w-4" />
              </button>
            </>
          )}
          <button className="p-2 hover:bg-accent rounded-md transition-colors">
            <MoreVertical className="h-4 w-4" />
          </button>
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
                  <div className={cn('max-w-[70%]', isOwn && 'items-end')}>
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
                        <p className="text-sm whitespace-pre-wrap break-words">
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
      <div className="border-t">
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
