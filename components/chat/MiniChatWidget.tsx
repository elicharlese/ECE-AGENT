"use client"

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { Bot, Minimize2, Maximize2, X, Plus, Mic, Circle, Code2, Pin, PinOff } from "lucide-react"

// TODO: Replace deprecated components: Textarea
// 
// TODO: Replace deprecated components: Textarea
// import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/libs/design-system'
import { useWebSocket } from "@/hooks/use-websocket"
import { useHotkeys } from "@/hooks/use-hotkeys"
import { useHaptics } from "@/hooks/use-haptics"

// Lightweight draggable + resizable floating chat widget.
// - Fixed positioned (bottom-right by default)
// - Remembers position/size/minimized in localStorage
// - Tailwind-only styling; no external deps

export type MiniChatWidgetState = {
  minimized: boolean
  x: number // px from left
  y: number // px from top
  w: number
  h: number
}

export type MiniChatWidgetProps = {
  title?: string
  initialMinimized?: boolean
  initialX?: number
  initialY?: number
  initialW?: number
  initialH?: number
  conversationId?: string
}

const DEFAULT_W = 360
const DEFAULT_H = 420
const COMPACT_W = 280
const COMPACT_H = 260

const defaultX = () => (typeof window !== "undefined" ? Math.max(16, window.innerWidth - DEFAULT_W - 16) : 16)
const defaultY = () => (typeof window !== "undefined" ? Math.max(16, window.innerHeight - DEFAULT_H - 16) : 16)

const DEFAULT_STATE: MiniChatWidgetState = {
  minimized: true,
  x: defaultX(),
  y: defaultY(),
  w: DEFAULT_W,
  h: DEFAULT_H,
}

const STORAGE_KEY = "miniChatWidgetState"
const HINT_KEY = "miniChatWidgetHintSeen"

