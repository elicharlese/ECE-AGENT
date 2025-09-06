"use client"

import type React from "react"
import { useEffect, useRef, useState } from "react"
import { Bot, Plus, Send, X, Calculator, Calendar, GamepadIcon, Sparkles, Zap, Brain } from "lucide-react"
import {
  Button,
  Select,
  Textarea
} from '@/libs/design-system';

// TODO: Replace deprecated components: Textarea
// 
// TODO: Replace deprecated components: Textarea
// import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/libs/design-system'
import { CreditBadge } from "@/components/credits/CreditBadge"
import { BuyCreditsButton } from "@/components/credits/BuyCreditsButton"
import { CREDITS_ENABLED, CREDITS_PER_AI_REQUEST } from "@/lib/pricing"
import { EmojiPicker } from "./emoji-picker"
import { FileUpload } from "./file-upload"
import { GifPicker } from "./gif-picker"

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
  const [selectedAgentMode, setSelectedAgentMode] = useState('smart_assistant')
  const [isExpanded, setIsExpanded] = useState(false)
  const [showActions, setShowActions] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [activeTab, setActiveTab] = useState<"media" | "apps" | "agents">("media")

  const quickApps = [
    { id: "calculator", name: "Calculator", icon: Calculator, color: "bg-blue-500" },
    { id: "tic-tac-toe", name: "Tic Tac Toe", icon: GamepadIcon, color: "bg-green-500" },
    { id: "event-planner", name: "Event Planner", icon: Calendar, color: "bg-purple-500" },
  ]

  const aiAgents = [
    {
      id: "smart_assistant",
      name: "Smart Assistant",
      icon: Brain,
      color: "bg-indigo-500",
      description: "General AI helper",
    },
    {
      id: "code_companion",
      name: "Code Companion",
      icon: Zap,
      color: "bg-orange-500",
      description: "Programming assistant",
    },
    {
      id: "creative_writer",
      name: "Creative Writer",
      icon: Sparkles,
      color: "bg-pink-500",
      description: "Writing & content",
    },
    {
      id: "legal_assistant",
      name: "Legal Assistant",
      icon: Bot,
      color: "bg-blue-600",
      description: "Legal analysis",
    },
    {
      id: "designer_agent",
      name: "Designer Agent",
      icon: Bot,
      color: "bg-purple-500",
      description: "UI/UX design",
    },
  ]

  const handleAppLaunch = (appId: string, appName: string) => {
    onLaunchApp?.(appId, appName)
    setShowActions(false)
  }

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

  const handleAgentModeSelect = (agentId: string) => {
    setSelectedAgentMode(agentId)
    setAgentMode(true)
    onAgentToggle?.(true)
    setShowActions(false)
  }

  const toggleActions = () => setShowActions(v => !v)

  return (
    <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
      {/* Action panel (collapsed by default) */}
      {showActions && (
        <div className="border-b border-gray-200 dark:border-gray-700">
          {/* Tabs header */}
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

          {/* Tab content */}
          <div className="p-3">
            {activeTab === "media" && (
              <div className="space-y-3">
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Media & Content</div>
                <div className="flex items-center gap-2">
                  {onFileSelect && <FileUpload onFileSelect={onFileSelect} />}
                  {onEmojiSelect && <EmojiPicker onEmojiSelect={onEmojiSelect} />}
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
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300">AGENT LLM Modes</div>
                  <Badge variant={agentMode ? "default" : "secondary"} className="text-xs">
                    {agentMode ? `${aiAgents.find(a => a.id === selectedAgentMode)?.name || 'Active'}` : "Inactive"}
                  </Badge>
                </div>
                <div className="space-y-2">
                  {aiAgents.map((agent) => (
                    <Button
                      key={agent.id}
                      variant={selectedAgentMode === agent.id ? "default" : "outline"}
                      className={`flex items-center gap-3 w-full justify-start h-auto py-3 ${
                        selectedAgentMode === agent.id ? "bg-indigo-500 text-white" : "bg-transparent"
                      }`}
                      onClick={() => handleAgentModeSelect(agent.id)}
                    >
                      <div className={`p-2 rounded-full ${agent.color} text-white`}>
                        <agent.icon className="h-4 w-4" />
                      </div>
                      <div className="flex flex-col items-start">
                        <span className="text-sm font-medium">{agent.name}</span>
                        <span className="text-xs opacity-75">{agent.description}</span>
                      </div>
                      {selectedAgentMode === agent.id && (
                        <div className="ml-auto">
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        </div>
                      )}
                    </Button>
                  ))}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 pt-2 border-t">
                  💡 Type @ai to use AGENT LLM or select a mode above
                </div>
              </div>
            )}
          </div>
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
