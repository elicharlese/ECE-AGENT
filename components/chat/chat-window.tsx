"use client"

import { useState, useRef, useEffect } from "react"
import { Phone, Video, Menu, Bot } from "lucide-react"
import { Button } from "@/components/ui/button"
import { MessageBubble } from "./message-bubble"
import { UserProfile } from "./user-profile"
import { PinnedMessages } from "./pinned-messages"
import { MobileMessageInput } from "./mobile-message-input"
import { PullToRefresh } from "./pull-to-refresh"
import dynamic from "next/dynamic"
const AppLauncher = dynamic(() => import("../apps/app-launcher").then(m => m.AppLauncher), {
  ssr: false,
  loading: () => <div className="text-xs text-gray-400">Loading…</div>,
})
const AppMessage = dynamic(() => import("../apps/app-message").then(m => m.AppMessage), {
  ssr: false,
})
const CalculatorApp = dynamic(() => import("../apps/mini-apps/calculator-app").then(m => m.CalculatorApp), {
  ssr: false,
})
const TicTacToeApp = dynamic(() => import("../apps/mini-apps/tic-tac-toe-app").then(m => m.TicTacToeApp), {
  ssr: false,
})
const EventPlannerApp = dynamic(() => import("../apps/mini-apps/event-planner-app").then(m => m.EventPlannerApp), {
  ssr: false,
})
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useIsMobile } from "@/hooks/use-mobile"
import { useHaptics } from "@/hooks/use-haptics"
const AgentIntegration = dynamic(() => import("../agents/agent-integration").then(m => m.AgentIntegration), {
  ssr: false,
})
const PhoneCallUI = dynamic(() => import("../calls/phone-call-ui").then(m => m.PhoneCallUI), {
  ssr: false,
})
const VideoCallUI = dynamic(() => import("../calls/video-call-ui").then(m => m.VideoCallUI), {
  ssr: false,
})
import { useWebSocket } from "@/hooks/use-websocket"
import { TypingIndicator } from "./typing-indicator"

interface Message {
  id: string
  content: string
  timestamp: Date
  senderId: string
  senderName: string
  type: "text" | "image" | "video" | "audio" | "document" | "system" | "gif" | "app"
  isOwn: boolean
  mediaUrl?: string
  fileName?: string
  fileSize?: string
  isPinned?: boolean
  isLiked?: boolean
  likeCount?: number
  appData?: {
    appId: string
    appName: string
  }
}

const mockMessages: Message[] = [
  {
    id: "1",
    content: "Hey! How was your day?",
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
    senderId: "2",
    senderName: "Sarah Wilson",
    type: "text",
    isOwn: false,
  },
  {
    id: "2",
    content: "It was great! Just finished a big project at work. How about you?",
    timestamp: new Date(Date.now() - 1000 * 60 * 25),
    senderId: "1",
    senderName: "You",
    type: "text",
    isOwn: true,
  },
  {
    id: "3",
    content:
      "📅 Event: Team Meeting\n📍 Conference Room A\n🕐 2024-01-15 at 14:00\n👥 Attendees: Sarah, John, Mike\n📝 Quarterly review and planning",
    timestamp: new Date(Date.now() - 1000 * 60 * 20),
    senderId: "2",
    senderName: "Sarah Wilson",
    type: "app",
    isOwn: false,
    appData: {
      appId: "event-planner",
      appName: "Event Planner",
    },
  },
  {
    id: "4",
    content: "🎮 Tic Tac Toe: Player X wins!",
    timestamp: new Date(Date.now() - 1000 * 60 * 18),
    senderId: "1",
    senderName: "You",
    type: "app",
    isOwn: true,
    appData: {
      appId: "tic-tac-toe",
      appName: "Tic Tac Toe",
    },
  },
  {
    id: "5",
    content: "Thanks! Want to celebrate over dinner this weekend?",
    timestamp: new Date(Date.now() - 1000 * 60 * 15),
    senderId: "1",
    senderName: "You",
    type: "text",
    isOwn: true,
    isLiked: true,
    likeCount: 2,
  },
]

interface ChatWindowProps {
  chatId: string
  onToggleSidebar: () => void
  sidebarCollapsed: boolean
}