export function MiniChatWidget({
  title = "Quick Chat",
  initialMinimized,
  initialX,
  initialY,
  initialW,
  initialH,
  conversationId,
}: MiniChatWidgetProps) {
  const [state, setState] = useState<MiniChatWidgetState>(() => ({
    minimized: initialMinimized ?? DEFAULT_STATE.minimized,
    x: initialX ?? DEFAULT_STATE.x,
    y: initialY ?? DEFAULT_STATE.y,
    w: initialW ?? DEFAULT_STATE.w,
    h: initialH ?? DEFAULT_STATE.h,
  }))
  const [message, setMessage] = useState("")
  const [mounted, setMounted] = useState(false)
  const [showHint, setShowHint] = useState(false)
  const [pinned, setPinned] = useState(false)
  const quickInputRef = useRef<HTMLInputElement | null>(null)

  const { sendChatMessage, joinConversation, messages } = useWebSocket()
  const { triggerHaptic } = useHaptics()
  // Stable mini-chat conversation id
  const miniChatConversationId = useMemo(() => {
    if (conversationId) return conversationId
    if (typeof window === "undefined") return "mini-chat"
    const KEY = "miniChatConversationId"
    let cid = localStorage.getItem(KEY)
    if (!cid) {
      cid = `mini-${Date.now()}-${Math.floor(Math.random() * 1e6)}`
      try { localStorage.setItem(KEY, cid) } catch {}
    }
    return cid
  }, [conversationId])

  const dragging = useRef(false)
  const resizing = useRef(false)
  const dragStart = useRef<{ mx: number; my: number; x: number; y: number } | null>(null)
  const sizeStart = useRef<{ mx: number; my: number; w: number; h: number } | null>(null)

  // Load persisted state
  useEffect(() => {
    setMounted(true)
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw) as MiniChatWidgetState
        setState((s) => ({
          ...s,
          ...parsed,
          // allow explicit initial props to override persisted
          minimized: initialMinimized ?? parsed.minimized,
          x: initialX ?? parsed.x,
          y: initialY ?? parsed.y,
          w: initialW ?? parsed.w,
          h: initialH ?? parsed.h,
        }))
      }
      const pinnedRaw = localStorage.getItem("miniChatPinned")
      if (pinnedRaw) setPinned(pinnedRaw === "1")
    } catch {}
  }, [initialH, initialMinimized, initialW, initialX, initialY])

  // Persist state
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {}
  }, [state])

  // Persist pin
  useEffect(() => {
    try { localStorage.setItem("miniChatPinned", pinned ? "1" : "0") } catch {}
  }, [pinned])

  // Hotkey: ⌘L focuses the quick chat input (when minimized)
  useHotkeys([
    {
      combo: "meta+l",
      preventDefault: true,
      onTrigger: () => {
        if (state.minimized) {
          quickInputRef.current?.focus()
          triggerHaptic("selection")
        }
      },
    },
  ])

  // Expose imperative API for popout/minimize and listen to CustomEvents
  useEffect(() => {
    const popoutListener = () => expandToPopout()
    const minimizeListener = () => minimizeToBar()
    const togglePopoutListener = () => toggleMinimize()
    const focusInputListener = () => quickInputRef.current?.focus()

    window.addEventListener('quickchat:popout', popoutListener)
    window.addEventListener('quickchat:minimize', minimizeListener)
    window.addEventListener('quickchat:toggle-popout', togglePopoutListener)
    window.addEventListener('quickchat:focus-input', focusInputListener)

    // Merge into global API without clobbering
    const existing = (window as any).quickChat || {}
    const injected = {
      ...existing,
      popout: expandToPopout,
      minimize: minimizeToBar,
      togglePopout: toggleMinimize,
    }
    ;(window as any).quickChat = injected

    return () => {
      window.removeEventListener('quickchat:popout', popoutListener)
      window.removeEventListener('quickchat:minimize', minimizeListener)
      window.removeEventListener('quickchat:toggle-popout', togglePopoutListener)
      window.removeEventListener('quickchat:focus-input', focusInputListener)
      try {
        const qc = (window as any).quickChat || {}
        if (qc) {
          delete qc.popout
          delete qc.minimize
          delete qc.togglePopout
          if (Object.keys(qc).length === 0) {
            delete (window as any).quickChat
          } else {
            ;(window as any).quickChat = qc
          }
        }
      } catch {}
    }
  }, [])

  // One-time hint for discoverability (only when minimized and first visit)
  useEffect(() => {
    if (!mounted) return
    try {
      const seen = localStorage.getItem(HINT_KEY)
      if (!seen && state.minimized) {
        setShowHint(true)
        const id = setTimeout(() => {
          try { localStorage.setItem(HINT_KEY, "1") } catch {}
          setShowHint(false)
        }, 6000)
        return () => clearTimeout(id)
      }
    } catch {}
  }, [mounted, state.minimized])

  // Clamp to viewport on resize and keep popout aligned to bar width/offset
  useEffect(() => {
    const onResize = () => {
      setState((s) => {
        const isMin = s.minimized
        const w = isMin ? s.w : computeBarWidth()
        const x = isMin ? Math.min(Math.max(0, s.x), Math.max(0, window.innerWidth - w)) : Math.max(0, Math.floor((window.innerWidth - w) / 2))
        const h = s.h
        const y = isMin
          ? Math.min(Math.max(0, s.y), Math.max(0, window.innerHeight - 56))
          : Math.max(
              16,
              Math.floor(window.innerHeight - (BAR_BOTTOM_MARGIN + EST_BAR_HEIGHT + POPOUT_OFFSET_ABOVE_BAR) - h)
            )
        return { ...s, x, y, w, h }
      })
    }
    window.addEventListener("resize", onResize)
    return () => window.removeEventListener("resize", onResize)
  }, [])

  // Join a lightweight conversation when opened
  useEffect(() => {
    if (!state.minimized) {
      joinConversation(miniChatConversationId)
    }
  }, [state.minimized, joinConversation, miniChatConversationId])

  const onMouseMove = useCallback((e: MouseEvent) => {
    if (dragging.current && dragStart.current) {
      const dx = e.clientX - dragStart.current.mx
      const dy = e.clientY - dragStart.current.my
      setState((s) => {
        const nx = Math.min(Math.max(0, dragStart.current!.x + dx), window.innerWidth - s.w)
        const ny = Math.min(
          Math.max(0, dragStart.current!.y + dy),
          window.innerHeight - (s.minimized ? 56 : s.h)
        )
        return { ...s, x: nx, y: ny }
      })
    }
    if (resizing.current && sizeStart.current) {
      const dx = e.clientX - sizeStart.current.mx
      const dy = e.clientY - sizeStart.current.my
      setState((s) => {
        const minW = 280
        const minH = 260
        const nw = Math.min(Math.max(minW, sizeStart.current!.w + dx), window.innerWidth - s.x)
        const nh = Math.min(Math.max(minH, sizeStart.current!.h + dy), window.innerHeight - s.y)
        return { ...s, w: nw, h: nh }
      })
    }
  }, [])

  const onMouseUp = useCallback(() => {
    dragging.current = false
    resizing.current = false
    dragStart.current = null
    sizeStart.current = null
  }, [])

  useEffect(() => {
    window.addEventListener("mousemove", onMouseMove)
    window.addEventListener("mouseup", onMouseUp)
    return () => {
      window.removeEventListener("mousemove", onMouseMove)
      window.removeEventListener("mouseup", onMouseUp)
    }
  }, [onMouseMove, onMouseUp])

  const startDrag = (e: React.MouseEvent) => {
    dragging.current = true
    dragStart.current = { mx: e.clientX, my: e.clientY, x: state.x, y: state.y }
  }

  const startResize = (e: React.MouseEvent) => {
    e.stopPropagation()
    resizing.current = true
    sizeStart.current = { mx: e.clientX, my: e.clientY, w: state.w, h: state.h }
  }

  const dismissHint = () => {
    setShowHint(false)
    try { localStorage.setItem(HINT_KEY, "1") } catch {}
  }

  // Layout constants for the bottom bar and popout relationship
  const BAR_SIDE_MARGIN = 16 // tailwind bottom-4/left-right margins in px
  const BAR_BOTTOM_MARGIN = 16
  const BAR_MAX_WIDTH = 720
  const EST_BAR_HEIGHT = 48 // approximate height of the compact bar
  const POPOUT_OFFSET_ABOVE_BAR = 15

  const computeBarWidth = () => {
    if (typeof window === "undefined") return Math.min(BAR_MAX_WIDTH, 360)
    return Math.min(BAR_MAX_WIDTH, window.innerWidth - BAR_SIDE_MARGIN * 2)
  }

  const expandToPopout = () => {
    setState((s) => {
      const w = computeBarWidth()
      const x = Math.max(0, Math.floor((window.innerWidth - w) / 2))
      const h = s.h
      const y = Math.max(
        16,
        Math.floor(window.innerHeight - (BAR_BOTTOM_MARGIN + EST_BAR_HEIGHT + POPOUT_OFFSET_ABOVE_BAR) - h)
      )
      return { ...s, minimized: false, w, x, y, h }
    })
  }

  const minimizeToBar = () => {
    setState((s) => ({ ...s, minimized: true }))
  }

  const toggleMinimize = () => {
    dismissHint()
    setState((s) => {
      if (pinned) {
        // If pinned, ensure popout stays open
        return { ...s, minimized: false }
      }
      return { ...s, minimized: !s.minimized }
    })
  }

  // Note: Widget-level Ctrl/Cmd+Q handled by QuickChatMount to toggle visibility.

  // Resize helpers for header controls
  const setCompactSize = () => {
    setState((s) => ({ ...s, w: COMPACT_W, h: COMPACT_H }))
  }

  const setDefaultSize = () => {
    setState((s) => ({ ...s, w: DEFAULT_W, h: DEFAULT_H }))
  }

  const onSend = () => {
    const text = message.trim()
    if (!text) return
    try {
      sendChatMessage(text, miniChatConversationId)
    } catch {}
    setMessage("")
  }

  // Minimized compact bar (Apple‑style)
  if (state.minimized) {
    if (!mounted) return null

    const onQuickKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      const isComposing = (e.nativeEvent as any)?.isComposing
      if (isComposing) return
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault()
        if (message.trim()) {
          try { sendChatMessage(message.trim(), miniChatConversationId) } catch {}
          setMessage("")
          triggerHaptic("light")
          // After sending from the bar, open the popout to show the AI chat
          expandToPopout()
        }
      } else if (e.key === "Escape") {
        (e.currentTarget as HTMLInputElement).blur()
      }
    }

    const bar = (
      <div className="fixed z-[9999] bottom-4 left-1/2 -translate-x-1/2 w-[min(720px,calc(100%-2rem))]">
        <div
          className="group flex items-center gap-2 rounded-2xl border border-gray-200/60 dark:border-gray-700/70 bg-white/80 dark:bg-gray-900/80 backdrop-blur supports-[backdrop-filter]:bg-white/70 supports-[backdrop-filter]:dark:bg-gray-900/70 shadow-lg hover:shadow-xl transition-shadow duration-200 motion-reduce:transition-none px-3 py-2"
          role="search"
          aria-label="Quick chat"
        >
          <button
            className="inline-flex items-center justify-center h-8 w-8 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            aria-label="New quick chat"
            onClick={() => { expandToPopout(); triggerHaptic("selection") }}
            type="button"
          >
            <Plus className="h-4 w-4" />
          </button>

          <input
            ref={quickInputRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={onQuickKeyDown}
            placeholder={"Ask anything (⌘L)"}
            className="flex-1 bg-transparent text-sm md:text-base placeholder:text-gray-500 dark:placeholder:text-gray-400 text-gray-900 dark:text-gray-100 outline-none"
            aria-label="Ask anything"
          />

          {/* Subtle chips (non-interactive for now) */}
          <div className="hidden sm:flex items-center gap-1 mr-1">
            <div className="hidden md:inline-flex items-center gap-1 text-xs text-gray-600 dark:text-gray-300 border border-gray-300/70 dark:border-gray-700 rounded-full px-2 py-1">
              <Code2 className="h-3.5 w-3.5" />
              <span>Code</span>
            </div>
            <div className="hidden lg:inline-flex items-center gap-1 text-[11px] text-gray-600 dark:text-gray-300 border border-gray-300/70 dark:border-gray-700 rounded-full px-2 py-1">
              <span>GPT-5 (high reasoning)</span>
            </div>
          </div>

          <button
            className="inline-flex items-center justify-center h-8 w-8 rounded-full text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            aria-label="Voice input"
            type="button"
            onClick={() => triggerHaptic("selection")}
          >
            <Mic className="h-4 w-4" />
          </button>

          <button
            className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-white text-gray-900 dark:bg-white dark:text-gray-900 shadow-sm hover:shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            aria-label="Record"
            type="button"
            onClick={() => triggerHaptic("light")}
          >
            <Circle className="h-4 w-4" />
          </button>
        </div>
      </div>
    )

    return createPortal(bar, document.body)
  }

  const content = (
    <div
      className="fixed z-[9999] rounded-2xl border border-gray-200/60 dark:border-gray-700/70 bg-white/80 dark:bg-gray-900/80 backdrop-blur supports-[backdrop-filter]:bg-white/70 supports-[backdrop-filter]:dark:bg-gray-900/70 shadow-2xl overflow-hidden"
      style={{ left: state.x, top: state.y, width: state.w, height: state.h }}
    >
      {/* Header (drag handle) */}
      <div
        className="cursor-move select-none flex items-center justify-between px-3 py-2 bg-white/60 dark:bg-gray-900/60 border-b border-gray-200/60 dark:border-gray-700/60 backdrop-blur"
        onMouseDown={startDrag}
      >
        <div className="flex items-center gap-2 text-gray-700 dark:text-gray-200">
          <Bot className="h-4 w-4" />
          <span className="text-sm font-medium">{title}</span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onMouseDown={(e) => e.stopPropagation()}
            onClick={() => setPinned((p) => !p)}
            title={pinned ? "Unpin" : "Pin"}
          >
            {pinned ? <Pin className="h-4 w-4" /> : <PinOff className="h-4 w-4" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onMouseDown={(e) => e.stopPropagation()}
            onClick={setCompactSize}
            title="Minimize"
          >
            <Minimize2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onMouseDown={(e) => e.stopPropagation()}
            onClick={setDefaultSize}
            title="Reset size"
          >
            <Maximize2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onMouseDown={(e) => e.stopPropagation()}
            onClick={() => setState((s) => ({ ...s, minimized: true }))}
            title="Close"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Feed-only content */}
      <div className="flex-1 h-[calc(100%-42px)] overflow-y-auto p-3 text-sm text-gray-700 dark:text-gray-200 space-y-2">
        {messages.filter(m => m.conversationId === miniChatConversationId).length === 0 ? (
          <p className="opacity-80">Your quick chat feed will appear here.</p>
        ) : (
          messages
            .filter(m => m.conversationId === miniChatConversationId)
            .map(m => (
              <div key={m.id} className="rounded-lg border border-gray-200/60 dark:border-gray-700/60 bg-white/60 dark:bg-gray-900/60 backdrop-blur px-3 py-2">
                <div className="text-[11px] text-gray-500 dark:text-gray-400 mb-1">
                  {m.senderName || (m.sender === 'user' ? 'You' : m.sender === 'ai' ? 'AI Assistant' : 'Contact')} · {new Date(m.timestamp).toLocaleTimeString()}
                </div>
                <div className="whitespace-pre-wrap text-gray-900 dark:text-gray-100">{m.text}</div>
              </div>
            ))
        )}
      </div>

      {/* Resize handle */}
      <div
        className="absolute right-0 bottom-0 w-4 h-4 cursor-se-resize"
        onMouseDown={startResize}
      />
    </div>
  )

  if (!mounted) return null
  return createPortal(content, document.body)
}
