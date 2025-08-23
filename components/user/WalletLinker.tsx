"use client"

import React, { useCallback, useMemo, useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { profileService } from '@/services/profile-service'
import { supabase } from '@/lib/supabase/client'

export interface WalletLinkerProps {
  currentAddress?: string | null
  onChange?: (address: string | null) => void
}

// Named export only
export function WalletLinker({ currentAddress, onChange }: WalletLinkerProps) {
  const { publicKey, connected, disconnect } = useWallet()
  const [isBusy, setIsBusy] = useState(false)

  const connectedAddress = useMemo(() => publicKey?.toBase58() ?? null, [publicKey])

  const truncate = (addr: string) => `${addr.slice(0, 4)}…${addr.slice(-4)}`

  const link = useCallback(async () => {
    if (!connectedAddress) return
    setIsBusy(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      await profileService.updateProfile(user?.id || '', { solana_address: connectedAddress })
      onChange?.(connectedAddress)
    } catch (e) {
      console.error('Failed to link wallet', e)
      alert('Failed to link wallet. Please try again.')
    } finally {
      setIsBusy(false)
    }
  }, [connectedAddress, onChange])

  const unlink = useCallback(async () => {
    setIsBusy(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      await profileService.updateProfile(user?.id || '', { solana_address: null })
      onChange?.(null)
    } catch (e) {
      console.error('Failed to unlink wallet', e)
      alert('Failed to unlink wallet. Please try again.')
    } finally {
      setIsBusy(false)
    }
  }, [onChange])

  return (
    <div className="mt-6 p-4 border rounded-lg bg-white">
      <h3 className="text-sm font-semibold text-gray-900 mb-2">Solana Wallet</h3>
      <p className="text-sm text-gray-600 mb-4">
        Link a wallet to enable on-chain features. You can unlink anytime.
      </p>

      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <WalletMultiButton className="!h-9 !px-3 !rounded-md" />
          {connected && connectedAddress && (
            <span className="text-xs text-gray-500">Connected: {truncate(connectedAddress)}</span>
          )}
        </div>

        {currentAddress ? (
          <div className="flex items-center justify-between rounded-md bg-indigo-50 px-3 py-2">
            <span className="text-sm text-indigo-700">Linked: {truncate(currentAddress)}</span>
            <div className="flex items-center gap-2">
              <button
                disabled={isBusy}
                onClick={unlink}
                className="text-xs px-3 py-1 rounded-md bg-white border border-gray-300 hover:bg-gray-100 disabled:opacity-50"
              >
                Unlink
              </button>
              {connected && connectedAddress && connectedAddress !== currentAddress && (
                <button
                  disabled={isBusy}
                  onClick={link}
                  className="text-xs px-3 py-1 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
                >
                  Link Connected
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between rounded-md bg-gray-50 px-3 py-2">
            <span className="text-sm text-gray-600">No wallet linked</span>
            <button
              disabled={isBusy || !connected || !connectedAddress}
              onClick={link}
              className="text-xs px-3 py-1 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {connected ? 'Link Wallet' : 'Connect to Link'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
