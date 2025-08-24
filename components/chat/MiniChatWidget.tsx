"use client"

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { Bot, Minimize2, Maximize2, X } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { useWebSocket } from "@/hooks/use-websocket"

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

const defaultX = () => (typeof window !== "undefined" ? Math.max(16, window.innerWidth - 360 - 16) : 16)
const defaultY = () => (typeof window !== "undefined" ? Math.max(16, window.innerHeight - 420 - 16) : 16)

const DEFAULT_STATE: MiniChatWidgetState = {
  minimized: true,
  x: defaultX(),
  y: defaultY(),
  w: 360,
  h: 420,
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

  const { sendChatMessage, joinConversation } = useWebSocket()
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
    } catch {}
  }, [initialH, initialMinimized, initialW, initialX, initialY])

  // Persist state
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {}
  }, [state])

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

  // Clamp to viewport on resize
  useEffect(() => {
    const onResize = () => {
      setState((s) => {
        const maxX = Math.max(0, window.innerWidth - s.w)
        const maxY = Math.max(0, window.innerHeight - (s.minimized ? 56 : s.h))
        return {
          ...s,
          x: Math.min(Math.max(0, s.x), maxX),
          y: Math.min(Math.max(0, s.y), maxY),
        }
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

  const toggleMinimize = () => {
    dismissHint()
    setState((s) => ({ ...s, minimized: !s.minimized }))
  }

  const onSend = () => {
    const text = message.trim()
    if (!text) return
    try {
      sendChatMessage(text, miniChatConversationId)
    } catch {}
    setMessage("")
  }

  // Minimized pill
  if (state.minimized) {
    if (!mounted) return null

    const pill = (
      <button
        onClick={toggleMinimize}
        className="fixed z-[9999] bottom-5 right-5 flex items-center gap-2 rounded-full bg-indigo-600 text-white px-4 py-2 shadow-lg hover:bg-indigo-700 focus:outline-none"
        title="Open quick chat"
      >
        <Bot className="h-5 w-5" />
        <span className="text-sm font-medium">{title}</span>
      </button>
    )

    const tooltip = (
      <div className="fixed z-[10000] bottom-16 right-5">
        <div className="relative max-w-xs bg-gray-900 text-white text-xs rounded-lg shadow-lg px-3 py-2 flex items-start gap-2">
          <span>Click Quick Chat to draft a prompt. Drag to move.</span>
          <button
            onClick={dismissHint}
            className="ml-1 text-gray-300 hover:text-white"
            aria-label="Close hint"
          >
            <X className="h-3 w-3" />
          </button>
          <div className="absolute -bottom-1 right-6 w-2 h-2 bg-gray-900 rotate-45" />
        </div>
      </div>
    )

    return (
      <>
        {createPortal(pill, document.body)}
        {showHint ? createPortal(tooltip, document.body) : null}
      </>
    )
  }

  const content = (
    <div
      className="fixed z-[9999] bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden"
      style={{ left: state.x, top: state.y, width: state.w, height: state.h }}
    >
      {/* Header (drag handle) */}
      <div
        className="cursor-move select-none flex items-center justify-between px-3 py-2 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700"
        onMouseDown={startDrag}
      >
        <div className="flex items-center gap-2 text-gray-700 dark:text-gray-200">
          <Bot className="h-4 w-4" />
          <span className="text-sm font-medium">{title}</span>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={toggleMinimize} title="Minimize">
            <Minimize2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setState(DEFAULT_STATE)}
            title="Reset size"
          >
            <Maximize2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setState((s) => ({ ...s, minimized: true }))}
            title="Close"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Messages placeholder (simple for now) */}
      <div className="flex-1 h-[calc(100%-110px)] overflow-y-auto p-3 text-sm text-gray-600 dark:text-gray-300">
        <p className="opacity-80">Start a quick note to yourself or draft a prompt for an agent.</p>
      </div>

      {/* Composer */}
      <div className="border-t border-gray-200 dark:border-gray-700 p-3">
        <div className="flex items-end gap-2">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={1}
            placeholder="Type a quick message..."
            className="resize-none border-0 bg-gray-50 dark:bg-gray-800 rounded-lg px-3 py-2 min-h-[40px] focus:ring-2 focus:ring-indigo-500"
          />
          <Button
            disabled={!message.trim()}
            onClick={onSend}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            Send
          </Button>
        </div>
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
