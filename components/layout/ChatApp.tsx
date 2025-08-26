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
  const [leftSidebarCollapsed, setLeftSidebarCollapsed] = useState(false)
  const [rightSidebarCollapsed, setRightSidebarCollapsed] = useState(false)
  const [showAgentSidebar, setShowAgentSidebar] = useState(true)
  const isMobile = useIsMobile()
  const { screenSize, orientation, canShowDualSidebars, shouldCollapseSidebars } = useResponsiveLayout()

  useEffect(() => {
    if (shouldCollapseSidebars) {
      setLeftSidebarCollapsed(true)
      setRightSidebarCollapsed(true)
    } else if (canShowDualSidebars) {
      setLeftSidebarCollapsed(false)
      setRightSidebarCollapsed(false)
    }
  }, [shouldCollapseSidebars, canShowDualSidebars])

  const handleSelectAgent = (agentId: string) => {
    setSelectedAgentId(agentId)
    if (isMobile || screenSize === "tablet") {
      setRightSidebarCollapsed(true)
    }
  }

  const handleSelectChat = (chatId: string) => {
    setSelectedChatId(chatId)
    if (isMobile) {
      setLeftSidebarCollapsed(true)
    }
  }

  const getLeftSidebarWidth = () => {
    if (leftSidebarCollapsed) return "w-0"
    if (screenSize === "mobile") return "w-full"
    if (screenSize === "tablet") return "w-72"
    return "w-80"
  }

  const getRightSidebarWidth = () => {
    if (rightSidebarCollapsed) return "w-16"
    if (screenSize === "tablet") return "w-72"
    return "w-80"
  }

  return (
    <div className="h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden">
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
              collapsed={leftSidebarCollapsed}
              onToggleCollapse={() => setLeftSidebarCollapsed(!leftSidebarCollapsed)}
            />
          </div>

          <div className="flex-1 flex flex-col min-w-0">
            <ChatWindow
              chatId={selectedChatId}
              onToggleSidebar={() => setLeftSidebarCollapsed(!leftSidebarCollapsed)}
              sidebarCollapsed={leftSidebarCollapsed}
            />
          </div>
        </div>
      ) : (
        <ResizablePanelGroup direction="horizontal" className="h-full">
          <ResizablePanel 
            defaultSize={20} 
            minSize={15} 
            maxSize={35}
            className={leftSidebarCollapsed ? "min-w-0" : ""}
          >
            <ChatSidebar
              selectedChatId={selectedChatId}
              onSelectChat={handleSelectChat}
              collapsed={leftSidebarCollapsed}
              onToggleCollapse={() => setLeftSidebarCollapsed(!leftSidebarCollapsed)}
            />
          </ResizablePanel>

          <ResizableHandle />

          <ResizablePanel defaultSize={50} minSize={30}>
            <ChatWindow
              chatId={selectedChatId}
              onToggleSidebar={() => setLeftSidebarCollapsed(!leftSidebarCollapsed)}
              sidebarCollapsed={leftSidebarCollapsed}
            />
          </ResizablePanel>

          {showAgentSidebar && (
            <>
              <ResizableHandle />
              <ResizablePanel 
                defaultSize={30} 
                minSize={20} 
                maxSize={45}
                className={rightSidebarCollapsed ? "min-w-0" : ""}
              >
                <AgentSidebar
                  selectedAgentId={selectedAgentId}
                  onSelectAgent={handleSelectAgent}
                  collapsed={rightSidebarCollapsed}
                  onToggleCollapse={() => setRightSidebarCollapsed(!rightSidebarCollapsed)}
                />
              </ResizablePanel>
            </>
          )}
        </ResizablePanelGroup>
      )}

      {showAgentSidebar && isMobile && !rightSidebarCollapsed && (
        <div className="fixed inset-y-0 right-0 z-50 w-80 safe-area-inset-right">
          <AgentSidebar
            selectedAgentId={selectedAgentId}
            onSelectAgent={handleSelectAgent}
            collapsed={false}
            onToggleCollapse={() => setRightSidebarCollapsed(true)}
          />
        </div>
      )}

      {showAgentSidebar && screenSize === "tablet" && orientation === "portrait" && !rightSidebarCollapsed && (
        <div className="fixed inset-y-0 right-0 z-50 w-72">
          <AgentSidebar
            selectedAgentId={selectedAgentId}
            onSelectAgent={handleSelectAgent}
            collapsed={false}
            onToggleCollapse={() => setRightSidebarCollapsed(true)}
          />
        </div>
      )}

      {isMobile && !leftSidebarCollapsed && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setLeftSidebarCollapsed(true)}
          style={{ touchAction: "none" }}
        />
      )}

      {isMobile && showAgentSidebar && !rightSidebarCollapsed && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setRightSidebarCollapsed(true)}
          style={{ touchAction: "none" }}
        />
      )}

      {screenSize === "tablet" && orientation === "portrait" && !leftSidebarCollapsed && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setLeftSidebarCollapsed(true)}
          style={{ touchAction: "none" }}
        />
      )}

      {screenSize === "tablet" && orientation === "portrait" && showAgentSidebar && !rightSidebarCollapsed && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setRightSidebarCollapsed(true)}
          style={{ touchAction: "none" }}
        />
      )}

      <MiniChatWidget title="Quick Chat" initialMinimized={true} />
    </div>
  )
}
