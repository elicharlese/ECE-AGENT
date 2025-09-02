import React from 'react'
import clsx from 'clsx'

export type GlassCardProps = React.PropsWithChildren<{
  className?: string
  as?: keyof JSX.IntrinsicElements
  role?: string
}>

// Frosted glass panel with soft border and blur, suitable for dark/light themes.
export function GlassCard({ children, className, as: Tag = 'div', role }: GlassCardProps) {
  return (
    <Tag
      role={role}
      className={clsx(
        'rounded-3xl border backdrop-blur-md',
        'border-white/20 bg-white/10 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]',
        'dark:border-slate-700/50 dark:bg-slate-900/40',
        className,
      )}
    >
      {children}
    </Tag>
  )
}

// no default export
