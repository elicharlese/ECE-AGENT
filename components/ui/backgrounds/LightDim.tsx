import React from 'react'
import clsx from 'clsx'

export type LightDimProps = {
  className?: string
}

// Light-mode-only radial dimmer to improve foreground text contrast.
// Hidden in dark theme. Non-interactive.
export function LightDim({ className }: LightDimProps) {
  return (
    <div
      aria-hidden
      className={clsx(
        'pointer-events-none absolute inset-0 -z-10 dark:hidden',
        // Radial dim centered toward top-left where the hero copy lives
        // and a multiply blend to keep colors underneath while darkening.
        'mix-blend-multiply',
        'bg-[radial-gradient(120%_120%_at_22%_28%,rgba(0,0,0,0.55),rgba(0,0,0,0.3)_35%,rgba(0,0,0,0.12)_60%,transparent_80%)]',
        className,
      )}
    />
  )
}

// no default export
