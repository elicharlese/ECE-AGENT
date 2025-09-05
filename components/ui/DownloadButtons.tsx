"use client"

import React from 'react'
import { AnimatedButton } from '@/libs/design-system'

function getPlatform(): 'mac' | 'windows' | 'linux' | 'other' {
  if (typeof navigator === 'undefined') return 'other'
  const ua = navigator.userAgent
  if (/Macintosh|Mac OS X/i.test(ua)) return 'mac'
  if (/Windows/i.test(ua)) return 'windows'
  if (/Linux/i.test(ua)) return 'linux'
  return 'other'
}

export function DownloadButtons({ className }: { className?: string }) {
  // Default to 'other' to match SSR, then detect on mount to avoid hydration mismatch
  const [platform, setPlatform] = React.useState<'mac' | 'windows' | 'linux' | 'other'>('other')
  React.useEffect(() => {
    setPlatform(getPlatform())
  }, [])

  const macUrl = process.env.NEXT_PUBLIC_DESKTOP_DOWNLOAD_MAC || ''
  const winUrl = process.env.NEXT_PUBLIC_DESKTOP_DOWNLOAD_WIN || ''
  const linuxUrl = process.env.NEXT_PUBLIC_DESKTOP_DOWNLOAD_LINUX || ''

  // Fallback to Releases page if specific URLs are not configured
  const desktopReleaseUrl =
    process.env.NEXT_PUBLIC_DESKTOP_RELEASE_URL || 'https://github.com/elicharlese/AGENT/releases/latest'

  const iosUrl = process.env.NEXT_PUBLIC_MOBILE_APPSTORE_URL || process.env.NEXT_PUBLIC_MOBILE_TESTFLIGHT_URL || ''
  const androidUrl = process.env.NEXT_PUBLIC_MOBILE_PLAY_URL || ''

  const desktopHref =
    (platform === 'mac' && macUrl) ||
    (platform === 'windows' && winUrl) ||
    (platform === 'linux' && linuxUrl) ||
    macUrl ||
    winUrl ||
    linuxUrl ||
    desktopReleaseUrl

  const desktopLabel = React.useMemo(() => {
    switch (platform) {
      case 'mac':
        return 'Download for macOS'
      case 'windows':
        return 'Download for Windows'
      case 'linux':
        return 'Download for Linux'
      default:
        return 'Download Desktop'
    }
  }, [platform])

  const mobileHref =
    (platform === 'mac' && iosUrl) ||
    (platform === 'windows' && androidUrl) ||
    (platform === 'linux' && androidUrl) ||
    iosUrl ||
    androidUrl ||
    '#'

  const mobileLabel = React.useMemo(() => {
    if (mobileHref === iosUrl && iosUrl) return 'Get on App Store'
    if (mobileHref === androidUrl && androidUrl) return 'Get on Google Play'
    return 'Get Mobile App'
  }, [mobileHref, iosUrl, androidUrl])

  return (
    <div className={className}>
      <div className="mt-4 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
        <AnimatedButton
          href={desktopHref}
          variant="primary"
          aria-label={desktopLabel}
          className="pointer-events-auto"
        >
          {desktopLabel}
        </AnimatedButton>
        <AnimatedButton
          href={mobileHref}
          variant="secondary"
          aria-label={mobileLabel}
          className="pointer-events-auto"
        >
          {mobileLabel}
        </AnimatedButton>
      </div>
    </div>
  )
}
