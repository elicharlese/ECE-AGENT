"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Bot, Settings, Zap, Brain, Sparkles, Scale, Palette, Send, Loader2, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MessageBubble } from "./message-bubble"
import { useHaptics } from "@/hooks/use-haptics"
import { useIsMobile } from "@/hooks/use-mobile"
import { useResponsiveLayout } from "@/hooks/use-responsive-layout"

interface AgentMessage {
  id: string
  content: string
  timestamp: Date
  senderId: string
  senderName: string
  type: "text" | "system" | "thinking" | "action"
  isOwn: boolean
  agentCapability?: string
  isTyping?: boolean
}

interface AgentChatWindowProps {
  agentId?: string
  onToggleAgentSidebar?: () => void
  agentSidebarCollapsed?: boolean
}

export function AgentChatWindow({ agentId, onToggleAgentSidebar, agentSidebarCollapsed }: AgentChatWindowProps) {
  const [messages, setMessages] = useState<AgentMessage[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [isAgentTyping, setIsAgentTyping] = useState(false)
  const [agentCapabilities, setAgentCapabilities] = useState<string[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const isMobile = useIsMobile()
  const { triggerHaptic } = useHaptics()
  const { screenSize, orientation } = useResponsiveLayout()

  // Agent data
  const agents = {
    "smart-assistant": {
      name: "Smart Assistant",
      icon: Brain,
      color: "bg-indigo-500",
      capabilities: ["General Help", "Research", "Analysis", "Planning"],
      description: "Your intelligent assistant for any task",
    },
    "code-companion": {
      name: "Code Companion",
      icon: Zap,
      color: "bg-orange-500",
      capabilities: ["Code Review", "Debugging", "Architecture", "Best Practices"],
      description: "Expert programming and development assistant",
    },
    "creative-writer": {
      name: "Creative Writer",
      icon: Sparkles,
      color: "bg-pink-500",
      capabilities: ["Writing", "Editing", "Brainstorming", "Content Strategy"],
      description: "Creative writing and content creation specialist",
    },
    "legal-assistant": {
      name: "Legal Assistant",
      icon: Scale,
      color: "bg-blue-600",
      capabilities: ["Legal Research", "Document Analysis", "Compliance", "Contract Review"],
      description: "Professional legal research and analysis",
    },
    "designer-agent": {
      name: "Designer Agent",
      icon: Palette,
      color: "bg-purple-500",
      capabilities: ["UI Design", "Brand Identity", "Visual Content", "Design Systems"],
      description: "Creative design and visual content specialist",
    },
  }

  const currentAgent = agentId ? agents[agentId as keyof typeof agents] : null

  // Initialize conversation when agent changes
  useEffect(() => {
    if (agentId && currentAgent) {
      setMessages([
        {
          id: "welcome",
          content: `Hello! I'm ${currentAgent.name}. ${currentAgent.description}. How can I help you today?`,
          timestamp: new Date(),
          senderId: agentId,
          senderName: currentAgent.name,
          type: "text",
          isOwn: false,
        },
      ])
      setAgentCapabilities(currentAgent.capabilities)
    } else {
      setMessages([])
      setAgentCapabilities([])
    }
  }, [agentId, currentAgent])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = "auto"
      const scrollHeight = textarea.scrollHeight
      textarea.style.height = `${Math.min(scrollHeight, 120)}px`
    }
  }, [newMessage])

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !agentId || !currentAgent) return

    // Add user message
    const userMessage: AgentMessage = {
      id: Date.now().toString(),
      content: newMessage,
      timestamp: new Date(),
      senderId: "user",
      senderName: "You",
      type: "text",
      isOwn: true,
    }

    setMessages((prev) => [...prev, userMessage])
    const messageContent = newMessage
    setNewMessage("")
    triggerHaptic("light")

    // Show agent typing
    setIsAgentTyping(true)

    // Simulate agent response
    setTimeout(
      () => {
        const agentResponse = generateAgentResponse(messageContent, agentId, currentAgent)
        const agentMessage: AgentMessage = {
          id: (Date.now() + 1).toString(),
          content: agentResponse.content,
          timestamp: new Date(),
          senderId: agentId,
          senderName: currentAgent.name,
          type: agentResponse.type,
          isOwn: false,
          agentCapability: agentResponse.capability,
        }

        setMessages((prev) => [...prev, agentMessage])
        setIsAgentTyping(false)
        triggerHaptic("success")
      },
      1500 + Math.random() * 1000,
    )
  }

  const generateAgentResponse = (userMessage: string, agentId: string, agent: any) => {
    const lowerMessage = userMessage.toLowerCase()

    // Agent-specific responses
    switch (agentId) {
      case "smart-assistant":
        if (lowerMessage.includes("help") || lowerMessage.includes("assist")) {
          return {
            content:
              "I'm here to help! I can assist with research, analysis, planning, and general problem-solving. What specific task would you like help with?",
            type: "text" as const,
            capability: "General Help",
          }
        }
        break

      case "code-companion":
        if (lowerMessage.includes("code") || lowerMessage.includes("bug") || lowerMessage.includes("debug")) {
          return {
            content:
              "I'd be happy to help with your code! Please share the code snippet or describe the issue you're facing, and I'll provide debugging assistance and best practices.",
            type: "text" as const,
            capability: "Debugging",
          }
        }
        break

      case "creative-writer":
        if (lowerMessage.includes("write") || lowerMessage.includes("content") || lowerMessage.includes("story")) {
          return {
            content:
              "Let's create something amazing together! What type of content are you looking to write? I can help with articles, stories, marketing copy, or any creative writing project.",
            type: "text" as const,
            capability: "Writing",
          }
        }
        break

      case "legal-assistant":
        if (lowerMessage.includes("legal") || lowerMessage.includes("contract") || lowerMessage.includes("law")) {
          return {
            content:
              "I can help with legal research and document analysis. Please note that I provide informational assistance only and this doesn't constitute legal advice. What legal topic would you like to explore?",
            type: "text" as const,
            capability: "Legal Research",
          }
        }
        break

      case "designer-agent":
        if (lowerMessage.includes("design") || lowerMessage.includes("ui") || lowerMessage.includes("brand")) {
          return {
            content:
              "Great! I love working on design projects. Are you looking for UI/UX design, brand identity, visual content, or help with design systems? Let me know your vision!",
            type: "text" as const,
            capability: "UI Design",
          }
        }
        break
    }

    // Default responses
    const defaultResponses = [
      {
        content: `That's an interesting question! Based on my expertise in ${agent.capabilities.join(", ").toLowerCase()}, I can help you explore this further. Could you provide more details?`,
        type: "text" as const,
        capability: agent.capabilities[0],
      },
      {
        content: `I understand you're looking for assistance. My specialties include ${agent.capabilities.join(", ").toLowerCase()}. How can I apply these skills to help you?`,
        type: "text" as const,
        capability: agent.capabilities[1] || agent.capabilities[0],
      },
    ]

    return defaultResponses[Math.floor(Math.random() * defaultResponses.length)]
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleCapabilityClick = (capability: string) => {
    setNewMessage(`Help me with ${capability.toLowerCase()}`)
    triggerHaptic("selection")
  }

  const showBackButton = isMobile || (screenSize === "tablet" && orientation === "portrait")

  if (!agentId || !currentAgent) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-400">
        <Bot className="h-16 w-16 mb-4 opacity-50" />
        <h3 className="text-lg font-medium mb-2">No Agent Selected</h3>
        <p className="text-sm text-center max-w-md px-4">
          Select an AI agent from the sidebar to start a conversation and get specialized assistance.
        </p>
      </div>
    )
  }

  const AgentIcon = currentAgent.icon

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900">
      {/* Header */}
      <div
        className={`flex items-center justify-between ${screenSize === "mobile" ? "p-3" : "p-4"} border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex-shrink-0`}
      >
        <div className="flex items-center gap-3">
          {showBackButton && (
            <Button variant="ghost" size="sm" onClick={onToggleAgentSidebar}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          <div className={`p-2 rounded-full ${currentAgent.color} text-white`}>
            <AgentIcon className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-gray-900 dark:text-white truncate">{currentAgent.name}</h3>
            <p
              className={`text-gray-500 dark:text-gray-400 truncate ${screenSize === "mobile" ? "text-xs" : "text-sm"}`}
            >
              {currentAgent.description}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">
            Online
          </Badge>
          <Button variant="ghost" size="sm">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Agent Capabilities */}
      <div
        className={`${screenSize === "mobile" ? "p-2" : "p-3"} border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800`}
      >
        <div className="flex flex-wrap gap-2">
          {agentCapabilities.map((capability) => (
            <Button
              key={capability}
              variant="outline"
              size="sm"
              className={`bg-white dark:bg-gray-700 ${screenSize === "mobile" ? "text-xs h-6" : "text-xs h-7"}`}
              onClick={() => handleCapabilityClick(capability)}
            >
              {capability}
            </Button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 min-h-0">
        <div className={`${screenSize === "mobile" ? "p-3" : "p-4"} space-y-4`}>
          {messages.map((message) => (
            <div key={message.id}>
              <MessageBubble
                message={{
                  id: message.id,
                  content: message.content,
                  timestamp: message.timestamp,
                  senderId: message.senderId,
                  senderName: message.senderName,
                  type: message.type as any,
                  isOwn: message.isOwn,
                }}
              />
              {message.agentCapability && (
                <div className="flex justify-start mt-1">
                  <Badge variant="secondary" className="text-xs">
                    {message.agentCapability}
                  </Badge>
                </div>
              )}
            </div>
          ))}

          {/* Agent typing indicator */}
          {isAgentTyping && (
            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
              <div className={`p-1.5 rounded-full ${currentAgent.color} text-white`}>
                <AgentIcon className="h-3 w-3" />
              </div>
              <div className="flex items-center gap-1">
                <Loader2 className="h-3 w-3 animate-spin" />
                <span className="text-sm">{currentAgent.name} is thinking...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Message Input */}
      <div
        className={`${screenSize === "mobile" ? "p-3" : "p-4"} border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex-shrink-0`}
      >
        <div className="flex items-end gap-2">
          <div className="flex-1 relative">
            <Textarea
              ref={textareaRef}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={`Ask ${currentAgent.name} anything...`}
              className={`resize-none border-0 bg-gray-50 dark:bg-gray-700 rounded-2xl px-4 py-3 min-h-[44px] max-h-[120px] leading-5 focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-gray-600 ${screenSize === "mobile" ? "text-sm" : "text-base"}`}
              rows={1}
            />
          </div>
          <Button
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || isAgentTyping}
            className="rounded-full min-w-[44px] h-[44px] p-0 bg-indigo-500 hover:bg-indigo-600 text-white disabled:bg-gray-300 dark:disabled:bg-gray-600"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  )
}
