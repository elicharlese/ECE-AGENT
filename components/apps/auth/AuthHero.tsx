"use client"

import React from 'react'
import { GridOverlay } from '@/components/ui/backgrounds/GridOverlay'
import { Vignette } from '@/components/ui/backgrounds/Vignette'
import { LightDim } from '@/components/ui/backgrounds/LightDim'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { GlassCard } from '@/components/ui/GlassCard'
import { LoginForm } from '@/components/login-form'

export type AuthHeroProps = {
  className?: string
}

export function AuthHero({ className }: AuthHeroProps) {
  return (
    <div className={className}>
      {/* Background stack */}
      <GridOverlay className="-z-10" />
      <Vignette className="-z-10" />
      <LightDim className="-z-10" />

      {/* Theme toggle */}
      <div className="pointer-events-auto absolute right-4 top-4 z-20 sm:right-6 sm:top-6">
        <ThemeToggle />
      </div>

      {/* Foreground content */}
      <div className="pointer-events-none relative z-10">
        <div className="flex min-h-[100svh] w-full items-center justify-center px-4 py-8 sm:px-6 md:px-8">
          <GlassCard className="pointer-events-auto w-full max-w-sm p-6 ring-glass sm:max-w-md sm:p-8">
            <div className="w-full">
              <LoginForm embedded />
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  )
}
