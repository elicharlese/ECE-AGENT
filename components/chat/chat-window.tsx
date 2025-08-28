"use client"

import { useState, useRef, useEffect, useMemo, useCallback } from "react"
import { MessageBubble } from "./message-bubble"
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
import { useConversations } from "@/hooks/use-conversations"
import { EnhancedChatHeader } from "./enhanced-chat-header"
import { InviteUsersDialog } from "./invite-users-dialog"
import { supabase } from "@/lib/supabase/client"
import { getProfileByIdentifier, getProfileByUsername } from "@/services/profile-service"
import { ChevronDown } from "lucide-react"
import { format, isToday, isYesterday } from "date-fns"
import { Skeleton } from "@/components/ui/skeleton"
import { messageService } from "@/services/message-service"
import { toast } from "@/components/ui/use-toast"
import { DesktopMessageInput } from "./DesktopMessageInput"

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
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [activeApp, setActiveApp] = useState<string | null>(null)
  const [activeAppName, setActiveAppName] = useState<string>("")
  const [showAgentIntegration, setShowAgentIntegration] = useState(false)
  const [showPhoneCall, setShowPhoneCall] = useState(false)
  const [showVideoCall, setShowVideoCall] = useState(false)
  const [showInviteDialog, setShowInviteDialog] = useState(false)
  const [participantsCount, setParticipantsCount] = useState<number>(1)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const [isAtBottom, setIsAtBottom] = useState(true)
  const [showJump, setShowJump] = useState(false)
  const [lastReadAt, setLastReadAt] = useState<Date | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const isMobile = useIsMobile()
  const { triggerHaptic } = useHaptics()
  const { isConnected, messages: wsMessages, joinConversation, sendChatMessage, sendTyping, sendEditMessage, typingUsers: wsTypingUsers } = useWebSocket()
  const { conversations, inviteParticipants } = useConversations()

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    setIsAtBottom(true)
    // Mark as read when user jumps to latest
    const lastTs = messages[messages.length - 1]?.timestamp
    if (lastTs) {
      setLastReadAt(lastTs)
      try {
        localStorage.setItem(`chat_last_read_${chatId}`, String(lastTs.getTime()))
      } catch {}
    }
  }, [messages, chatId])

  // Persist and restore last read timestamp per chat
  useEffect(() => {
    try {
      const raw = localStorage.getItem(`chat_last_read_${chatId}`)
      if (raw) {
        const d = new Date(Number(raw))
        if (!Number.isNaN(d.valueOf())) setLastReadAt(d)
      } else if (messages.length) {
        // Default to latest message to avoid showing old messages as new on first open
        const lastTs = messages[messages.length - 1].timestamp
        setLastReadAt(lastTs)
        localStorage.setItem(`chat_last_read_${chatId}`, String(lastTs.getTime()))
      }
    } catch {}
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatId])

  // Auto-scroll when new messages arrive only if user is near bottom or message is own
  useEffect(() => {
    if (messages.length === 0) return
    const latest = messages[messages.length - 1]
    if (isAtBottom || latest.isOwn) {
      scrollToBottom()
    } else {
      setShowJump(true)
    }
  }, [messages, isAtBottom, scrollToBottom])

  useEffect(() => {
    // Join the conversation when the component mounts
    if (isConnected) {
      joinConversation(chatId)
    }
  }, [isConnected, chatId])

  // Load initial messages from backend (Supabase)
  useEffect(() => {
    let cancelled = false
    const run = async () => {
      setIsLoading(true)
      try {
        const { data: auth } = await supabase.auth.getUser()
        const me = auth?.user?.id ?? null
        const msgs = await messageService.getMessages(chatId)
        const mapped: Message[] = msgs.map((m) => ({
          id: m.id,
          content: m.content,
          timestamp: new Date(m.created_at),
          senderId: m.user_id,
          senderName: m.role === 'assistant' ? 'AI Assistant' : (m.user_id === me ? 'You' : 'Other'),
          type: (m.type as Message['type']) || 'text',
          isOwn: m.user_id === me,
        }))
        if (!cancelled) setMessages(mapped)
      } catch (e) {
        console.warn('Failed to load messages', e)
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }
    run()
    return () => { cancelled = true }
  }, [chatId])

  // Fetch participant count to determine chat type (direct vs group)
  useEffect(() => {
    let cancelled = false
    const run = async () => {
      try {
        const { count } = await supabase
          .from('conversation_participants')
          .select('user_id', { count: 'exact', head: true })
          .eq('conversation_id', chatId)
        if (!cancelled) setParticipantsCount(typeof count === 'number' ? count : 1)
      } catch (e) {
        if (!cancelled) setParticipantsCount(1)
        console.warn('Failed to load participant count', e)
      }
    }
    run()
    return () => { cancelled = true }
  }, [chatId])

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

  // React to edit events sent over WebSocket in mock/real mode
  useEffect(() => {
    if (wsMessages.length === 0) return
    const latest: any = wsMessages[wsMessages.length - 1]
    if (latest && latest.type === 'message_edited' && latest.id) {
      const newText = latest.text ?? latest.content
      if (typeof newText === 'string') {
        setMessages(prev => prev.map(m => (m.id === latest.id ? { ...m, content: newText } : m)))
      }
    }
  }, [wsMessages])

  const handleSendMessage = () => {
    if (!newMessage.trim()) return

    // Send message via WebSocket
    // useWebSocket expects (text, conversationId)
    sendChatMessage(newMessage, chatId)
    setNewMessage("")
    // Update last read immediately on send
    const now = new Date()
    setLastReadAt(now)
    try {
      localStorage.setItem(`chat_last_read_${chatId}`, String(now.getTime()))
    } catch {}
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

  // Optimistic update + persist + broadcast for inline edit
  const handleUpdateMessage = async (id: string, content: string) => {
    let previousContent = ''
    setMessages((prev) => {
      previousContent = prev.find((m) => m.id === id)?.content || ''
      return prev.map((m) => (m.id === id ? { ...m, content } : m))
    })
    try {
      await messageService.updateMessage(id, content)
      // Broadcast edit event so other clients can sync
      sendEditMessage(id, content, chatId)
      toast({ title: 'Message updated', description: 'Your edit has been saved.' })
    } catch (e: any) {
      // Revert on error
      setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, content: previousContent } : m)))
      toast({ title: 'Failed to update message', description: e?.message || 'Please try again.', variant: 'destructive' as any })
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

  const handlePopout = () => {
    try {
      const origin = typeof window !== 'undefined' ? window.location.origin : ''
      const url = new URL('/messages', origin || 'http://localhost')
      url.searchParams.set('c', chatId)
      url.searchParams.set('popout', '1')
      window.open(url.toString(), '_blank', 'noopener,noreferrer,width=520,height=720')
    } catch (e) {
      console.error('Failed to open popout window', e)
    }
  }

  const openAppLauncherDrawer = () => {
    try {
      const el = document.querySelector('[aria-label="Open apps drawer"]') as HTMLElement | null
      el?.click()
    } catch (e) {
      // no-op
    }
  }

  type InviteUserInput = { id?: string; identifier: string; type: 'email' | 'username' | 'wallet'; name?: string; avatar?: string }
  const handleInviteUsers = async (users: InviteUserInput[]) => {
    // Resolve identifiers to user IDs
    const resolved = await Promise.all(users.map(async (u) => {
      if (u.id) return u.id
      if (u.type === 'username') {
        const uname = u.identifier.startsWith('@') ? u.identifier.slice(1) : u.identifier
        const prof = await getProfileByUsername(uname)
        return prof?.user_id
      }
      if (u.type === 'email') {
        const prof = await getProfileByIdentifier(u.identifier)
        return prof?.user_id
      }
      // wallet: attempt lookup by solana_address
      try {
        // Debug logging to verify this branch executes in tests
        // eslint-disable-next-line no-console
        console.info('[invite] wallet lookup start', u.identifier)
        const { data, error } = await supabase
          .from('profiles')
          .select('user_id')
          .eq('solana_address', u.identifier)
          .limit(1)
        // eslint-disable-next-line no-console
        console.info('[invite] wallet lookup result', data)
        // eslint-disable-next-line no-console
        if (error) console.info('[invite] wallet lookup error', error)
        const id = Array.isArray(data) ? (data[0]?.user_id ?? null) : (data as any)?.user_id ?? null
        return id
      } catch {
        // eslint-disable-next-line no-console
        console.error('[invite] wallet lookup error')
        return null
      }
    }))
    const userIds = Array.from(new Set(resolved.filter((id): id is string => !!id)))
    if (userIds.length === 0) {
      throw new Error('No matching users found for invitations')
    }
    await inviteParticipants(chatId, userIds)
  }

  // Scroll observer to toggle Jump button
  const handleScroll: React.UIEventHandler<HTMLDivElement> = (e) => {
    const el = e.currentTarget
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight
    const atBottom = distanceFromBottom < 40
    setIsAtBottom(atBottom)
    setShowJump(!atBottom && messages.length > 0)
    if (atBottom && messages.length > 0) {
      const lastTs = messages[messages.length - 1].timestamp
      if (!lastReadAt || lastTs > lastReadAt) {
        setLastReadAt(lastTs)
        try {
          localStorage.setItem(`chat_last_read_${chatId}`, String(lastTs.getTime()))
        } catch {}
      }
    }
  }

  // Day divider helpers
  const dayLabel = (d: Date) => (isToday(d) ? "Today" : isYesterday(d) ? "Yesterday" : format(d, "EEEE, MMM d"))

  const firstUnreadIndex = useMemo(() => {
    if (!lastReadAt) return -1
    return messages.findIndex((m) => m.timestamp > lastReadAt)
  }, [messages, lastReadAt])

  const DateDivider: React.FC<{ label: string }> = ({ label }) => (
    <div className="sticky top-0 z-10 flex items-center justify-center py-1">
      <span className="text-xs text-gray-600 dark:text-gray-300 bg-white/70 dark:bg-gray-900/70 backdrop-blur px-3 py-0.5 rounded-full border border-gray-200 dark:border-gray-700">
        {label}
      </span>
    </div>
  )

  const UnreadDivider: React.FC = () => (
    <div className="sticky top-0 z-20 flex items-center gap-2 my-2">
      <div className="flex-1 h-px bg-red-300/60" />
      <span className="text-[11px] tracking-wide uppercase text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-300 px-2 py-0.5 rounded-full border border-red-200 dark:border-red-800">
        New
      </span>
      <div className="flex-1 h-px bg-red-300/60" />
    </div>
  )

  // Derive chat info from conversations state using chatId
  const conversation = conversations.find(c => c.id === chatId)
  const isGroup = participantsCount > 2
  const chatInfo = {
    id: chatId,
    name: conversation?.title || 'New Chat',
    email: '',
    phone: undefined as string | undefined,
    bio: conversation?.title ? `Conversation • ${conversation.title}` : 'New conversation',
    status: 'online' as const,
    customStatus: undefined as string | undefined,
    avatar: undefined as string | undefined,
    type: isGroup ? ('group' as const) : ('direct' as const),
    participants: participantsCount,
    isAgent: Boolean(conversation?.agent_id),
  }

  const pinnedForHeader = messages
    .filter((m) => m.isPinned)
    .map((m) => ({ id: m.id, content: m.content, sender: m.senderName, timestamp: m.timestamp }))

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <EnhancedChatHeader
        chatInfo={chatInfo as any}
        pinnedMessages={pinnedForHeader}
        onPhoneCall={handlePhoneCall}
        onVideoCall={handleVideoCall}
        onOpenAgentSettings={() => setShowAgentIntegration(true)}
        onPopout={handlePopout}
        onOpenAppLauncher={openAppLauncherDrawer}
        onInviteUsers={isGroup ? () => setShowInviteDialog(true) : undefined}
        isMobile={isMobile}
      />
      {/* Global App Launcher Drawer and draggable tab */}
      <AppLauncher onLaunchApp={handleLaunchApp} />

      {/* Messages with Pull to Refresh */}
      <div className="flex-1 min-h-0 overflow-hidden relative">
        <PullToRefresh onRefresh={handleRefresh} ref={contentRef} onScroll={handleScroll}>
          <div className={`h-full ${isMobile ? "px-3 py-2" : "p-4"}`}>
            <div className="space-y-4">
              {/* Loading skeletons gated by a real loading flag */}
              {isLoading && (
                <div className="space-y-4 p-2">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="flex gap-2">
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-2/3" />
                        <Skeleton className="h-4 w-1/3" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {/* Empty state when not loading */}
              {!isLoading && messages.length === 0 && (
                <div className="py-12 text-center text-sm text-gray-500 dark:text-gray-400">No messages yet. Say hello!</div>
              )}

              {messages.map((message, idx) => {
                const prev = messages[idx - 1]
                const showDay = !prev || prev.timestamp.toDateString() !== message.timestamp.toDateString()
                const showUnread = firstUnreadIndex === idx
                return (
                  <div key={message.id}>
                    {showDay && <DateDivider label={dayLabel(message.timestamp)} />}
                    {showUnread && <UnreadDivider />}
                    {message.type === "app" ? (
                      <div className={`flex ${message.isOwn ? "justify-end" : "justify-start"}`}>
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
                      <MessageBubble message={message} onUpdateMessage={handleUpdateMessage} />
                    )}
                  </div>
                )
              })}
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

        {/* Jump to Latest */}
        {showJump && (
          <button
            onClick={scrollToBottom}
            className="absolute bottom-24 right-4 z-30 bg-blue-600 text-white shadow-lg rounded-full px-3 py-2 flex items-center gap-2 hover:bg-blue-700 focus:outline-none"
            aria-label="Jump to latest"
          >
            <ChevronDown className="h-4 w-4" />
            <span className="text-xs font-medium">Jump to latest</span>
          </button>
        )}
      </div>

      {/* Message Input */}
      <div className="flex-shrink-0">
        {isMobile ? (
          <MobileMessageInput
            value={newMessage}
            onChange={setNewMessage}
            onSend={handleSendMessage}
            onEmojiSelect={handleEmojiSelect}
            onFileSelect={handleFileSelect}
            onLaunchApp={handleLaunchApp}
            onAgentToggle={() => { /* reserved for parity; no-op */ }}
          />
        ) : (
          <DesktopMessageInput
            value={newMessage}
            onChange={setNewMessage}
            onSend={handleSendMessage}
            onEmojiSelect={handleEmojiSelect}
            onFileSelect={handleFileSelect}
            onLaunchApp={handleLaunchApp}
            onAgentToggle={() => { /* reserved for parity; no-op */ }}
          />
        )}
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

      {/* Invite Users Dialog */}
      <InviteUsersDialog
        isOpen={showInviteDialog}
        onClose={() => setShowInviteDialog(false)}
        chatId={chatId}
        chatName={chatInfo.name}
        isGroupChat={isGroup}
        onInviteUsers={handleInviteUsers}
      />

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
