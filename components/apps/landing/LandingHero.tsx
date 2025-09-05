"use client"

import React from 'react'
import { GridOverlay } from '@/libs/design-system'
import { Vignette } from '@/libs/design-system'
import { LightDim } from '@/libs/design-system'
import { GlassCard } from '@/libs/design-system'
import { TiltGlassCard } from '@/libs/design-system'
import { HeroCopy } from '@/libs/design-system'
import { InteractiveChatPreview } from '@/libs/design-system'
import { ThemeToggle } from '@/libs/design-system'

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
        <div className="mx-auto grid min-h-full w-full max-w-7xl grid-cols-1 items-center gap-6 px-4 py-16 sm:px-6 sm:py-20 md:gap-8 md:py-24 lg:grid-cols-12 lg:gap-10 lg:py-28 xl:gap-12 xl:py-36 2xl:py-40">
          <HeroCopy className="pointer-events-auto lg:col-span-6 xl:col-span-5" />

          {/* Interactive chat preview - responsive */}
          <div className="order-last lg:order-none lg:col-span-6 xl:col-span-7 lg:pl-4 xl:pl-6">
            <TiltGlassCard
              className="p-3 sm:p-4 md:p-5 bg-white/10 dark:bg-white/5"
              containerClassName="w-full max-w-[700px] mx-auto lg:mx-0"
              radiusClassName="rounded-2xl"
              maxTilt={10}
              hoverScale={1.02}
            >
              <InteractiveChatPreview className="w-full" />
            </TiltGlassCard>
          </div>
        </div>
      </div>
    </div>
  )
}
// no default export
