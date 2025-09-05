import React from 'react'
import { cn } from '@/lib/utils'

export type SiteFooterProps = {
  className?: string
}

// Named export only; server component is fine
export function SiteFooter({ className }: SiteFooterProps) {
  return (
    <footer className={cn('border-t border-border/50 text-xs text-muted-foreground', className)}>
      <div className="mx-auto max-w-6xl px-4 py-6 text-center leading-relaxed">
        <p>
          App Store is a service mark of Apple Inc., registered in the U.S. and other countries and regions.
        </p>
      </div>
    </footer>
  )
}
