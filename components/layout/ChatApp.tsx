"use client"

import { useState, useEffect, useRef } from "react"
import { useUser } from "@/contexts/user-context"
import { LoginForm } from "@/components/login-form"
import dynamic from "next/dynamic"
import { useSearchParams } from "next/navigation"
const ChatSidebar = dynamic(() => import("@/components/chat/chat-sidebar").then(m => m.ChatSidebar), {
  ssr: false,
  loading: () => <div className="p-4 text-sm text-gray-500">Loading sidebar…</div>,
})
const ChatWindow = dynamic(() => import("@/components/chat/chat-window").then(m => m.ChatWindow), {
  ssr: false,
  loading: () => <div className="p-4 text-sm text-gray-500">Loading chat…</div>,
})
const AgentSidebar = dynamic(() => import("@/components/chat/agent-sidebar").then(m => m.AgentSidebar), {
  ssr: false,
  loading: () => <div className="p-4 text-sm text-gray-500">Loading agents…</div>,
})
import { QuickChatDrawer } from "@/components/chat/QuickChatDrawer"
import { useIsMobile } from "@/hooks/use-mobile"
import { useResponsiveLayout } from "@/hooks/use-responsive-layout"
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable"
import { Menu } from "lucide-react"
import type { ImperativePanelHandle } from "react-resizable-panels"
import { EmptyChatState } from "@/components/chat/EmptyChatState"
import { useConversations } from "@/hooks/use-conversations"
import { useHotkeys } from "@/hooks/use-hotkeys"
import { ChatTabsBar } from "@/components/chat/ChatTabsBar"
import { ErrorBoundary, ChatErrorBoundary } from "@/components/ErrorBoundary"
import { AuthLoadingState } from "@/components/LoadingStates"

export function ChatApp() {
  const { user, isLoading } = useUser()

  if (!user && !isLoading) {
    return <LoginForm />
  }

  if (isLoading) {
    return (
      <ErrorBoundary>
        <AuthLoadingState />
        <QuickChatDrawer title="Quick Chat" />
      </ErrorBoundary>
    )
  }

  return <AuthenticatedChatApp />
}

