'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { formatDistanceToNow } from 'date-fns'
import {
  MoreVertical,
  Reply,
  Edit2,
  Trash2,
  Pin,
  Copy,
  Forward,
  Download,
  Check,
  CheckCheck,
  Clock,
  AlertCircle,
  Smile
} from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
// import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/cjs/styles/prism'
import type { Message as SharedMessage } from '@/types/message'

// Using shared Message type from '@/types/message'.
// Additional UI-specific fields (attachments, replyTo, status, thread, isPinned, isDeleted)
// are read from message.metadata when present.

interface MessageThreadProps {
  messages: SharedMessage[]
  currentUserId: string
  onReply?: (message: SharedMessage) => void
  onEdit?: (message: SharedMessage) => void
  onDelete?: (messageId: string) => void
  onReaction?: (messageId: string, emoji: string) => void
  onPin?: (messageId: string) => void
  onForward?: (message: SharedMessage) => void
  showTypingIndicator?: boolean
  typingUsers?: Array<{ id: string; name: string }>
  className?: string
}

const QUICK_REACTIONS = ['👍', '❤️', '😂', '😮', '😢', '🔥']

export function MessageThread({
  messages,
  currentUserId,
  onReply,
  onEdit,
  onDelete,
  onReaction,
  onPin,
  onForward,
  showTypingIndicator = false,
  typingUsers = [],
  className
}: MessageThreadProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const [hoveredMessage, setHoveredMessage] = useState<string | null>(null)
  const [selectedMessages, setSelectedMessages] = useState<Set<string>>(new Set())
  const [showReactionPicker, setShowReactionPicker] = useState<string | null>(null)
  const [expandedThreads, setExpandedThreads] = useState<Set<string>>(new Set())

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  // Group messages by date
  const groupedMessages = useMemo(() => {
    const groups: { [key: string]: SharedMessage[] } = {}
    
    messages.forEach(message => {
      const date = new Date(message.created_at).toDateString()
      if (!groups[date]) {
        groups[date] = []
      }
      groups[date].push(message)
    })
    
    return groups
  }, [messages])

  const toggleThread = (messageId: string) => {
    setExpandedThreads(prev => {
      const newSet = new Set(prev)
      if (newSet.has(messageId)) {
        newSet.delete(messageId)
      } else {
        newSet.add(messageId)
      }
      return newSet
    })
  }

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'sending':
        return <Clock className="w-3 h-3 text-muted-foreground" />
      case 'sent':
        return <Check className="w-3 h-3 text-muted-foreground" />
      case 'delivered':
        return <CheckCheck className="w-3 h-3 text-muted-foreground" />
      case 'read':
        return <CheckCheck className="w-3 h-3 text-primary" />
      case 'failed':
        return <AlertCircle className="w-3 h-3 text-destructive" />
      default:
        return null
    }
  }

  const renderMessage = (message: SharedMessage, isThread = false) => {
    const isCurrentUser = message.user_id === currentUserId
    const isHovered = hoveredMessage === message.id
    const isSelected = selectedMessages.has(message.id)

    // Derive UI fields from shared message
    const authorName = message.user?.name ?? message.user_id
    const authorAvatar = message.user?.avatar_url ?? undefined
    const createdAt = new Date(message.created_at)
    const edited = !!message.edited_at
    const attachments = (message.metadata as any)?.attachments as Array<{
      id: string
      type: 'image' | 'video' | 'file' | 'audio'
      url: string
      name: string
      size?: number
      thumbnail?: string
    }> | undefined
    const replyTo = (message.metadata as any)?.replyTo as
      | { id: string; authorName: string; content: string }
      | undefined
    const status = (message.metadata as any)?.status as
      | 'sending'
      | 'sent'
      | 'delivered'
      | 'read'
      | 'failed'
      | undefined
    const isPinned = !!(message.metadata as any)?.isPinned
    const isDeleted = !!(message.metadata as any)?.isDeleted
    const thread = (message.metadata as any)?.thread as SharedMessage[] | undefined
    const threadCount = (message.metadata as any)?.threadCount as number | undefined

    return (
      <div
        key={message.id}
        className={cn(
          "group relative px-4 py-2 transition-colors",
          isHovered && "bg-accent",
          isSelected && "bg-accent",
          isThread && "ml-12 border-l-2 border-border",
          isPinned && "bg-accent"
        )}
        onMouseEnter={() => setHoveredMessage(message.id)}
        onMouseLeave={() => setHoveredMessage(null)}
      >
        {/* Pin Indicator */}
        {isPinned && !isThread && (
          <div className="absolute top-0 right-0 p-2">
            <Pin className="w-4 h-4 text-primary" />
          </div>
        )}

        <div className={cn(
          "flex gap-3",
          isCurrentUser && "flex-row-reverse"
        )}>
          {/* Avatar */}
          <Avatar className="w-10 h-10 shrink-0">
            <AvatarImage src={authorAvatar ?? undefined} />
            <AvatarFallback>
              {authorName?.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          {/* Message Content */}
          <div className={cn(
            "flex-1 max-w-[70%]",
            isCurrentUser && "items-end"
          )}>
            {/* Author and Time */}
            <div className={cn(
              "flex items-center gap-2 mb-1",
              isCurrentUser && "justify-end"
            )}>
              <span className="font-medium text-sm text-foreground">
                {authorName}
              </span>
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(createdAt, { addSuffix: true })}
              </span>
              {edited && (
                <span className="text-xs text-muted-foreground italic">(edited)</span>
              )}
            </div>

            {/* Reply Preview */}
            {replyTo && (
              <div className="mb-2 p-2 bg-accent rounded-lg border-l-4 border-primary">
                <p className="text-xs text-muted-foreground mb-1">
                  Replying to {replyTo.authorName}
                </p>
                <p className="text-sm text-foreground line-clamp-2">
                  {replyTo.content}
                </p>
              </div>
            )}

            {/* Message Bubble */}
            <div className={cn(
              "inline-block px-4 py-2 rounded-2xl",
              isCurrentUser
                ? "bg-primary text-primary-foreground"
                : "bg-accent text-foreground",
              isDeleted && "opacity-50 italic"
            )}>
              {isDeleted ? (
                <span className="text-sm">This message was deleted</span>
              ) : (
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <ReactMarkdown
                    components={{
                      code({ node, className, children, ...props }: any) {
                        const match = /language-(\w+)/.exec(className || '')
                        const isInline = !match
                        return !isInline && match ? (
                          <SyntaxHighlighter
                            style={oneDark as any}
                            language={match[1]}
                            PreTag="div"
                            {...props}
                          >
                            {String(children).replace(/\n$/, '')}
                          </SyntaxHighlighter>
                        ) : (
                          <code className={className} {...props}>
                            {children}
                          </code>
                        )
                      }
                    }}
                  >
                    {message.content}
                  </ReactMarkdown>
                </div>
              )}
            </div>

            {/* Attachments */}
            {attachments && attachments.length > 0 && (
              <div className="mt-2 space-y-2">
                {attachments.map(attachment => (
                  <div
                    key={attachment.id}
                    className="flex items-center gap-2 p-2 bg-accent rounded-lg"
                  >
                    {attachment.type === 'image' && attachment.thumbnail && (
                      <img
                        src={attachment.thumbnail}
                        alt={attachment.name}
                        className="w-32 h-32 object-cover rounded"
                      />
                    )}
                    <div className="flex-1">
                      <p className="text-sm font-medium">{attachment.name}</p>
                      {attachment.size && (
                        <p className="text-xs text-muted-foreground">
                          {(attachment.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => window.open(attachment.url)}
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* Reactions */}
            {message.reactions && message.reactions.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {message.reactions.map((reaction, index) => {
                  const detailed = (message.metadata as any)?.reactionsDetailed as
                    | Array<{ emoji: string; users?: Array<{ id: string; name: string }> }>
                    | undefined
                  const usersForEmoji = detailed?.find(r => r.emoji === reaction.emoji)?.users
                  const reactedByCurrentUser = usersForEmoji?.some(u => u.id === currentUserId)
                  return (
                  <button
                    key={index}
                    onClick={() => onReaction?.(message.id, reaction.emoji)}
                    className={cn(
                      "flex items-center gap-1 px-2 py-1 rounded-full text-xs",
                      "bg-accent hover:bg-accent/80",
                      reactedByCurrentUser &&
                        "bg-primary/10 border border-primary"
                    )}
                  >
                    <span>{reaction.emoji}</span>
                    <span>{reaction.count ?? usersForEmoji?.length ?? 0}</span>
                  </button>
                  )
                })}
              </div>
            )}

            {/* Thread Preview */}
            {thread && thread.length > 0 && !isThread && (
              <button
                onClick={() => toggleThread(message.id)}
                className="flex items-center gap-2 mt-2 text-sm text-primary hover:text-primary/90"
              >
                <Reply className="w-4 h-4" />
                {threadCount || thread.length} replies
                {thread[thread.length - 1] && (
                  <span className="text-muted-foreground">
                    · Last reply {formatDistanceToNow(new Date(thread[thread.length - 1].created_at), { addSuffix: true })}
                  </span>
                )}
              </button>
            )}

            {/* Status Indicator */}
            {isCurrentUser && (
              <div className="flex justify-end mt-1">
                {getStatusIcon(status)}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className={cn(
            "absolute top-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity",
            isCurrentUser ? "left-2" : "right-2"
          )}>
            {/* Quick Reactions */}
            <Popover open={showReactionPicker === message.id} onOpenChange={(open) => setShowReactionPicker(open ? message.id : null)}>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="w-8 h-8">
                  <Smile className="w-4 h-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-2">
                <div className="flex gap-1">
                  {QUICK_REACTIONS.map(emoji => (
                    <button
                      key={emoji}
                      onClick={() => {
                        onReaction?.(message.id, emoji)
                        setShowReactionPicker(null)
                      }}
                      className="p-2 hover:bg-accent rounded"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>

            {/* Reply */}
            <Button
              variant="ghost"
              size="icon"
              className="w-8 h-8"
              onClick={() => onReply?.(message)}
            >
              <Reply className="w-4 h-4" />
            </Button>

            {/* More Actions */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="w-8 h-8">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align={isCurrentUser ? "start" : "end"}>
                {isCurrentUser && (
                  <>
                    <DropdownMenuItem onClick={() => onEdit?.(message)}>
                      <Edit2 className="w-4 h-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onDelete?.(message.id)}
                      className="text-destructive"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
                <DropdownMenuItem onClick={() => onPin?.(message.id)}>
                  <Pin className="w-4 h-4 mr-2" />
                  {isPinned ? 'Unpin' : 'Pin'}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onForward?.(message)}>
                  <Forward className="w-4 h-4 mr-2" />
                  Forward
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => navigator.clipboard.writeText(message.content)}
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Expanded Thread */}
        {expandedThreads.has(message.id) && thread && (
          <div className="mt-4">
            {thread.map(threadMessage => renderMessage(threadMessage, true))}
          </div>
        )}
      </div>
    )
  }

  return (
    <ScrollArea ref={scrollAreaRef} className={cn("flex-1", className)}>
      {Object.entries(groupedMessages).map(([date, dateMessages]) => (
        <div key={date}>
          {/* Date Separator */}
          <div className="flex items-center gap-4 px-4 py-2">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground font-medium">
              {new Date(date).toDateString() === new Date().toDateString()
                ? 'Today'
                : new Date(date).toDateString() === new Date(Date.now() - 86400000).toDateString()
                ? 'Yesterday'
                : date}
            </span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Messages */}
          {dateMessages.map(message => renderMessage(message))}
        </div>
      ))}

      {/* Typing Indicator */}
      {showTypingIndicator && typingUsers.length > 0 && (
        <div className="px-4 py-2 flex items-center gap-2">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
          <span className="text-sm text-muted-foreground">
            {typingUsers.map(u => u.name).join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
          </span>
        </div>
      )}
    </ScrollArea>
  )
}
