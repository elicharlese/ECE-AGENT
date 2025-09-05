'use client'

import * as React from 'react'
import { cn } from '../utils'

interface GridOverlayProps {
  className?: string
  size?: number
  opacity?: number
}

export function GridOverlay({
  className,
  size = 20,
  opacity = 0.1,
  ...props
}: GridOverlayProps) {
  return (
    <div
      className={cn(
        'absolute inset-0 pointer-events-none',
        className
      )}
      style={{
        backgroundImage: `
          linear-gradient(to right, rgba(0,0,0,${opacity}) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(0,0,0,${opacity}) 1px, transparent 1px)
        `,
        backgroundSize: `${size}px ${size}px`,
      }}
      {...props}
    />
  )
}
