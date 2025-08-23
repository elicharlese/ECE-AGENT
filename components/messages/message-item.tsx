'use client'

import React, { useEffect, useRef, memo } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { formatDistanceToNow } from 'date-fns'
import { Message } from '@/types/message'
import { cn } from '@/lib/utils'
import { 
  MoreVertical, 
  Edit2, 
  Trash2, 
  Reply, 
  Smile,
  Check,
  CheckCheck 
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface MessageItemProps {
  message: Message
  isOwn: boolean
  showAvatar?: boolean
  showTimestamp?: boolean
  onHeightChange?: (height: number) => void
  onReact?: (messageId: string, emoji: string) => void
  onReply?: (message: Message) => void
  onEdit?: (message: Message) => void
  onDelete?: (messageId: string) => void
}

export const MessageItem = memo(function MessageItem({
  message,
  isOwn,
  showAvatar = true,
  showTimestamp = true,
  onHeightChange,
  onReact,
  onReply,
  onEdit,
  onDelete
}: MessageItemProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (ref.current && onHeightChange) {
      const height = ref.current.getBoundingClientRect().height
      onHeightChange(height)
    }
  }, [message.content, onHeightChange])

  const handleReaction = (emoji: string) => {
    if (onReact) {
      onReact(message.id, emoji)
    }
  }

  return (
    <div
      ref={ref}
      className={cn(
        'flex gap-3 px-4 py-2 hover:bg-accent group',
        isOwn && 'flex-row-reverse'
      )}
    >
      {showAvatar && (
        <Avatar className="h-8 w-8 mt-1">
          <AvatarImage src={message.user?.avatar_url ?? undefined} />
          <AvatarFallback>
            {message.user?.name?.charAt(0) || 'U'}
          </AvatarFallback>
        </Avatar>
      )}
      
      {!showAvatar && <div className="w-8" />}

      <div className={cn('flex-1 max-w-[70%]', isOwn && 'items-end')}>
        {showTimestamp && (
          <div className={cn(
            'flex items-center gap-2 mb-1',
            isOwn && 'justify-end'
          )}>
            <span className="text-sm font-medium">
              {message.user?.name || 'Unknown'}
            </span>
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
            </span>
            {message.edited_at && (
              <span className="text-xs text-muted-foreground/70">(edited)</span>
            )}
          </div>
        )}

        <div className={cn(
          'relative group/message',
          isOwn && 'flex justify-end'
        )}>
          <div className={cn(
            'rounded-lg px-4 py-2 max-w-full break-words',
            isOwn 
              ? 'bg-primary text-primary-foreground' 
              : 'bg-accent'
          )}>
            <p className="whitespace-pre-wrap">{message.content}</p>
            
            {isOwn && (
              <div className="flex justify-end mt-1 gap-1">
                {message.read_at ? (
                  <CheckCheck className="h-3 w-3" />
                ) : (
                  <Check className="h-3 w-3" />
                )}
              </div>
            )}
          </div>

          <div className="absolute -top-8 right-0 opacity-0 group-hover/message:opacity-100 transition-opacity">
            <div className="flex items-center gap-1 bg-card border border-border rounded-lg shadow-lg p-1">
              <button
                onClick={() => handleReaction('👍')}
                className="p-1 hover:bg-accent rounded"
              >
                👍
              </button>
              <button
                onClick={() => handleReaction('❤️')}
                className="p-1 hover:bg-accent rounded"
              >
                ❤️
              </button>
              <button
                onClick={() => handleReaction('😂')}
                className="p-1 hover:bg-accent rounded"
              >
                😂
              </button>
              
              <DropdownMenu>
                <DropdownMenuTrigger className="p-1 hover:bg-accent rounded">
                  <MoreVertical className="h-4 w-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {onReply && (
                    <DropdownMenuItem onClick={() => onReply(message)}>
                      <Reply className="h-4 w-4 mr-2" />
                      Reply
                    </DropdownMenuItem>
                  )}
                  {isOwn && onEdit && (
                    <DropdownMenuItem onClick={() => onEdit(message)}>
                      <Edit2 className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                  )}
                  {isOwn && onDelete && (
                    <DropdownMenuItem 
                      onClick={() => onDelete(message.id)}
                      className="text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {message.reactions && message.reactions.length > 0 && (
          <div className="flex gap-1 mt-2">
            {message.reactions.map((reaction, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1 px-2 py-1 bg-accent rounded-full text-xs"
              >
                {reaction.emoji}
                <span className="text-muted-foreground">
                  {reaction.count}
                </span>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
})
