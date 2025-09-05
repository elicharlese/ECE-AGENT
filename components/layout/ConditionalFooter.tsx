"use client"

import { usePathname } from 'next/navigation'
import { SiteFooter } from '@/components/layout/SiteFooter'

const HIDE_PREFIXES = ['/messages', '/auth']

export function ConditionalFooter() {
  const pathname = usePathname() || ''
  const hide = HIDE_PREFIXES.some((p) => pathname.startsWith(p))
  if (hide) return null
  return <SiteFooter />
}
