'use client'

import * as React from 'react'
import { cn } from '../utils'

export type ShinyButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  className?: string
  variant?: 'primary' | 'secondary' | 'glass'
  size?: 'md' | 'lg'
}

/**
 * ShinyButton
 * Glassmorphic button with animated sheen, soft drop shadow, and tasteful hover states.
 */
export const ShinyButton = React.forwardRef<HTMLButtonElement, ShinyButtonProps>(
  (
    { className, children, variant = 'primary', size = 'md', ...props },
    ref,
  ) => {
    const base =
      'relative inline-flex select-none items-center justify-center overflow-hidden rounded-xl backdrop-blur-md transition-all duration-200 active:translate-y-[1px]'
    const ring = 'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/60'
    const shadow = 'shadow-[0_10px_30px_-10px_rgba(37,99,235,0.45)] hover:shadow-[0_18px_40px_-12px_rgba(37,99,235,0.55)]'

    const sizes: Record<typeof size, string> = {
      md: 'px-4 py-2 text-sm',
      lg: 'px-5 py-3 text-base',
    }

    const variants: Record<typeof variant, string> = {
      primary:
        'text-white bg-gradient-to-br from-blue-500 to-indigo-600 border border-white/20',
      // High-contrast secondary in light mode (white text) and subtle in dark mode
      secondary:
        'text-white dark:text-blue-200 bg-slate-900/80 hover:bg-slate-900/90 border border-slate-900/30 dark:bg-white/10 dark:border-white/25',
      glass:
        'text-white dark:text-white/90 bg-slate-900/70 hover:bg-slate-900/80 border border-slate-900/30 dark:bg-white/10 dark:border-white/30',
    }

    return (
      <button
        ref={ref}
        className={cn(base, sizes[size], variants[variant], ring, shadow, className)}
        {...props}
      >
        {/* glossy top light */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-b from-white/30 to-transparent opacity-60" 
          style={{ transform: 'translateZ(0)' }}
        />
        {/* animated sheen */}
        <span
          aria-hidden
          className="shine pointer-events-none absolute -inset-y-6 -left-16 w-1/3 rotate-12 bg-gradient-to-r from-transparent via-white/70 to-transparent"
        />
        {/* inner content */}
        <span className="relative z-10 font-semibold tracking-wide">{children}</span>

        {/* local keyframes for sheen */}
        <style jsx>{`
          .shine {
            animation: shineMove 2.2s linear infinite;
            filter: blur(2px);
            opacity: 0.65;
          }
          @keyframes shineMove {
            0% { transform: translateX(-120%) rotate(12deg); }
            60% { transform: translateX(220%) rotate(12deg); }
            100% { transform: translateX(220%) rotate(12deg); }
          }
        `}</style>
      </button>
    )
  },
)

ShinyButton.displayName = 'ShinyButton'
