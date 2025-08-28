'use client'

import * as React from 'react'
import dynamic from 'next/dynamic'
import { Bot, Wallet } from 'lucide-react'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer'
import { WalletLinker } from '@/components/user/WalletLinker'

// Lazy-load ChatWindow to avoid importing Supabase client in test/SSR envs
const ChatWindow = dynamic(
  () => import('@/components/chat/chat-window-simple').then((m) => m.ChatWindow),
  { ssr: false },
)

// Simple clamp utility
const clamp = (val: number, min: number, max: number) => Math.min(Math.max(val, min), max)

export function PinnedDrawerTabs() {
  const [agentOpen, setAgentOpen] = React.useState(false)
  const [walletOpen, setWalletOpen] = React.useState(false)

  // Drag position state (persisted)
  const [top, setTop] = React.useState<number>(240)
  const [rightOffset, setRightOffset] = React.useState<number>(16)
  const draggingRef = React.useRef<{
    startY: number
    startX: number
    startTop: number
    startRight: number
  } | null>(null)

  // Load persisted position on mount
  React.useEffect(() => {
    try {
      const savedTop = localStorage.getItem('pinnedDockTop')
      const savedRight = localStorage.getItem('pinnedDockRight')
      if (savedTop) setTop(Number(savedTop))
      if (savedRight) setRightOffset(Number(savedRight))
    } catch {}
  }, [])

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    draggingRef.current = {
      startY: e.clientY,
      startX: e.clientX,
      startTop: top,
      startRight: rightOffset,
    }
    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', onPointerUp)
  }

  const onPointerMove = (e: PointerEvent) => {
    const s = draggingRef.current
    if (!s) return
    const dy = e.clientY - s.startY
    const dx = e.clientX - s.startX

    // Move vertically (top) and allow slight horizontal drag by adjusting right offset
    const vh = window.innerHeight
    const minTop = 48
    const maxTop = vh - 140 // keep within viewport
    setTop((t) => clamp(s.startTop + dy, minTop, maxTop))

    // Allow sliding the dock left/right a bit while staying pinned to the right
    const minRight = 8
    const maxRight = 220
    setRightOffset((r) => clamp(s.startRight + (s.startX - e.clientX), minRight, maxRight))
  }

  const onPointerUp = () => {
    draggingRef.current = null
    window.removeEventListener('pointermove', onPointerMove)
    window.removeEventListener('pointerup', onPointerUp)
    try {
      localStorage.setItem('pinnedDockTop', String(top))
      localStorage.setItem('pinnedDockRight', String(rightOffset))
    } catch {}
  }

  return (
    <>
      {/* Pinned Dock */}
      <div
        data-testid="pinned-dock"
        className="fixed z-40 flex flex-col items-end gap-2 select-none"
        style={{ top, right: rightOffset }}
        role="toolbar"
        aria-label="Pinned quick actions"
      >
        {/* Agent Tab */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            setAgentOpen(true)
          }}
          className="group inline-flex items-center gap-2 rounded-l-full border border-gray-200 bg-white px-3 py-2 shadow hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Open Agent Chat"
          title="Agent Chat"
        >
          <Bot className="h-5 w-5 text-gray-700" />
          <span className="pointer-events-none hidden sm:block text-sm text-gray-700">Agent</span>
        </button>

        {/* Wallet Tab */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            setWalletOpen(true)
          }}
          className="group inline-flex items-center gap-2 rounded-l-full border border-gray-200 bg-white px-3 py-2 shadow hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Open Wallet Manager"
          title="Wallet Manager"
        >
          <Wallet className="h-5 w-5 text-gray-700" />
          <span className="pointer-events-none hidden sm:block text-sm text-gray-700">Wallet</span>
        </button>

        {/* Drag affordance */}
        <div
          className="mr-1 mt-1 h-3 w-6 rounded-full bg-gray-200 cursor-grab active:cursor-grabbing"
          aria-hidden="true"
          onPointerDown={onPointerDown}
          title="Drag to reposition"
        />
      </div>

      {/* Agent Drawer */}
      <Drawer open={agentOpen} onOpenChange={setAgentOpen} direction="right">
        <DrawerContent className="sm:max-w-md">
          <DrawerHeader>
            <DrawerTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5" /> Quick Agent Chat
            </DrawerTitle>
          </DrawerHeader>
          <div className="h-[80vh] overflow-hidden border-t">
            {agentOpen ? (
              <ChatWindow
                chatId="ai"
                onToggleAgent={() => {}}
                onToggleMCP={() => {}}
                onToggleContactInfo={() => {}}
                onOpenMCPSettings={() => {}}
              />
            ) : null}
          </div>
        </DrawerContent>
      </Drawer>

      {/* Wallet Drawer */}
      <Drawer open={walletOpen} onOpenChange={setWalletOpen} direction="right">
        <DrawerContent className="sm:max-w-md">
          <DrawerHeader>
            <DrawerTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5" /> Wallet Manager
            </DrawerTitle>
          </DrawerHeader>
          <div className="p-4 border-t">
            <WalletLinker currentAddress={null} onChange={() => {}} />
          </div>
        </DrawerContent>
      </Drawer>
    </>
  )
}
