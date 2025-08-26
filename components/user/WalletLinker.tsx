'use client'

import React from 'react'

export type WalletLinkerProps = {
  currentAddress: string | null
  onChange?: (address: string | null) => void
}

// Minimal stub to satisfy imports and keep UI clean. You can later wire real wallet logic.
export function WalletLinker({ currentAddress, onChange }: WalletLinkerProps) {
  const linked = Boolean(currentAddress)

  return (
    <div className="mt-6 rounded-lg border p-4 bg-white">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-medium">Solana Wallet</div>
          <div className="text-xs text-gray-500">
            {linked ? `Linked: ${currentAddress}` : 'No wallet linked'}
          </div>
        </div>
        <div className="flex gap-2">
          {linked ? (
            <button
              type="button"
              className="px-3 py-1.5 text-xs rounded-md border hover:bg-gray-50"
              onClick={() => onChange?.(null)}
            >
              Unlink
            </button>
          ) : (
            <button
              type="button"
              className="px-3 py-1.5 text-xs rounded-md bg-blue-600 text-white hover:bg-blue-700"
              onClick={() => onChange?.('stub-address')}
            >
              Link Wallet
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
