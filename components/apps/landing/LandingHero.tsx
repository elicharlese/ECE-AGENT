"use client"

import React from 'react'
import { GridOverlay } from '@/components/ui/backgrounds/GridOverlay'
import { Vignette } from '@/components/ui/backgrounds/Vignette'
import { LightDim } from '@/components/ui/backgrounds/LightDim'
import { GlassCard } from '@/components/ui/GlassCard'
import { HeroCopy } from '@/components/ui/HeroCopy'
import { InteractiveChatPreview } from '@/components/ui/InteractiveChatPreview'
import { ThemeToggle } from '@/components/ui/ThemeToggle'

export type LandingHeroProps = {
  className?: string
}

export function LandingHero({ className }: LandingHeroProps) {
  return (
    <div className={className}>
      {/* Background stack */}
      <GridOverlay className="-z-10" />
      <Vignette className="-z-10" />
      {/* Light-mode dimmer to improve contrast without affecting dark mode */}
      <LightDim className="-z-10" />

      {/* Theme toggle - positioned absolutely, responsive */}
      <div className="pointer-events-auto absolute right-4 top-4 z-20 sm:right-6 sm:top-6">
        <ThemeToggle />
      </div>

      {/* Foreground content */}
      <div className="pointer-events-none relative z-10">
        <div className="mx-auto grid min-h-[100svh] w-full max-w-6xl grid-cols-1 gap-6 px-4 py-16 sm:px-6 sm:py-20 md:gap-8 md:py-24 lg:grid-cols-2 lg:gap-10 lg:py-32 xl:py-40">
          <HeroCopy className="pointer-events-auto" />

          {/* Interactive chat preview - responsive */}
          <div className="order-last">
            <InteractiveChatPreview className="w-full" />
          </div>
        </div>
      </div>
    </div>
  )
}
// no default export
