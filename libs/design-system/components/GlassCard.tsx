'use client'

import * as React from 'react'
import { cn } from '../utils'

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string
  children?: React.ReactNode
  blur?: 'sm' | 'md' | 'lg' | 'xl'
  opacity?: number
}

export function GlassCard({
  className,
  children,
  blur = 'md',
  opacity = 0.1,
  ...props
}: GlassCardProps) {
  const blurClasses = {
    sm: 'backdrop-blur-sm',
    md: 'backdrop-blur-md', 
    lg: 'backdrop-blur-lg',
    xl: 'backdrop-blur-xl'
  }

  return (
    <div
      className={cn(
        'rounded-lg border border-white/20 bg-white/10 shadow-lg',
        'dark:border-white/10 dark:bg-white/5',
        blurClasses[blur],
        className
      )}
      style={{
        backgroundColor: `rgba(255, 255, 255, ${opacity})`,
      }}
      {...props}
    >
      {children}
    </div>
  )
}
