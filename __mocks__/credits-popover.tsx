import React from 'react'
import { Coins } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

// Mock CreditsPopover that doesn't make fetch calls to avoid act() warnings
export function CreditsPopover() {
  return (
    <Button variant="ghost" size="sm" title="Credits" aria-label="Credits">
      <Coins className="h-4 w-4" />
      <Badge variant="secondary" className="ml-1 h-5 text-[0.65rem]">
        42
      </Badge>
    </Button>
  )
}
