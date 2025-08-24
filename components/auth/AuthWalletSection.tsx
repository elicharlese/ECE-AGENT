"use client"

import React from 'react'
import { useWalletModal } from '@solana/wallet-adapter-react-ui'
import { Button } from '@/components/ui/button'
import { Wallet } from 'lucide-react'

export function AuthWalletSection() {
  // Minimal wallet UI: a single button that opens the wallet modal.
  // Styled to exactly match the Google outline button.
  const { setVisible } = useWalletModal()
  return (
    <div>
      <Button
        type="button"
        variant="outline"
        onClick={() => setVisible(true)}
        className="w-full h-12 border-2 border-gray-200 hover:border-indigo-300 text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 font-semibold rounded-xl transition-all duration-200 bg-white/70 backdrop-blur-sm"
      >
        <Wallet className="mr-3 h-5 w-5 text-indigo-500" />
        Connect Wallet
      </Button>
    </div>
  )
}
