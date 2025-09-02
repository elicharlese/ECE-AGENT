"use client"

import React, { useEffect, useMemo, useRef, useState, useCallback } from "react"
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger, DrawerClose } from "@/components/ui/drawer"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Bot, X } from "lucide-react"
import { useWebSocket } from "@/hooks/use-websocket"
import { VerticalDraggableTab } from "@/components/ui/VerticalDraggableTab"

// A lightweight Quick Chat drawer, pinned on the right side of the screen.
// Provides a simple composer and sends messages over the shared WebSocket.
export type QuickChatDrawerProps = {
  title?: string
}

const STORAGE_KEY_MINI_CHAT_ID = "miniChatConversationId"

export function QuickChatDrawer({ title = "Quick Chat" }: QuickChatDrawerProps) {
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState("")
  const { sendChatMessage, joinConversation } = useWebSocket()
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)

  // Stable mini-chat conversation id shared with MiniChatWidget for continuity
  const miniChatConversationId = useMemo(() => {
    if (typeof window === "undefined") return "mini-chat"
    let cid = localStorage.getItem(STORAGE_KEY_MINI_CHAT_ID)
    if (!cid) {
      cid = `mini-${Date.now()}-${Math.floor(Math.random() * 1e6)}`
      try { localStorage.setItem(STORAGE_KEY_MINI_CHAT_ID, cid) } catch {}
    }
    return cid
  }, [])

  // Join the conversation when drawer opens
  useEffect(() => {
    if (open) {
      try { joinConversation(miniChatConversationId) } catch {}
      // Focus textarea after drawer opens and layout stabilizes
      const id = requestAnimationFrame(() => textareaRef.current?.focus())
      return () => cancelAnimationFrame(id)
    }
  }, [open, joinConversation, miniChatConversationId])

  const onSend = useCallback(() => {
    const text = message.trim()
    if (!text) return
    try { sendChatMessage(text, miniChatConversationId) } catch {}
    setMessage("")
  }, [message, miniChatConversationId, sendChatMessage])

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const isComposing = (e.nativeEvent as any)?.isComposing
    if (isComposing) return
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      onSend()
    }
  }

  return (
    <Drawer direction="right" open={open} onOpenChange={setOpen}>
      {/* Pinned icon-only draggable tab on the right edge */}
      <DrawerTrigger asChild>
        <VerticalDraggableTab
          ariaLabel="Open quick chat"
          icon={<Bot className="h-5 w-5" />}
          storageKey="quickchat_tab_top_pct"
          side="right"
        />
      </DrawerTrigger>

      <DrawerContent className="sm:max-w-md">
        <DrawerHeader className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="h-4 w-4" />
            <DrawerTitle>{title}</DrawerTitle>
          </div>
          <DrawerClose asChild>
            <Button variant="ghost" size="icon" aria-label="Close quick chat">
              <X className="h-4 w-4" />
            </Button>
          </DrawerClose>
        </DrawerHeader>

        <div className="px-4 pb-4">
          <div className="text-xs text-muted-foreground mb-3">
            Draft a quick note or a prompt. Messages are sent to your quick conversation.
          </div>
          <div className="flex items-end gap-2">
            <Textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={onKeyDown}
              rows={3}
              placeholder="Type a quick message..."
              className="resize-none bg-gray-50 dark:bg-gray-800 rounded-lg px-3 py-2 min-h-[60px] focus:ring-2 focus:ring-indigo-500"
              />
            <Button disabled={!message.trim()} onClick={onSend} className="bg-indigo-600 hover:bg-indigo-700 text-white">
              Send
            </Button>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
