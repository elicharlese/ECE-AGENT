import React from 'react'
import clsx from 'clsx'

export type VignetteProps = {
  className?: string
}

// Soft radial vignette to darken edges and focus content. Non-interactive.
export function Vignette({ className }: VignetteProps) {
  return (
    <div
      aria-hidden
      className={clsx(
        'pointer-events-none absolute inset-0 -z-10',
        'bg-[radial-gradient(120%_120%_at_50%_10%,rgba(10,12,24,0)_40%,rgba(6,8,16,0.6)_75%,rgba(4,6,12,0.85))]',
        className,
      )}
    />
  )
}

// no default export
