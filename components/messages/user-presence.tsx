'use client'

import { cn } from '@/lib/utils'

export type PresenceStatus = 'online' | 'away' | 'busy' | 'offline'

interface UserPresenceProps {
  status: PresenceStatus
  showLabel?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const statusColors: Record<PresenceStatus, string> = {
  online: 'bg-green-500',
  away: 'bg-yellow-500',
  busy: 'bg-red-500',
  offline: 'bg-gray-400',
}

const statusLabels: Record<PresenceStatus, string> = {
  online: 'Online',
  away: 'Away',
  busy: 'Busy',
  offline: 'Offline',
}

const sizeClasses = {
  sm: 'w-2 h-2',
  md: 'w-3 h-3',
  lg: 'w-4 h-4',
}

export function UserPresence({ 
  status, 
  showLabel = false, 
  size = 'md',
  className 
}: UserPresenceProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className={cn(
        "rounded-full",
        statusColors[status],
        sizeClasses[size],
        status === 'online' && 'animate-pulse'
      )} />
      {showLabel && (
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {statusLabels[status]}
        </span>
      )}
    </div>
  )
}
