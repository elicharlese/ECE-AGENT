'use client'

import React, { useState } from 'react'
import { Check, CheckCheck, Clock, Eye } from 'lucide-react'
import { cn } from '@/lib/utils'

export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'error'

interface ReadReceipt {
  userId: string
  userName: string
  avatar?: string
  readAt: Date
}

interface ReadReceiptsProps {
  status: MessageStatus
  receipts?: ReadReceipt[]
  className?: string
  showDetails?: boolean
}

export function ReadReceipts({
  status,
  receipts = [],
  className,
  showDetails = false,
}: ReadReceiptsProps) {
  const [showTooltip, setShowTooltip] = useState(false)

  const getStatusIcon = () => {
    switch (status) {
      case 'sending':
        return <Clock className="h-3 w-3 text-muted-foreground animate-pulse" />
      case 'sent':
        return <Check className="h-3 w-3 text-muted-foreground" />
      case 'delivered':
        return <CheckCheck className="h-3 w-3 text-muted-foreground" />
      case 'read':
        return <CheckCheck className="h-3 w-3 text-primary" />
      case 'error':
        return <span className="text-xs text-red-500">!</span>
      default:
        return null
    }
  }

  const formatTime = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    if (days < 7) return `${days}d ago`
    return date.toLocaleDateString()
  }

  return (
    <div className={cn('relative inline-flex items-center', className)}>
      <div
        className="flex items-center gap-1"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        {getStatusIcon()}
        
        {showDetails && receipts.length > 0 && (
          <span className="text-xs text-muted-foreground">
            Read by {receipts.length}
          </span>
        )}
      </div>

      {/* Tooltip with read details */}
      {showTooltip && receipts.length > 0 && (
        <div className="absolute bottom-6 right-0 z-50 w-48 p-2 bg-background border rounded-lg shadow-lg">
          <div className="text-xs font-medium mb-1.5">Read by:</div>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {receipts.map((receipt) => (
              <div key={receipt.userId} className="flex items-center gap-2">
                {receipt.avatar ? (
                  <img
                    src={receipt.avatar}
                    alt={receipt.userName}
                    className="w-4 h-4 rounded-full"
                  />
                ) : (
                  <div className="w-4 h-4 rounded-full bg-accent flex items-center justify-center">
                    <span className="text-[8px]">
                      {receipt.userName[0].toUpperCase()}
                    </span>
                  </div>
                )}
                <span className="text-xs flex-1 truncate">{receipt.userName}</span>
                <span className="text-[10px] text-muted-foreground">
                  {formatTime(receipt.readAt)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// Typing Indicator Component
export function TypingIndicator({ users }: { users: string[] }) {
  if (users.length === 0) return null

  const text = users.length === 1
    ? `${users[0]} is typing...`
    : users.length === 2
    ? `${users[0]} and ${users[1]} are typing...`
    : `${users[0]} and ${users.length - 1} others are typing...`

  return (
    <div className="flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground">
      <div className="flex gap-1">
        <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.3s]" />
        <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.15s]" />
        <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
      </div>
      <span>{text}</span>
    </div>
  )
}

// Message Status Badge
export function MessageStatusBadge({ status }: { status: MessageStatus }) {
  const getStatusText = () => {
    switch (status) {
      case 'sending':
        return 'Sending...'
      case 'sent':
        return 'Sent'
      case 'delivered':
        return 'Delivered'
      case 'read':
        return 'Read'
      case 'error':
        return 'Failed to send'
      default:
        return ''
    }
  }

  const getStatusColor = () => {
    switch (status) {
      case 'sending':
        return 'text-muted-foreground'
      case 'sent':
      case 'delivered':
        return 'text-muted-foreground'
      case 'read':
        return 'text-primary'
      case 'error':
        return 'text-red-500'
      default:
        return ''
    }
  }

  return (
    <div className={cn('inline-flex items-center gap-1', getStatusColor())}>
      {status === 'sending' && <Clock className="h-3 w-3 animate-pulse" />}
      {status === 'sent' && <Check className="h-3 w-3" />}
      {status === 'delivered' && <CheckCheck className="h-3 w-3" />}
      {status === 'read' && <Eye className="h-3 w-3" />}
      {status === 'error' && <span className="text-xs">⚠️</span>}
      <span className="text-xs">{getStatusText()}</span>
    </div>
  )
}

// Seen By Component for Group Chats
export function SeenBy({ users, maxDisplay = 3 }: { users: { id: string; name: string; avatar?: string }[]; maxDisplay?: number }) {
  const displayUsers = users.slice(0, maxDisplay)
  const remainingCount = users.length - maxDisplay

  if (users.length === 0) return null

  return (
    <div className="flex items-center gap-1">
      <span className="text-xs text-muted-foreground">Seen by</span>
      <div className="flex -space-x-2">
        {displayUsers.map((user) => (
          <div
            key={user.id}
            className="w-5 h-5 rounded-full border-2 border-background overflow-hidden"
            title={user.name}
          >
            {user.avatar ? (
              <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-accent flex items-center justify-center">
                <span className="text-[8px] font-medium">
                  {user.name[0].toUpperCase()}
                </span>
              </div>
            )}
          </div>
        ))}
        {remainingCount > 0 && (
          <div className="w-5 h-5 rounded-full border-2 border-background bg-accent flex items-center justify-center">
            <span className="text-[8px] font-medium">+{remainingCount}</span>
          </div>
        )}
      </div>
    </div>
  )
}
