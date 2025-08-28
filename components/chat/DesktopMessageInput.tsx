"use client"

import type React from "react"
import { useEffect, useRef, useState } from "react"
import { Bot, Plus, Send, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { CreditBadge } from "@/components/credits/CreditBadge"
import { BuyCreditsButton } from "@/components/credits/BuyCreditsButton"
import { CREDITS_ENABLED, CREDITS_PER_AI_REQUEST } from "@/lib/pricing"

export interface DesktopMessageInputProps {
  value: string
  onChange: (value: string) => void
  onSend: () => void
  onEmojiSelect?: (emoji: string) => void
  onFileSelect?: (file: File, type: string) => void
  onGifSelect?: (gif: {
    id: string
    title: string
    url: string
    preview_url: string
    width: number
    height: number
  }) => void
  onLaunchApp?: (appId: string, appName: string) => void
  onAgentToggle?: (enabled: boolean) => void
  placeholder?: string
}

export function DesktopMessageInput({
  value,
  onChange,
  onSend,
  onEmojiSelect, // reserved for parity with mobile
  onFileSelect, // reserved for parity with mobile
  onGifSelect, // reserved for parity with mobile
  onLaunchApp, // reserved for parity with mobile
  onAgentToggle,
  placeholder = "Type a message...",
}: DesktopMessageInputProps) {
  const [agentMode, setAgentMode] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [showActions, setShowActions] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-resize textarea for desktop too
  useEffect(() => {
    const el = textareaRef.current
    if (el) {
      el.style.height = "auto"
      const h = el.scrollHeight
      el.style.height = `${Math.min(h, 160)}px`
      setIsExpanded(h > 48)
    }
  }, [value])

  const handleSend = () => {
    if (!value.trim()) return
    onSend()
    setIsExpanded(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      // Cmd/Ctrl+Enter sends
      if (e.metaKey || e.ctrlKey) {
        e.preventDefault()
        handleSend()
        return
      }
      // Enter sends; Shift+Enter for newline
      if (!e.shiftKey) {
        e.preventDefault()
        handleSend()
      }
    }
  }

  const handleAgentToggle = () => {
    const next = !agentMode
    setAgentMode(next)
    onAgentToggle?.(next)
  }

  const toggleActions = () => setShowActions(v => !v)

  return (
    <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
      {/* Credits UI aligned to the top-right for desktop */}
      {CREDITS_ENABLED && (
        <div className="px-4 pt-3 pb-0 flex items-center gap-2 justify-end">
          <CreditBadge />
          <BuyCreditsButton size="sm" />
        </div>
      )}

      {/* Optional quick actions header (collapsed by default) */}
      {showActions && (
        <div className="border-b border-gray-200 dark:border-gray-700 px-3 py-2 flex items-center justify-between">
          <div className="text-xs text-gray-500">Quick actions</div>
          <Button variant="ghost" size="sm" onClick={toggleActions}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      <div className="px-4 py-3 flex items-end gap-3">
        {!showActions && (
          <Button variant="ghost" size="sm" onClick={toggleActions} aria-label="Open actions">
            <Plus className="h-4 w-4" />
          </Button>
        )}

        <Button
          variant={agentMode ? "default" : "ghost"}
          size="sm"
          onClick={handleAgentToggle}
          className={agentMode ? "bg-indigo-500 hover:bg-indigo-600 text-white" : ""}
          aria-label={agentMode ? "Disable AI mode" : "Enable AI mode"}
        >
          <Bot className="h-4 w-4" />
        </Button>

        <div className="flex-1 relative">
          <Textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={agentMode ? "Ask AI or type a message..." : placeholder}
            className={`
              resize-none border-0 bg-gray-50 dark:bg-gray-700 rounded-2xl px-4 py-3
              min-h-[48px] max-h-[160px] text-sm leading-5
              focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-gray-600
              ${agentMode ? "ring-2 ring-indigo-200 dark:ring-indigo-800" : ""}
            `}
            rows={1}
            aria-label="Message input"
          />

          {agentMode && (
            <div className="absolute -top-6 left-2 flex items-center gap-1">
              <Bot className="h-3 w-3 text-indigo-500" />
              <span className="text-xs text-indigo-600 dark:text-indigo-400">AI Mode</span>
            </div>
          )}

          {/* Character count and credit estimate with anti-overlap logic */}
          {value.length > 100 && (
            <div className="absolute -top-6 right-2 text-xs text-gray-500 dark:text-gray-400">{value.length}/1000</div>
          )}
          {CREDITS_ENABLED && (
            <div
              className={
                agentMode
                  ? value.length > 100
                    ? "absolute -top-10 right-2 text-xs text-gray-500 dark:text-gray-400"
                    : "absolute -top-6 right-2 text-xs text-gray-500 dark:text-gray-400"
                  : "absolute -top-6 left-2 text-xs text-gray-500 dark:text-gray-400"
              }
            >
              Est. credits: {CREDITS_PER_AI_REQUEST}
            </div>
          )}
        </div>

        <Button
          onClick={handleSend}
          disabled={!value.trim()}
          aria-label="Send message"
          className={`
            rounded-full h-8 w-8 p-0
            ${agentMode ? "bg-indigo-500 hover:bg-indigo-600" : "bg-blue-500 hover:bg-blue-600"} text-white
            disabled:bg-gray-300 dark:disabled:bg-gray-600
            transition-all duration-200
            ${value.trim() ? "scale-100" : "scale-95 opacity-50"}
          `}
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
