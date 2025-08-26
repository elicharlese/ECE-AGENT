"use client"

import { useState, useEffect } from "react"
import { useUser } from "@/contexts/user-context"
import { LoginForm } from "@/components/login-form"
import dynamic from "next/dynamic"
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
import { MiniChatWidget } from "@/components/chat/MiniChatWidget"
import { useIsMobile } from "@/hooks/use-mobile"
import { useResponsiveLayout } from "@/hooks/use-responsive-layout"
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable"

export function ChatApp() {
  const { user, isLoading } = useUser()

  if (!user && !isLoading) {
    return <LoginForm />
  }

  if (isLoading) {
    return (
      <div className="flex min-h-full items-center justify-center">
        <div className="text-lg">Loading...</div>
        {/* Portaled Quick Chat available globally */}
        <MiniChatWidget title="Quick Chat" initialMinimized={true} />
      </div>
    )
  }

  return <AuthenticatedChatApp />
}

function AuthenticatedChatApp() {
  const [selectedChatId, setSelectedChatId] = useState<string>("1")
  const [selectedAgentId, setSelectedAgentId] = useState<string>()
  const [leftPanelState, setLeftPanelState] = useState<"expanded" | "minimized" | "collapsed">("expanded")
  const [rightPanelState, setRightPanelState] = useState<"expanded" | "minimized" | "collapsed">("expanded")
  const [showAgentSidebar, setShowAgentSidebar] = useState(true)
  const isMobile = useIsMobile()
  const { screenSize, orientation, canShowDualSidebars, shouldCollapseSidebars } = useResponsiveLayout()

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

  const getLeftSidebarWidth = () => {
    if (leftPanelState === "collapsed") return "w-0"
    if (leftPanelState === "minimized") return "w-14"
    if (screenSize === "mobile") return "w-full"
    if (screenSize === "tablet") return "w-72"
    return "w-80"
  }

  const getRightSidebarWidth = () => {
    if (rightPanelState === "collapsed") return "w-0"
    if (rightPanelState === "minimized") return "w-14"
    if (screenSize === "tablet") return "w-72"
    return "w-80"
  }

  const cycleLeft = () => {
    setLeftPanelState((prev) => (prev === "collapsed" ? "minimized" : prev === "minimized" ? "expanded" : "minimized"))
  }

  const cycleRight = () => {
    setRightPanelState((prev) => (prev === "collapsed" ? "minimized" : prev === "minimized" ? "expanded" : "minimized"))
  }

  return (
    <div className="h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden relative">
      {/* Top-border hamburger pill controls */}
      <div className="pointer-events-none absolute top-2 left-2 z-50 flex gap-2">
        <button
          onClick={cycleLeft}
          className="pointer-events-auto inline-flex items-center gap-2 rounded-full border border-gray-300 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 backdrop-blur px-3 py-1 text-xs text-gray-700 dark:text-gray-200 shadow-sm hover:bg-white dark:hover:bg-gray-800"
          aria-label="Toggle left sidebar"
        >
          <span className="inline-block h-3 w-3 rounded-[999px] bg-gray-500" />
          <span className="capitalize">{leftPanelState}</span>
        </button>
      </div>
      {showAgentSidebar && (
        <div className="pointer-events-none absolute top-2 right-2 z-50 flex gap-2">
          <button
            onClick={cycleRight}
            className="pointer-events-auto inline-flex items-center gap-2 rounded-full border border-gray-300 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 backdrop-blur px-3 py-1 text-xs text-gray-700 dark:text-gray-200 shadow-sm hover:bg-white dark:hover:bg-gray-800"
            aria-label="Toggle right sidebar"
          >
            <span className="inline-block h-3 w-3 rounded-[999px] bg-gray-500" />
            <span className="capitalize">{rightPanelState}</span>
          </button>
        </div>
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
            <ChatSidebar
              selectedChatId={selectedChatId}
              onSelectChat={handleSelectChat}
              panelState={leftPanelState}
              onSetPanelState={setLeftPanelState}
            />
          </div>

          <div className="flex-1 flex flex-col min-w-0">
            <ChatWindow
              chatId={selectedChatId}
              onToggleSidebar={() => setLeftPanelState(leftPanelState === "expanded" ? "collapsed" : "expanded")}
              sidebarCollapsed={leftPanelState !== "expanded"}
            />
          </div>
        </div>
      ) : (
        <ResizablePanelGroup direction="horizontal" className="h-full">
          <ResizablePanel
            defaultSize={20}
            minSize={leftPanelState === "minimized" ? 5 : 15}
            maxSize={35}
            className={leftPanelState === "collapsed" ? "min-w-0 basis-0" : leftPanelState === "minimized" ? "basis-[5%]" : ""}
          >
            <ChatSidebar
              selectedChatId={selectedChatId}
              onSelectChat={handleSelectChat}
              panelState={leftPanelState}
              onSetPanelState={setLeftPanelState}
            />
          </ResizablePanel>

          <ResizableHandle />

          <ResizablePanel defaultSize={50} minSize={30} className="min-w-0 overflow-hidden">
            <ChatWindow
              chatId={selectedChatId}
              onToggleSidebar={() => setLeftPanelState(leftPanelState === "expanded" ? "collapsed" : "expanded")}
              sidebarCollapsed={leftPanelState !== "expanded"}
            />
          </ResizablePanel>

          {showAgentSidebar && (
            <>
              <ResizableHandle />
              <ResizablePanel
                defaultSize={30}
                minSize={rightPanelState === "minimized" ? 5 : 20}
                maxSize={45}
                className={rightPanelState === "collapsed" ? "min-w-0 basis-0" : rightPanelState === "minimized" ? "basis-[5%]" : ""}
              >
                <AgentSidebar
                  selectedAgentId={selectedAgentId}
                  onSelectAgent={handleSelectAgent}
                  panelState={rightPanelState}
                  onSetPanelState={setRightPanelState}
                />
              </ResizablePanel>
            </>
          )}
        </ResizablePanelGroup>
      )}

      {showAgentSidebar && isMobile && rightPanelState === "expanded" && (
        <div className="fixed inset-y-0 right-0 z-50 w-80 safe-area-inset-right">
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

      <MiniChatWidget title="Quick Chat" initialMinimized={true} />
    </div>
  )
}
