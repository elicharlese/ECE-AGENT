'use client'

import * as React from 'react'
import { cn } from '../utils'

interface VignetteProps {
  className?: string
  intensity?: number
}

export function Vignette({
  className,
  intensity = 0.5,
  ...props
}: VignetteProps) {
  return (
    <div
      className={cn(
        'absolute inset-0 pointer-events-none',
        className
      )}
      style={{
        background: `radial-gradient(circle, transparent 0%, rgba(0,0,0,${intensity}) 100%)`,
      }}
      {...props}
    />
  )
}
