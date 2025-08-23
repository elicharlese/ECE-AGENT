'use client'

import { cn } from '@/lib/utils'

interface TypingIndicatorProps {
  users: Array<{ id: string; name: string; avatar?: string }>
  className?: string
}

export function TypingIndicator({ users, className }: TypingIndicatorProps) {
  if (users.length === 0) return null

  const displayText = 
    users.length === 1 
      ? `${users[0].name} is typing...`
      : users.length === 2
      ? `${users[0].name} and ${users[1].name} are typing...`
      : `${users[0].name} and ${users.length - 1} others are typing...`

  return (
    <div className={cn("flex items-center gap-2 px-4 py-2", className)}>
      <div className="flex items-center gap-1">
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
      <span className="text-sm text-gray-500">{displayText}</span>
    </div>
  )
}
