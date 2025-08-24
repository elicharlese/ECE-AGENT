"use client"

import { useState, useEffect } from "react"
import { useUser } from "@/contexts/user-context"
import { LoginForm } from "@/components/login-form"
import { ChatSidebar } from "@/components/chat/chat-sidebar"
import { ChatWindow } from "@/components/chat/chat-window"
import { AgentSidebar } from "@/components/chat/agent-sidebar"
import { MiniChatWidget } from "@/components/chat/MiniChatWidget"
import { useIsMobile } from "@/hooks/use-mobile"
import { useResponsiveLayout } from "@/hooks/use-responsive-layout"
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable"

export default function ChatApp() {
  const { user, isLoading } = useUser()
  
  // Show login form if user is not authenticated
  if (!user && !isLoading) {
    return <LoginForm />
  }
  
  // Show loading state while checking auth status
  if (isLoading) {
    return (
      <div className="flex min-h-full items-center justify-center">
        <div className="text-lg">Loading...</div>
        {/* Portaled Quick Chat available globally */}
      <MiniChatWidget title="Quick Chat" initialMinimized={true} />
    </div>
    )
  }
  
  // Show chat app if user is authenticated
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

  // Auto-collapse sidebars based on screen size
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

  // Dynamic sidebar widths based on screen size
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

  // Note: Right sidebar is config-only; Quick Chat handles ad-hoc messaging.

  return (
    <div className="h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden">
      {/* Mobile & Tablet Portrait: Non-resizable layout */}
      {isMobile || (screenSize === "tablet" && orientation === "portrait") ? (
        <div className="flex h-full">
          {/* Left Sidebar - Chat List */}
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

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col min-w-0">
            <ChatWindow
              chatId={selectedChatId}
              onToggleSidebar={() => setLeftSidebarCollapsed(!leftSidebarCollapsed)}
              sidebarCollapsed={leftSidebarCollapsed}
            />
          </div>
        </div>
      ) : (
        /* Desktop & Tablet Landscape: Resizable 3-panel layout */
        <ResizablePanelGroup direction="horizontal" className="h-full">
          {/* Left Panel - Chat List */}
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

          {/* Center Panel - Main Chat */}
          <ResizablePanel defaultSize={50} minSize={30}>
            <ChatWindow
              chatId={selectedChatId}
              onToggleSidebar={() => setLeftSidebarCollapsed(!leftSidebarCollapsed)}
              sidebarCollapsed={leftSidebarCollapsed}
            />
          </ResizablePanel>

          {/* Right Panel - Agent Sidebar & Chat */}
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

      {/* Mobile Agent Sidebar */}
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

      {/* Tablet Portrait Agent Sidebar */}
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

      {/* Mobile overlays */}
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

      {/* Tablet Portrait overlays */}
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

      {/* Portaled Quick Chat available globally */}
      <MiniChatWidget title="Quick Chat" initialMinimized={true} />
    </div>
  )
}
