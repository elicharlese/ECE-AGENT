"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { CREDITS_ENABLED } from '@/lib/pricing'
import { toast } from 'sonner'

interface BuyCreditsButtonProps {
  packageId?: string
  label?: string
  size?: 'sm' | 'default' | 'lg' | 'icon'
  className?: string
}

export function BuyCreditsButton({ packageId = 'credits_100', label = 'Buy Credits', size = 'sm', className }: BuyCreditsButtonProps) {
  const [loading, setLoading] = useState(false)
  if (!CREDITS_ENABLED) return null

  const onClick = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packageId }),
      })
      const data = await res.json()
      if (!res.ok || !data.url) {
        toast.error(data.error || 'Unable to start checkout')
        return
      }
      window.location.href = data.url
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Checkout failed'
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button variant="outline" size={size} onClick={onClick} disabled={loading} className={className}>
      {loading ? 'Redirecting…' : label}
    </Button>
  )
}
