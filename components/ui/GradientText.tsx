import React from 'react'
import clsx from 'clsx'

export type GradientTextProps = React.PropsWithChildren<{
  className?: string
}>

export function GradientText({ children, className }: GradientTextProps) {
  return (
    <span
      className={clsx(
        'text-brand-gradient bg-clip-text text-transparent',
        className,
      )}
    >
      {children}
    </span>
  )
}

// no default export
