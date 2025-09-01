"use client"

import React from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

export type AnimatedButtonProps = {
  href: string
  children: React.ReactNode
  className?: string
  variant?: 'primary' | 'secondary'
  'aria-label'?: string
}

export function AnimatedButton({ 
  href, 
  children, 
  className, 
  variant = 'primary',
  'aria-label': ariaLabel 
}: AnimatedButtonProps) {
  return (
    <Link
      href={href}
      aria-label={ariaLabel}
      className={cn(
        'group relative overflow-hidden rounded-xl px-6 py-3 text-base font-semibold transition-all duration-300',
        'transform hover:scale-105 active:scale-95 w-full sm:w-auto',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
        variant === 'primary' && [
          'bg-brand-gradient text-white shadow-lg shadow-fuchsia-500/20',
          'hover:shadow-xl hover:shadow-fuchsia-500/30',
          'focus-visible:ring-white/70',
          'before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent',
          'before:translate-x-[-100%] before:transition-transform before:duration-700',
          'hover:before:translate-x-[100%]'
        ],
        variant === 'secondary' && [
          'border border-white/30 bg-white/10 text-white/90 shadow-sm backdrop-blur-md',
          'hover:bg-white/15 hover:border-white/40',
          'focus-visible:ring-white/60',
          'dark:border-slate-700/50 dark:bg-slate-800/60 dark:hover:bg-slate-800/70'
        ],
        className
      )}
    >
      <span className="relative z-10">{children}</span>
    </Link>
  )
}

// no default export
