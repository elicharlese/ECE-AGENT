"use client"

import { useEffect, useMemo, useState } from "react"
import { Coins, ExternalLink } from "lucide-react"
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Progress, Popover, PopoverContent, PopoverTrigger } from '@/libs/design-system'
import { Badge } from '@/libs/design-system'
import { clientEnv } from "@/lib/env-validation"
import { useToast } from '@/libs/design-system'

// Named export only, per repo rules
export function CreditsPopover() {
  const [balance, setBalance] = useState<number | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()
  const [checkingOut, setCheckingOut] = useState<number | null>(null)

  useEffect(() => {
    let cancelled = false
    const run = async () => {
      try {
        setLoading(true)
        const res = await fetch("/api/credits/balance", { cache: "no-store" })
        const json = await res.json().catch(() => ({})) as { balance?: number }
        if (!cancelled) setBalance(typeof json.balance === "number" ? json.balance : 0)
      } catch (e) {
        if (!cancelled) setError("Failed to load balance")
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    run()
    return () => { cancelled = true }
  }, [])

  // Success toast after returning from checkout (expects URL params like ?credits_success=1&credits_added=500)
  useEffect(() => {
    try {
      if (typeof window === "undefined") return
      const url = new URL(window.location.href)
      const success = url.searchParams.get("credits_success")
      const added = url.searchParams.get("credits_added")
      if (success === "1" || success === "true") {
        toast({
          title: "Credits added",
          description: added ? `${added} credits were added to your balance.` : "Your purchase was successful.",
        })
        url.searchParams.delete("credits_success")
        url.searchParams.delete("credits_added")
        const qs = url.searchParams.toString()
        window.history.replaceState({}, "", url.pathname + (qs ? `?${qs}` : "") + url.hash)
      }
    } catch {
      // no-op
    }
  }, [toast])

  const purchaseUrl = useMemo(() => clientEnv.CREDITS_PURCHASE_URL || "", [])

  async function startCheckout(amount: number) {
    // If Payment Link is configured, prefer it as simple fallback
    if (purchaseUrl) {
      const href = `${purchaseUrl}${purchaseUrl.includes("?") ? "&" : "?"}amount=${amount}`
      window.open(href, "_blank")
      return
    }
    try {
      setCheckingOut(amount)
      const res = await fetch("/api/credits/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount }),
      })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        throw new Error(j?.error || "Unable to start checkout")
      }
      const data = await res.json().catch(() => ({})) as { url?: string }
      if (data?.url) {
        window.location.href = data.url
      } else {
        throw new Error("Checkout URL missing")
      }
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : (typeof e === 'string' ? e : 'Please try again later.')
      toast({ title: "Checkout failed", description: message })
    } finally {
      setCheckingOut(null)
    }
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" title="Credits" aria-label="Credits">
          <Coins className="h-4 w-4" />
          {typeof balance === "number" ? (
            <Badge variant="secondary" className="ml-1 h-5 text-[0.65rem]">
              {balance}
            </Badge>
          ) : loading ? (
            <span className="ml-1 h-5 w-6 rounded bg-gray-300 dark:bg-gray-700 animate-pulse" />
          ) : null}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-72">
        <div className="flex items-start justify-between">
          <div>
            <h4 className="font-medium">Credits</h4>
            <p className="text-xs text-muted-foreground">Use credits for AI requests and tools</p>
          </div>
          <Coins className="h-4 w-4 text-amber-500" />
        </div>

        <div className="mt-3 rounded-md border p-3">
          <div className="text-xs text-muted-foreground">Current balance</div>
          <div className="mt-1 text-2xl font-semibold">
            {loading ? "…" : (typeof balance === "number" ? balance : "—")}
          </div>
        </div>

        <div className="mt-3 grid grid-cols-3 gap-2">
          {[100, 500, 1000].map((amt) => (
            <button
              key={amt}
              type="button"
              onClick={() => startCheckout(amt)}
              disabled={!!checkingOut}
              className={`inline-flex items-center justify-center rounded-md border px-2 py-1.5 text-xs transition ${
                checkingOut ? "opacity-60 cursor-not-allowed" : "hover:bg-accent hover:text-accent-foreground"
              }`}
            >
              {checkingOut === amt ? "…" : `+${amt}`}
            </button>
          ))}
        </div>

        <div className="mt-3 flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            {purchaseUrl ? "Buy credits via checkout" : "Set NEXT_PUBLIC_CREDITS_PURCHASE_URL to enable checkout"}
          </span>
          {purchaseUrl && (
            <a
              href={purchaseUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
            >
              Buy credits
              <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>

        {error && (
          <div className="mt-2 text-xs text-red-600">{error}</div>
        )}
      </PopoverContent>
    </Popover>
  )
}
