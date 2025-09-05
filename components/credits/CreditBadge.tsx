"use client"

import { useEffect, useState } from 'react'
import { Badge } from '@/libs/design-system'
import { getCreditBalance } from '@/services/credit-service'
import { CREDITS_ENABLED } from '@/lib/pricing'

export function CreditBadge() {
  const [balance, setBalance] = useState<number>(0)

  useEffect(() => {
    if (!CREDITS_ENABLED) return
    let active = true
    getCreditBalance().then(b => {
      if (active) setBalance(b.balance || 0)
    }).catch(() => {})
    return () => { active = false }
  }, [])

  if (!CREDITS_ENABLED) return null

  return (
    <Badge variant="secondary" className="text-xs">
      Credits: {balance}
    </Badge>
  )
}
