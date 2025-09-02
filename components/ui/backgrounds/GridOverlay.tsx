import React from 'react'
import clsx from 'clsx'

export type GridOverlayProps = {
  className?: string
}

// Subtle grid lines + soft radial tint overlay. Non-interactive.
export function GridOverlay({ className }: GridOverlayProps) {
  return (
    <div
      aria-hidden
      className={clsx(
        'pointer-events-none absolute inset-0 -z-10',
        className,
      )}
    >
      {/* Grid lines */}
      <div
        className={clsx(
          'absolute inset-0 opacity-20 dark:opacity-30',
          // 32px grid using two linear-gradients
          "bg-[linear-gradient(to_right,rgba(255,255,255,0.07)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.07)_1px,transparent_1px)] bg-[size:32px_32px]",
          'dark:[--grid-color:rgba(255,255,255,0.08)]',
        )}
      />
      {/* Soft brand glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.06),transparent_60%)]" />
    </div>
  )
}

// no default export
