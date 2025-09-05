'use client'

import * as React from 'react'
import { cn } from '../utils'

interface LightDimProps {
  className?: string
  intensity?: number
}

export function LightDim({
  className,
  intensity = 0.3,
  ...props
}: LightDimProps) {
  return (
    <div
      className={cn(
        'absolute inset-0 pointer-events-none',
        className
      )}
      style={{
        backgroundColor: `rgba(0,0,0,${intensity})`,
      }}
      {...props}
    />
  )
}
