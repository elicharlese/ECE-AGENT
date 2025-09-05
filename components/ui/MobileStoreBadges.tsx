"use client"

import React from 'react'
import { cn } from '@/lib/utils'

export type MobileStoreBadgesProps = {
  className?: string
}

// Named export only, per repo rules
export function MobileStoreBadges({ className }: MobileStoreBadgesProps) {
  const iosUrl = process.env.NEXT_PUBLIC_MOBILE_APPSTORE_URL || process.env.NEXT_PUBLIC_MOBILE_TESTFLIGHT_URL || ''
  const androidUrl = process.env.NEXT_PUBLIC_MOBILE_PLAY_URL || ''
  // Apple-provided official badge asset URL (e.g., hosted in /public or via Apple Marketing Tools)
  const appStoreBadgeSrc = process.env.NEXT_PUBLIC_APPLE_BADGE_IMAGE_URL || ''

  if (!iosUrl && !androidUrl) return null

  return (
    <div className={cn('mt-4 flex items-center gap-3', className)}>
      {iosUrl && appStoreBadgeSrc && (
        <a
          href={iosUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Download on the App Store"
          className="inline-flex items-center justify-center"
        >
          {/* Official Apple badge image; must not be modified or animated */}
          <img
            src={appStoreBadgeSrc}
            alt="Download on the App Store"
            className="h-10 w-auto"
            loading="lazy"
            decoding="async"
          />
        </a>
      )}
      {androidUrl && (
        <a
          href={androidUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Get it on Google Play"
          className="inline-flex h-10 items-center justify-center rounded-md border border-emerald-700/20 bg-emerald-600 px-3 text-xs font-medium text-white shadow-sm transition hover:bg-emerald-500"
        >
          <span className="leading-none">
            <span className="block text-[0.6rem] opacity-90">GET IT ON</span>
            <span className="-mt-0.5 block text-sm font-semibold">Google Play</span>
          </span>
        </a>
      )}
    </div>
  )
}