export function ChatWindow({ chatId, onToggleSidebar, sidebarCollapsed }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>(mockMessages)
  const [newMessage, setNewMessage] = useState("")
  const [activeApp, setActiveApp] = useState<string | null>(null)
  const [activeAppName, setActiveAppName] = useState<string>("")
  const [showAgentIntegration, setShowAgentIntegration] = useState(false)
  const [showPhoneCall, setShowPhoneCall] = useState(false)
  const [showVideoCall, setShowVideoCall] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const isMobile = useIsMobile()
  const { triggerHaptic } = useHaptics()
  const { isConnected, messages: wsMessages, joinConversation, sendChatMessage, sendTyping, typingUsers: wsTypingUsers } = useWebSocket()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    // Join the conversation when the component mounts
    if (isConnected) {
      joinConversation(chatId)
    }
  }, [isConnected, chatId])

  useEffect(() => {
    // Map the latest useWebSocket message (shape: { id, text, sender, senderName?, timestamp, conversationId, type? })
    if (wsMessages.length === 0) return
    const latest: any = wsMessages[wsMessages.length - 1]
    if (latest && typeof latest === 'object' && 'text' in latest) {
      const mapped: Message = {
        id: latest.id || Date.now().toString(),
        content: latest.text || '',
        timestamp: latest.timestamp instanceof Date ? latest.timestamp : new Date(latest.timestamp || Date.now()),
        senderId: latest.sender === 'user' ? '1' : latest.sender === 'ai' ? 'ai-assistant' : 'other',
        senderName: latest.senderName || (latest.sender === 'user' ? 'You' : latest.sender === 'ai' ? 'AI Assistant' : 'Other'),
        type: latest.type || 'text',
        isOwn: latest.sender === 'user',
        mediaUrl: latest.mediaUrl,
        fileName: latest.fileName,
        fileSize: latest.fileSize,
        isPinned: latest.isPinned,
        isLiked: latest.isLiked,
        likeCount: latest.likeCount,
        appData: latest.appData ? { appId: latest.appData.appId, appName: latest.appData.appName } : undefined,
      }
      setMessages(prev => (prev.some(m => m.id === mapped.id) ? prev : [...prev, mapped]))
    }
  }, [wsMessages])

  const handleSendMessage = () => {
    if (!newMessage.trim()) return

    // Send message via WebSocket
    // useWebSocket expects (text, conversationId)
    sendChatMessage(newMessage, chatId)
    setNewMessage("")
  }

  const handleEmojiSelect = (emoji: string) => {
    setNewMessage((prev) => prev + emoji)
  }

  const handleFileSelect = (file: File, type: string) => {
    const fileUrl = URL.createObjectURL(file)
    const message: Message = {
      id: Date.now().toString(),
      content: `Shared a ${type}`,
      timestamp: new Date(),
      senderId: "1",
      senderName: "You",
      type: type as Message["type"],
      isOwn: true,
      mediaUrl: fileUrl,
      fileName: file.name,
      fileSize: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
    }

    setMessages((prev) => [...prev, message])
  }

  const handleRefresh = async () => {
    await new Promise((resolve) => setTimeout(resolve, 1000))
    triggerHaptic("success")
    console.log("Refreshed messages")
  }

  const handleLaunchApp = (appId: string, appName: string) => {
    setActiveApp(appId)
    setActiveAppName(appName)
  }

  const handleAppShare = (content: string, appId: string, appName: string) => {
    const message: Message = {
      id: Date.now().toString(),
      content,
      timestamp: new Date(),
      senderId: "1",
      senderName: "You",
      type: "app",
      isOwn: true,
      appData: {
        appId,
        appName,
      },
    }

    setMessages((prev) => [...prev, message])
    setActiveApp(null)
    setActiveAppName("")
  }

  const handleOpenApp = (appId: string) => {
    // Find app name from the message or use default
    const appNames: Record<string, string> = {
      calculator: "Calculator",
      "tic-tac-toe": "Tic Tac Toe",
      "event-planner": "Event Planner",
    }
    handleLaunchApp(appId, appNames[appId] || "App")
  }

  const renderActiveApp = () => {
    switch (activeApp) {
      case "calculator":
        return <CalculatorApp onShare={(result) => handleAppShare(result, "calculator", "Calculator")} />
      case "tic-tac-toe":
        return <TicTacToeApp onShare={(result) => handleAppShare(result, "tic-tac-toe", "Tic Tac Toe")} />
      case "event-planner":
        return <EventPlannerApp onShare={(event) => handleAppShare(event, "event-planner", "Event Planner")} />
      default:
        return null
    }
  }

  const handleAgentMessage = (agentId: string, message: string) => {
    const agentMessage: Message = {
      id: Date.now().toString(),
      content: message,
      timestamp: new Date(),
      senderId: agentId,
      senderName: `Agent ${agentId}`,
      type: "text",
      isOwn: false,
    }
    setMessages((prev) => [...prev, agentMessage])
  }

  const handleAgentAppLaunch = (appId: string, agentId: string, context?: any) => {
    const appNames: Record<string, string> = {
      calculator: "Calculator",
      "tic-tac-toe": "Tic Tac Toe",
      "event-planner": "Event Planner",
    }

    // Launch app with agent context
    setActiveApp(appId)
    setActiveAppName(appNames[appId] || "App")

    // Send agent message about app launch
    handleAgentMessage(agentId, `I've launched ${appNames[appId]} for you based on our conversation.`)
  }

  const handleWorkflowTrigger = (workflowId: string, agentId: string) => {
    console.log(`Agent ${agentId} triggered workflow ${workflowId}`)
    handleAgentMessage(agentId, `I'm running a workflow to help with your request...`)
  }

  const handlePhoneCall = () => {
    setShowPhoneCall(true)
    triggerHaptic("medium")
  }

  const handleVideoCall = () => {
    setShowVideoCall(true)
    triggerHaptic("medium")
  }

  // Mock chat info based on chatId with user profile data
  const chatInfo = {
    id: chatId,
    name: chatId === "1" ? "Sarah Wilson" : "Team Project",
    email: chatId === "1" ? "sarah.wilson@example.com" : "team@project.com",
    phone: chatId === "1" ? "+1 (555) 234-5678" : undefined,
    bio: chatId === "1" ? "UX Designer passionate about creating beautiful interfaces." : "Project collaboration space",
    status: "online" as const,
    customStatus: chatId === "1" ? "Working from home 🏠" : undefined,
    isOnline: true,
    avatar: undefined,
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900">
      {/* Header */}
      <div
        className={`
        flex items-center justify-between bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700
        ${isMobile ? "px-3 py-2 safe-area-inset-top" : "p-4"}
        flex-shrink-0
      `}
      >
        <div className="flex items-center gap-3">
          {sidebarCollapsed && (
            <Button variant="ghost" size="sm" onClick={onToggleSidebar}>
              <Menu className="h-4 w-4" />
            </Button>
          )}
          <UserProfile user={chatInfo} isOwnProfile={false} />
        </div>

        <div className="flex items-center gap-2">
          <PinnedMessages chatId={chatId} />
          <AppLauncher onLaunchApp={handleLaunchApp} />
          <Button variant="ghost" size="sm" onClick={() => setShowAgentIntegration(true)}>
            <Bot className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={handlePhoneCall}>
            <Phone className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={handleVideoCall}>
            <Video className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Messages with Pull to Refresh */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <PullToRefresh onRefresh={handleRefresh}>
          <div className={`h-full ${isMobile ? "px-3 py-2" : "p-4"}`}>
            <div className="space-y-4">
              {messages.map((message) =>
                message.type === "app" ? (
                  <div key={message.id} className={`flex ${message.isOwn ? "justify-end" : "justify-start"}`}>
                    <AppMessage
                      message={{
                        appId: message.appData?.appId || "",
                        appName: message.appData?.appName || "",
                        content: message.content,
                        timestamp: message.timestamp,
                      }}
                      onOpenApp={handleOpenApp}
                    />
                  </div>
                ) : (
                  <MessageBubble key={message.id} message={message} />
                ),
              )}
              {/* Typing Indicators */}
              {Object.entries(wsTypingUsers).map(([userId, userInfo]) => (
                <TypingIndicator 
                  key={userId} 
                  userId={userId} 
                  userName={userInfo.name} 
                />
              ))}
              <div ref={messagesEndRef} />
            </div>
          </div>
        </PullToRefresh>
      </div>

      {/* Message Input */}
      <div className="flex-shrink-0">
        <MobileMessageInput
          value={newMessage}
          onChange={setNewMessage}
          onSend={handleSendMessage}
          onEmojiSelect={handleEmojiSelect}
          onFileSelect={handleFileSelect}
        />
      </div>

      {/* App Modal */}
      <Dialog open={!!activeApp} onOpenChange={() => setActiveApp(null)}>
        <DialogContent className="max-w-fit">
          <DialogHeader>
            <DialogTitle>{activeAppName}</DialogTitle>
          </DialogHeader>
          {renderActiveApp()}
        </DialogContent>
      </Dialog>

      {/* Agent Integration Dialog */}
      <Dialog open={showAgentIntegration} onOpenChange={setShowAgentIntegration}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Agent Integration</DialogTitle>
          </DialogHeader>
          <AgentIntegration
            chatId={chatId}
            onAgentMessage={handleAgentMessage}
            onAppLaunch={handleAgentAppLaunch}
            onWorkflowTrigger={handleWorkflowTrigger}
          />
        </DialogContent>
      </Dialog>

      {/* Call UI Dialogs */}
      <PhoneCallUI
        isOpen={showPhoneCall}
        onClose={() => setShowPhoneCall(false)}
        contact={chatInfo}
        callType="outgoing"
      />

      <VideoCallUI
        isOpen={showVideoCall}
        onClose={() => setShowVideoCall(false)}
        contact={chatInfo}
        callType="outgoing"
      />
    </div>
  )
}
