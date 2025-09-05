'use client'

import * as React from 'react'
import { cn } from '../utils'

export type TiltGlassCardProps = React.PropsWithChildren<{
  className?: string
  /** maximum tilt in degrees */
  maxTilt?: number
  /** scale factor applied on hover */
  hoverScale?: number
  /** opacity of subtle glare highlight */
  glareOpacity?: number
  /** rounded radius utility (e.g. rounded-xl) */
  radiusClassName?: string
  /** extra container classes */
  containerClassName?: string
}>

/**
 * TiltGlassCard
 * A modern glassmorphism card with smooth 3D tilt + subtle glare that follows the cursor.
 * Designed to be performance friendly using rAF and transform-only updates.
 */
export function TiltGlassCard({
  className,
  children,
  maxTilt = 10,
  hoverScale = 1.02,
  glareOpacity = 0.18,
  radiusClassName = 'rounded-2xl',
  containerClassName,
}: TiltGlassCardProps) {
  const ref = React.useRef<HTMLDivElement | null>(null)
  const glareRef = React.useRef<HTMLDivElement | null>(null)
  const frame = React.useRef<number | null>(null)

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!ref.current) return
    const el = ref.current
    const rect = el.getBoundingClientRect()
    const px = (e.clientX - rect.left) / rect.width // 0..1
    const py = (e.clientY - rect.top) / rect.height // 0..1

    const rx = (py - 0.5) * (maxTilt * 2) // invert for natural feel
    const ry = (0.5 - px) * (maxTilt * 2)

    if (frame.current) cancelAnimationFrame(frame.current)
    frame.current = requestAnimationFrame(() => {
      el.style.transform = `perspective(1000px) rotateX(${rx}deg) rotateY(${ry}deg) scale(${hoverScale})`
      // update glare
      if (glareRef.current) {
        const gx = px * 100
        const gy = py * 100
        glareRef.current.style.background = `radial-gradient(circle at ${gx}% ${gy}%, rgba(255,255,255,${glareOpacity}), transparent 45%)`
      }
    })
  }

  const reset = () => {
    if (!ref.current) return
    if (frame.current) cancelAnimationFrame(frame.current)
    ref.current.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)'
    if (glareRef.current) glareRef.current.style.background = 'transparent'
  }

  return (
    <div
      className={cn('relative', containerClassName)}
      onPointerLeave={reset}
      onPointerCancel={reset}
      onPointerMove={handlePointerMove}
    >
      <div
        ref={ref}
        className={cn(
          radiusClassName,
          'border transition-transform duration-150 will-change-transform',
          // base glass styles
          'border-white/15 bg-white/10 backdrop-blur-md shadow-xl',
          'dark:border-white/10 dark:bg-white/5',
          className,
        )}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* glare layer */}
        <div
          ref={glareRef}
          aria-hidden
          className={cn(
            'pointer-events-none absolute inset-0',
            radiusClassName,
            'mix-blend-lighten',
          )}
          style={{ transform: 'translateZ(1px)' }}
        />
        {/* content */}
        <div className={cn(radiusClassName)}>{children}</div>
      </div>
    </div>
  )
}

// named export only
