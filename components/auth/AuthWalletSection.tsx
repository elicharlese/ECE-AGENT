"use client"

import React, { useCallback, useMemo, useState } from 'react'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { supabase } from '@/lib/supabase/client'
import { profileService } from '@/services/profile-service'
import { toast } from '@/components/ui/use-toast'
import { CheckCircle2, Copy } from 'lucide-react'

export function AuthWalletSection() {
  const { publicKey, connected } = useWallet()
  const { connection } = useConnection()
  const [isBusy, setIsBusy] = useState(false)
  const [status, setStatus] = useState<string | null>(null)

  const connectedAddress = useMemo(() => publicKey?.toBase58() ?? null, [publicKey])

  const networkLabel = useMemo(() => {
    const ep = (connection as any)?.rpcEndpoint ?? (connection as any)?._rpcEndpoint ?? ''
    if (typeof ep === 'string') {
      if (ep.includes('devnet')) return 'devnet'
      if (ep.includes('testnet')) return 'testnet'
      if (ep.includes('mainnet')) return 'mainnet'
      if (ep) return 'custom'
    }
    return 'unknown'
  }, [connection])

  const truncate = (addr: string) => `${addr.slice(0, 4)}…${addr.slice(-4)}`

  const link = useCallback(async () => {
    if (!connectedAddress) return
    setIsBusy(true)
    setStatus(null)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setStatus('Please sign in first, then link your connected wallet.')
        toast({ title: 'Sign in required', description: 'Sign in before linking your wallet.' })
        return
      }
      await profileService.updateProfile(user.id, { solana_address: connectedAddress })
      setStatus('Wallet linked to your profile.')
    } catch (e) {
      console.error('Auth wallet link failed', e)
      setStatus('Failed to link wallet. Please try again.')
    } finally {
      setIsBusy(false)
    }
  }, [connectedAddress])

  const handleCopy = useCallback(async () => {
    if (!connectedAddress) return
    try {
      await navigator.clipboard.writeText(connectedAddress)
      toast({ title: 'Copied address', description: connectedAddress })
    } catch {
      toast({ title: 'Copy failed', description: 'Unable to copy address. Please try again.' })
    }
  }, [connectedAddress])

  return (
    <div className="mt-6">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-white text-gray-500 font-medium">Or connect a wallet</span>
        </div>
      </div>

      <div className="mt-6 p-5 rounded-2xl border border-white/30 bg-white/80 backdrop-blur-2xl shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-base font-semibold text-gray-900">Solana Wallet</h3>
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 border border-gray-200">
            {networkLabel}
          </span>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          Connect a wallet. After signing in, you can link it to your profile for on‑chain features.
        </p>

        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <WalletMultiButton className="!h-11 !px-5 !rounded-xl !bg-violet-600 hover:!bg-violet-700 !text-white !font-semibold shadow-md">
              Select Wallet
            </WalletMultiButton>
            {connected && connectedAddress && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                <CheckCircle2 className="h-3.5 w-3.5" />
                {truncate(connectedAddress)}
              </span>
            )}
            {connected && connectedAddress && (
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center justify-center h-7 w-7 rounded-md border border-gray-200 text-gray-600 hover:bg-gray-50"
                aria-label="Copy address"
              >
                <Copy className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center justify-between rounded-xl bg-gray-50/80 px-3.5 py-2.5 border border-gray-100">
            <span className="text-sm text-gray-600">
              {connected ? 'Link your currently connected wallet' : 'Connect a wallet to link it'}
            </span>
            <button
              disabled={isBusy || !connected || !connectedAddress}
              onClick={link}
              className="text-xs px-3.5 py-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {connected ? 'Link Wallet' : 'Connect to Link'}
            </button>
          </div>

          {status && (
            <div className="text-xs text-gray-600">{status}</div>
          )}
        </div>
      </div>
    </div>
  )
}
