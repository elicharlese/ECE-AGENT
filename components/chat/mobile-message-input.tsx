"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Send, Plus, X, Bot, Calculator, Calendar, GamepadIcon, Sparkles, Zap, Brain } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { EmojiPicker } from "./emoji-picker"
import { FileUpload } from "./file-upload"
import { GifPicker } from "./gif-picker"
import { useHaptics } from "@/hooks/use-haptics"
import { useMobileKeyboard } from "@/hooks/use-mobile-keyboard"
import { CreditBadge } from "@/components/credits/CreditBadge"
import { BuyCreditsButton } from "@/components/credits/BuyCreditsButton"
import { CREDITS_ENABLED, CREDITS_PER_AI_REQUEST } from "@/lib/pricing"

interface MobileMessageInputProps {
  value: string
  onChange: (value: string) => void
  onSend: () => void
  onEmojiSelect: (emoji: string) => void
  onFileSelect: (file: File, type: string) => void
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

export function MobileMessageInput({
  value,
  onChange,
  onSend,
  onEmojiSelect,
  onFileSelect,
  onGifSelect,
  onLaunchApp,
  onAgentToggle,
  placeholder = "Type a message...",
}: MobileMessageInputProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [showActions, setShowActions] = useState(false)
  const [agentMode, setAgentMode] = useState(false)
  const [activeTab, setActiveTab] = useState<"media" | "apps" | "agents">("media")
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const { triggerHaptic } = useHaptics()
  const { isKeyboardOpen } = useMobileKeyboard()

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = "auto"
      const scrollHeight = textarea.scrollHeight
      textarea.style.height = `${Math.min(scrollHeight, 120)}px`
      setIsExpanded(scrollHeight > 44)
    }
  }, [value])

  const handleSend = () => {
    if (!value.trim()) return
    onSend()
    triggerHaptic("light")
    setIsExpanded(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      // Cmd/Ctrl+Enter always sends
      if (e.metaKey || e.ctrlKey) {
        e.preventDefault()
        handleSend()
        return
      }
      // Enter (no Shift) sends; Shift+Enter inserts newline
      if (!e.shiftKey) {
        e.preventDefault()
        handleSend()
      }
    }
  }

  const toggleActions = () => {
    setShowActions(!showActions)
    triggerHaptic("selection")
  }

  const handleAgentToggle = () => {
    const newAgentMode = !agentMode
    setAgentMode(newAgentMode)
    onAgentToggle?.(newAgentMode)
    triggerHaptic("success")
  }

  const handleAppLaunch = (appId: string, appName: string) => {
    onLaunchApp?.(appId, appName)
    setShowActions(false)
    triggerHaptic("medium")
  }

  const quickApps = [
    { id: "calculator", name: "Calculator", icon: Calculator, color: "bg-blue-500" },
    { id: "tic-tac-toe", name: "Tic Tac Toe", icon: GamepadIcon, color: "bg-green-500" },
    { id: "event-planner", name: "Event Planner", icon: Calendar, color: "bg-purple-500" },
  ]

  const aiAgents = [
    {
      id: "smart-assistant",
      name: "Smart Assistant",
      icon: Brain,
      color: "bg-indigo-500",
      description: "General AI helper",
    },
    {
      id: "code-companion",
      name: "Code Companion",
      icon: Zap,
      color: "bg-orange-500",
      description: "Programming assistant",
    },
    {
      id: "creative-writer",
      name: "Creative Writer",
      icon: Sparkles,
      color: "bg-pink-500",
      description: "Writing & content",
    },
  ]

  return (
    <div
      className={`
      border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 
      transition-all duration-200 ease-in-out
      ${isKeyboardOpen ? "pb-safe" : "pb-4"}
    `}
    >
      {/* Credits UI moved from header into input area */}
      {CREDITS_ENABLED && (
        <div className="px-4 pt-2 pb-0 flex items-center gap-2 justify-end">
          <CreditBadge />
          <BuyCreditsButton size="sm" />
        </div>
      )}
      {/* Enhanced Action Panel */}
      {showActions && (
        <div className="border-b border-gray-200 dark:border-gray-700">
          {/* Tab Navigation */}
          <div className="flex items-center justify-between px-3 py-2 bg-gray-50 dark:bg-gray-700">
            <div className="flex items-center gap-1">
              <Button
                variant={activeTab === "media" ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveTab("media")}
                className="text-xs"
              >
                Media
              </Button>
              <Button
                variant={activeTab === "apps" ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveTab("apps")}
                className="text-xs"
              >
                Apps
              </Button>
              <Button
                variant={activeTab === "agents" ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveTab("agents")}
                className="text-xs"
              >
                Agents
              </Button>
            </div>
            <Button variant="ghost" size="sm" onClick={toggleActions}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Tab Content */}
          <div className="p-3">
            {activeTab === "media" && (
              <div className="space-y-3">
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Media & Content</div>
                <div className="flex items-center gap-2">
                  <FileUpload onFileSelect={onFileSelect} />
                  <EmojiPicker onEmojiSelect={onEmojiSelect} />
                  {onGifSelect && <GifPicker onGifSelect={onGifSelect} />}
                </div>
              </div>
            )}

            {activeTab === "apps" && (
              <div className="space-y-3">
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Quick Apps</div>
                <div className="grid grid-cols-3 gap-2">
                  {quickApps.map((app) => (
                    <Button
                      key={app.id}
                      variant="outline"
                      className="flex flex-col items-center gap-2 h-auto py-3 bg-transparent"
                      onClick={() => handleAppLaunch(app.id, app.name)}
                    >
                      <div className={`p-2 rounded-full ${app.color} text-white`}>
                        <app.icon className="h-4 w-4" />
                      </div>
                      <span className="text-xs">{app.name}</span>
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "agents" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300">AI Agents</div>
                  <Badge variant={agentMode ? "default" : "secondary"} className="text-xs">
                    {agentMode ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <div className="space-y-2">
                  {aiAgents.map((agent) => (
                    <Button
                      key={agent.id}
                      variant="outline"
                      className="flex items-center gap-3 w-full justify-start h-auto py-3 bg-transparent"
                      onClick={() => handleAppLaunch(agent.id, agent.name)}
                    >
                      <div className={`p-2 rounded-full ${agent.color} text-white`}>
                        <agent.icon className="h-4 w-4" />
                      </div>
                      <div className="flex flex-col items-start">
                        <span className="text-sm font-medium">{agent.name}</span>
                        <span className="text-xs text-gray-500">{agent.description}</span>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Input row with enhanced controls */}
      <div className="flex items-end gap-3 px-4 py-3">
        {!showActions && (
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleActions}
            className="mb-1"
            aria-label="Open actions"
          >
            <Plus className="h-4 w-4" />
          </Button>
        )}

        <Button
          variant={agentMode ? "default" : "ghost"}
          size="sm"
          onClick={handleAgentToggle}
          className={`mb-1 ${agentMode ? "bg-indigo-500 hover:bg-indigo-600 text-white" : ""}`}
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
              resize-none border-0 bg-gray-50 dark:bg-gray-700 rounded-full px-4 py-3
              min-h-[44px] max-h-[120px] text-base leading-5
              focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-gray-600
              flex items-center
              ${isExpanded ? "rounded-2xl py-3" : "py-3"}
              ${agentMode ? "ring-2 ring-indigo-200 dark:ring-indigo-800" : ""}
            `}
            style={{
              lineHeight: "1.25",
              paddingTop: isExpanded ? "12px" : "11px",
              paddingBottom: isExpanded ? "12px" : "11px",
            }}
            rows={1}
          />

          {agentMode && (
            <div className="absolute -top-6 left-2 flex items-center gap-1">
              <Bot className="h-3 w-3 text-indigo-500" />
              <span className="text-xs text-indigo-600 dark:text-indigo-400">AI Mode</span>
            </div>
          )}

          {/* Character count and credit estimate */}
          {value.length > 100 && (
            <div className="absolute -top-6 right-2 text-xs text-gray-500 dark:text-gray-400">{value.length}/1000</div>
          )}
          {CREDITS_ENABLED && (
            <div
              className={
                // Avoid overlap with AI badge and/or char counter
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
          className={`
            rounded-full h-8 w-8 p-0 mb-1
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
