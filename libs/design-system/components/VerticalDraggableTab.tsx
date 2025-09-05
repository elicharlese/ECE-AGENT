'use client'

import * as React from 'react'
import { cn } from '../utils'

interface VerticalDraggableTabProps {
  children: React.ReactNode
  className?: string
  onDragStart?: () => void
  onDragEnd?: () => void
}

export function VerticalDraggableTab({
  children,
  className,
  onDragStart,
  onDragEnd,
  ...props
}: VerticalDraggableTabProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-center p-2 rounded-md hover:bg-accent cursor-pointer',
        className
      )}
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      {...props}
    >
      {children}
    </div>
  )
}
