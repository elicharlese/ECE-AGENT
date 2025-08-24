'use client'

import React, { useCallback, useRef, useEffect, useMemo } from 'react'
import { VariableSizeList as List } from 'react-window'
import { useInView } from 'react-intersection-observer'
import { Message } from '@/types/message'
import { MessageItem } from './message-item'
import { Loader2 } from 'lucide-react'

interface VirtualMessageListProps {
  messages: Message[]
  conversationId: string
  currentUserId: string
  onLoadMore?: () => void
  hasMore?: boolean
  isLoading?: boolean
  onReact?: (messageId: string, emoji: string) => void
  onReply?: (message: Message) => void
  onEdit?: (message: Message) => void
  onDelete?: (messageId: string) => void
}

export function VirtualMessageList({
  messages,
  conversationId,
  currentUserId,
  onLoadMore,
  hasMore = false,
  isLoading = false,
  onReact,
  onReply,
  onEdit,
  onDelete
}: VirtualMessageListProps) {
  const listRef = useRef<List>(null)
  const itemHeights = useRef<Map<string, number>>(new Map())
  const [loadMoreRef, inView] = useInView({
    threshold: 0.1,
    rootMargin: '100px'
  })

  // Trigger load more when scrolling to top
  useEffect(() => {
    if (inView && hasMore && !isLoading && onLoadMore) {
      onLoadMore()
    }
  }, [inView, hasMore, isLoading, onLoadMore])

  // Calculate item height dynamically
  const getItemSize = useCallback((index: number) => {
    const message = messages[index]
    if (!message) return 100 // Default height

    const height = itemHeights.current.get(message.id)
    return height || 100 // Estimated height
  }, [messages])

  // Update height after render
  const setItemHeight = useCallback((messageId: string, height: number) => {
    const prevHeight = itemHeights.current.get(messageId)
    if (prevHeight !== height) {
      itemHeights.current.set(messageId, height)
      if (listRef.current) {
        listRef.current.resetAfterIndex(0)
      }
    }
  }, [])

  // Scroll to bottom on new messages
  useEffect(() => {
    if (listRef.current && messages.length > 0) {
      const lastMessage = messages[messages.length - 1]
      if (lastMessage.user_id === currentUserId) {
        listRef.current.scrollToItem(messages.length - 1, 'end')
      }
    }
  }, [messages.length, currentUserId])

  const Row = useCallback(({ index, style }: { index: number; style: React.CSSProperties }) => {
    const message = messages[index]
    const prevMessage = index > 0 ? messages[index - 1] : null
    const nextMessage = index < messages.length - 1 ? messages[index + 1] : null

    const showAvatar = !nextMessage || 
      nextMessage.user_id !== message.user_id ||
      (new Date(nextMessage.created_at).getTime() - new Date(message.created_at).getTime()) > 60000

    const showTimestamp = !prevMessage || 
      prevMessage.user_id !== message.user_id ||
      (new Date(message.created_at).getTime() - new Date(prevMessage.created_at).getTime()) > 60000

    return (
      <div style={style}>
        {index === 0 && hasMore && (
          <div ref={loadMoreRef} className="flex justify-center py-4">
            {isLoading && <Loader2 className="h-6 w-6 animate-spin" />}
          </div>
        )}
        <MessageItem
          message={message}
          isOwn={message.user_id === currentUserId}
          showAvatar={showAvatar}
          showTimestamp={showTimestamp}
          onHeightChange={(height) => setItemHeight(message.id, height)}
          onReact={onReact}
          onReply={onReply}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      </div>
    )
  }, [messages, currentUserId, hasMore, isLoading, loadMoreRef, setItemHeight, onReact, onReply, onEdit, onDelete])

  const itemCount = useMemo(() => messages.length, [messages.length])

  return (
    <List
      ref={listRef}
      height={600}
      itemCount={itemCount}
      itemSize={getItemSize}
      width="100%"
      className="scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-600"
    >
      {Row}
    </List>
  )
}