function AuthenticatedChatApp() {
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null)
  const [selectedAgentId, setSelectedAgentId] = useState<string>()
  const [leftPanelState, setLeftPanelState] = useState<"expanded" | "minimized" | "collapsed">("expanded")
  const [rightPanelState, setRightPanelState] = useState<"expanded" | "minimized" | "collapsed">("expanded")
  const [showAgentSidebar] = useState(true)
  const leftPanelRef = useRef<ImperativePanelHandle | null>(null)
  const rightPanelRef = useRef<ImperativePanelHandle | null>(null)
  const isMobile = useIsMobile()
  const { screenSize, orientation, canShowDualSidebars, shouldCollapseSidebars } = useResponsiveLayout()
  const searchParams = useSearchParams()
  const isPopout = (searchParams.get("popout") || "") === "1"
  const { conversations, createConversation } = useConversations()

  useEffect(() => {
    if (shouldCollapseSidebars) {
      setLeftPanelState("collapsed")
      setRightPanelState("collapsed")
    } else if (canShowDualSidebars) {
      setLeftPanelState("expanded")
      setRightPanelState("expanded")
    }
  }, [shouldCollapseSidebars, canShowDualSidebars])

  const handleSelectAgent = (agentId: string) => {
    setSelectedAgentId(agentId)
    if (isMobile || screenSize === "tablet") {
        setRightPanelState("collapsed")
    }
  }

  const handleSelectChat = (chatId: string) => {
    setSelectedChatId(chatId)
    if (isMobile) {
      setLeftPanelState("collapsed")
    }
  }

  // Keyboard shortcuts to switch chats: Alt+ArrowLeft / Alt+ArrowRight
  const selectRelativeChat = (delta: -1 | 1) => {
    if (!conversations || conversations.length === 0) return
    const idx = Math.max(0, conversations.findIndex((c) => c.id === selectedChatId))
    const nextIdx = (idx + delta + conversations.length) % conversations.length
    setSelectedChatId(conversations[nextIdx].id)
  }

  useHotkeys([
    { combo: "alt+arrowleft", onTrigger: () => selectRelativeChat(-1), preventDefault: true },
    { combo: "alt+arrowright", onTrigger: () => selectRelativeChat(1), preventDefault: true },
  ])

  // Sync selected chat with `?c=` query param (e.g., after Quick Invite creates a chat)
  useEffect(() => {
    const c = searchParams.get("c")
    if (c && c !== selectedChatId) {
      setSelectedChatId(c)
      if (isMobile) {
        setLeftPanelState("collapsed")
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  // Enforce sizes for desktop ResizablePanels to match panelState
  useEffect(() => {
    const ref = leftPanelRef.current
    if (!ref) return
    if (leftPanelState === "collapsed") {
      ref.collapse()
    } else if (leftPanelState === "minimized") {
      ref.resize(5)
    } else {
      // expanded
      ref.resize(25)
    }
  }, [leftPanelState])

  useEffect(() => {
    const ref = rightPanelRef.current
    if (!ref) return
    if (rightPanelState === "collapsed") {
      ref.collapse()
    } else if (rightPanelState === "minimized") {
      ref.resize(5)
    } else {
      // expanded
      ref.resize(25)
    }
  }, [rightPanelState])

  // Popout mode: render only ChatWindow for a clean standalone view
  if (isPopout) {
    return (
      <div className="h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden">
        {selectedChatId ? (
          <ChatWindow
            chatId={selectedChatId}
            onToggleSidebar={() => { /* no-op in popout */ }}
            sidebarCollapsed={true}
          />
        ) : (
          <div className="h-full flex items-center justify-center text-sm text-gray-600 dark:text-gray-300">
            Open a conversation to use popout
          </div>
        )}
      </div>
    )
  }

  const getLeftSidebarWidth = () => {
    if (leftPanelState === "collapsed") return "w-0"
    if (leftPanelState === "minimized") return "w-14"
    if (screenSize === "mobile") return "w-full"
    if (screenSize === "tablet") return "w-72"
    return "w-80"
  }

  // removed unused getRightSidebarWidth

  const cycleLeft = () => {
    // Mobile & tablet-portrait: open full width directly (skip minimized)
    if (isMobile || (screenSize === "tablet" && orientation === "portrait")) {
      setLeftPanelState((prev) => (prev === "collapsed" ? "expanded" : "collapsed"))
      return
    }
    // Desktop/tablet-landscape: tri-state
    setLeftPanelState((prev) => (prev === "collapsed" ? "minimized" : prev === "minimized" ? "expanded" : "collapsed"))
  }

  const cycleRight = () => {
    // Mobile & tablet-portrait: open full width directly (skip minimized)
    if (isMobile || (screenSize === "tablet" && orientation === "portrait")) {
      setRightPanelState((prev) => (prev === "collapsed" ? "expanded" : "collapsed"))
      return
    }
    // Desktop/tablet-landscape: tri-state
    setRightPanelState((prev) => (prev === "collapsed" ? "minimized" : prev === "minimized" ? "expanded" : "collapsed"))
  }

  return (
    <div className="h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden relative">
      {/* Edge toggles when sidebars are collapsed */}
      {leftPanelState === "collapsed" && (
        <button
          type="button"
          onClick={cycleLeft}
          aria-label="Open left sidebar"
          className="absolute left-1 top-1/2 -translate-y-1/2 z-50 rounded-md border border-transparent bg-white/90 dark:bg-gray-800/90 p-2 shadow hover:bg-white dark:hover:bg-gray-800"
        >
          <Menu className="h-4 w-4" />
        </button>
      )}
      {showAgentSidebar && rightPanelState === "collapsed" && (
        <button
          type="button"
          onClick={cycleRight}
          aria-label="Open right sidebar"
          className="absolute right-1 top-1/2 -translate-y-1/2 z-50 rounded-md border border-transparent bg-white/90 dark:bg-gray-800/90 p-2 shadow hover:bg-white dark:hover:bg-gray-800"
        >
          <Menu className="h-4 w-4" />
        </button>
      )}
      {isMobile || (screenSize === "tablet" && orientation === "portrait") ? (
        <div className="flex h-full">
          <div
            className={`
            ${getLeftSidebarWidth()}
            fixed inset-y-0 left-0 z-50
            transition-all duration-300 ease-in-out
            ${isMobile ? "safe-area-inset-left" : ""}
            ${screenSize === "tablet" && orientation === "portrait" ? "safe-area-inset-left" : ""}
          `}
          >
            <div className="relative h-full">
              <ChatSidebar
                selectedChatId={selectedChatId || ""}
                onSelectChat={handleSelectChat}
                panelState={leftPanelState}
                onSetPanelState={setLeftPanelState}
              />
              {leftPanelState !== "collapsed" && (
                <button
                  type="button"
                  onClick={cycleLeft}
                  aria-label={`Toggle left sidebar (${leftPanelState})`}
                  className="absolute -right-2 top-1/2 -translate-y-1/2 z-40 rounded-r-md border border-transparent bg-white/90 dark:bg-gray-800/90 p-2 shadow hover:bg-white dark:hover:bg-gray-800"
                >
                  <Menu className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          <div className="flex-1 flex flex-col min-w-0">
            {/* Chat tabs bar at the top of chat area (mobile/tablet portrait) */}
            <div className="border-b border-transparent bg-gray-50 dark:bg-gray-900">
              <ChatTabsBar
                conversations={conversations}
                value={selectedChatId}
                onValueChange={(id) => handleSelectChat(id)}
                className="px-2 py-1"
              />
            </div>
            {selectedChatId ? (
              <ChatErrorBoundary>
                <ChatWindow
                  chatId={selectedChatId}
                  onToggleSidebar={() => setLeftPanelState(leftPanelState === "expanded" ? "collapsed" : "expanded")}
                  sidebarCollapsed={leftPanelState !== "expanded"}
                />
              </ChatErrorBoundary>
            ) : (
              <EmptyChatState
                onStartNewChat={async () => {
                  try {
                    const conv = await createConversation("New Chat")
                    setSelectedChatId(conv.id)
                    if (isMobile) setLeftPanelState("collapsed")
                  } catch { /* no-op */ }
                }}
              />
            )}
          </div>
        </div>
      ) : (
        <ResizablePanelGroup direction="horizontal" className="h-full">
          <ResizablePanel
            ref={leftPanelRef}
            defaultSize={25}
            minSize={leftPanelState === "minimized" ? 5 : 15}
            maxSize={35}
            className="min-w-0"
            collapsible
            collapsedSize={0}
          >
            <div className="relative h-full">
              <ChatSidebar
                selectedChatId={selectedChatId || ""}
                onSelectChat={handleSelectChat}
                panelState={leftPanelState}
                onSetPanelState={setLeftPanelState}
              />
              {leftPanelState !== "collapsed" && (
                <button
                  type="button"
                  onClick={cycleLeft}
                  aria-label={`Toggle left sidebar (${leftPanelState})`}
                  className="absolute -right-2 top-1/2 -translate-y-1/2 z-40 rounded-r-md border border-transparent bg-white/90 dark:bg-gray-800/90 p-2 shadow hover:bg-white dark:hover:bg-gray-800"
                >
                  <Menu className="h-4 w-4" />
                </button>
              )}
            </div>
          </ResizablePanel>

          <ResizableHandle />

          <ResizablePanel defaultSize={50} minSize={30} className="min-w-0 overflow-hidden">
            {/* Chat tabs bar at the top of chat area (desktop/tablet landscape) */}
            <div className="border-b border-transparent bg-gray-50 dark:bg-gray-900">
              <ChatTabsBar
                conversations={conversations}
                value={selectedChatId}
                onValueChange={(id) => handleSelectChat(id)}
                className="px-2 py-1"
              />
            </div>
            {selectedChatId ? (
              <ChatErrorBoundary>
                <ChatWindow
                  chatId={selectedChatId}
                  onToggleSidebar={() => setLeftPanelState(leftPanelState === "expanded" ? "collapsed" : "expanded")}
                  sidebarCollapsed={leftPanelState !== "expanded"}
                />
              </ChatErrorBoundary>
            ) : (
              <EmptyChatState
                onStartNewChat={async () => {
                  try {
                    const conv = await createConversation("New Chat")
                    setSelectedChatId(conv.id)
                  } catch { /* no-op */ }
                }}
              />
            )}
          </ResizablePanel>

          {showAgentSidebar && (
            <>
              <ResizableHandle />
              <ResizablePanel
                ref={rightPanelRef}
                defaultSize={25}
                minSize={rightPanelState === "minimized" ? 5 : 15}
                maxSize={35}
                className="min-w-0"
                collapsible
                collapsedSize={0}
              >
                <div className="relative h-full">
                  {rightPanelState !== "collapsed" && (
                    <button
                      type="button"
                      onClick={cycleRight}
                      aria-label={`Toggle right sidebar (${rightPanelState})`}
                      className="absolute -left-2 top-1/2 -translate-y-1/2 z-40 rounded-l-md border border-transparent bg-white/90 dark:bg-gray-800/90 p-2 shadow hover:bg-white dark:hover:bg-gray-800"
                    >
                      <Menu className="h-4 w-4" />
                    </button>
                  )}
                  <AgentSidebar
                    selectedAgentId={selectedAgentId}
                    onSelectAgent={handleSelectAgent}
                    panelState={rightPanelState}
                    onSetPanelState={setRightPanelState}
                  />
                </div>
              </ResizablePanel>
            </>
          )}
        </ResizablePanelGroup>
      )}

      {showAgentSidebar && isMobile && rightPanelState === "expanded" && (
        <div className="fixed inset-y-0 right-0 z-50 w-full safe-area-inset-right">
          <AgentSidebar
            selectedAgentId={selectedAgentId}
            onSelectAgent={handleSelectAgent}
            panelState={"expanded"}
            onSetPanelState={setRightPanelState}
          />
        </div>
      )}

      {showAgentSidebar && screenSize === "tablet" && orientation === "portrait" && rightPanelState === "expanded" && (
        <div className="fixed inset-y-0 right-0 z-50 w-72">
          <AgentSidebar
            selectedAgentId={selectedAgentId}
            onSelectAgent={handleSelectAgent}
            panelState={"expanded"}
            onSetPanelState={setRightPanelState}
          />
        </div>
      )}

      {isMobile && leftPanelState === "expanded" && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setLeftPanelState("collapsed")}
          style={{ touchAction: "none" }}
        />
      )}

      {isMobile && showAgentSidebar && rightPanelState === "expanded" && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setRightPanelState("collapsed")}
          style={{ touchAction: "none" }}
        />
      )}

      {screenSize === "tablet" && orientation === "portrait" && leftPanelState === "expanded" && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setLeftPanelState("collapsed")}
          style={{ touchAction: "none" }}
        />
      )}

      {screenSize === "tablet" && orientation === "portrait" && showAgentSidebar && rightPanelState === "expanded" && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setRightPanelState("collapsed")}
          style={{ touchAction: "none" }}
        />
      )}

      <QuickChatDrawer title="Quick Chat" />
    </div>
  )
}
