"use client"

import { useState, useRef, useEffect, useCallback } from "react"
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
const WorkspaceSidebar = dynamic(() => import("@/components/workspace/workspace-sidebar").then(m => m.WorkspaceSidebar), {
  ssr: false,
  loading: () => <div className="p-4 text-sm text-gray-500">Loading workspace…</div>,
})
import { useIsMobile } from "@/hooks/use-mobile"
import { useResponsiveLayout } from "@/hooks/use-responsive-layout"
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/libs/design-system'
import { Menu, X, ChevronLeft, ChevronRight } from "lucide-react"
import type { ImperativePanelHandle } from "react-resizable-panels"
import { EmptyChatState } from "@/components/chat/EmptyChatState"
import { useConversations } from "@/hooks/use-conversations"
import { useHotkeys } from "@/hooks/use-hotkeys"
import { ErrorBoundary, ChatErrorBoundary } from "@/components/ErrorBoundary"
import { AuthLoadingState } from "@/components/LoadingStates"
import { InviteUsersDialog } from "@/components/chat/invite-users-dialog"
import { profileService } from "@/services/profile-service"
import { supabase } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { HamburgerMenu } from "@/components/ui/hamburger-menu"

export function ChatApp() {
  const { user, isLoading } = useUser()

  if (!user && !isLoading) {
    return (
      <div className="h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="w-full max-w-md mx-auto px-4">
          <LoginForm />
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <ErrorBoundary>
          <AuthLoadingState />
        </ErrorBoundary>
      </div>
    )
  }

  return <AuthenticatedChatApp />
}

function AuthenticatedChatApp() {
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null)
  const [selectedAgentId, setSelectedAgentId] = useState<string>()
  const [leftPanelState, setLeftPanelState] = useState<"expanded" | "minimized" | "collapsed">("expanded")
  const [rightPanelState, setRightPanelState] = useState<"expanded" | "minimized" | "collapsed">("expanded")
  const [showWorkspaceSidebar, setShowWorkspaceSidebar] = useState(true)
  const leftPanelRef = useRef<ImperativePanelHandle | null>(null)
  const rightPanelRef = useRef<ImperativePanelHandle | null>(null)
  const isMobile = useIsMobile()
  const { screenSize, orientation, canShowDualSidebars, shouldCollapseSidebars } = useResponsiveLayout()
  const searchParams = useSearchParams()
  const isPopout = (searchParams.get("popout") || "") === "1"
  const { conversations, createConversationWithParticipants } = useConversations()
  const [isInviteOpen, setIsInviteOpen] = useState(false)
  const [measuredLeft, setMeasuredLeft] = useState<number | null>(null)
  const [measuredRight, setMeasuredRight] = useState<number | null>(null)

  useEffect(() => {
    if (shouldCollapseSidebars) {
      setLeftPanelState("collapsed")
      setRightPanelState("collapsed")
    } else if (canShowDualSidebars) {
      setLeftPanelState("expanded")
      setRightPanelState("expanded")
    }
  }, [shouldCollapseSidebars, canShowDualSidebars])

  const handleSelectAgent = useCallback((agentId: string) => {
    setSelectedAgentId(agentId)
    if (isMobile || screenSize === "tablet") {
      setRightPanelState("collapsed")
    }
  }, [])

  const handleToggleWorkspace = useCallback(() => {
    setShowWorkspaceSidebar(prev => !prev)
    if (!showWorkspaceSidebar && rightPanelState === "collapsed") {
      setRightPanelState("expanded")
    }
  }, [showWorkspaceSidebar, rightPanelState])

  const handleSelectChat = useCallback((chatId: string) => {
    setSelectedChatId(chatId)
    if (isMobile) {
      setLeftPanelState("collapsed")
    }
  }, [isMobile])

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

  // Measure actual rendered widths of sidebars (including shadows/borders)
  useEffect(() => {
    const measure = () => {
      const leftEl = document.querySelector<HTMLElement>('.app-left-sidebar')
      const rightEl = document.querySelector<HTMLElement>('.app-right-sidebar')
      const lw = leftEl && leftEl.offsetParent !== null ? leftEl.getBoundingClientRect().width : 0
      const rw = rightEl && rightEl.offsetParent !== null ? rightEl.getBoundingClientRect().width : 0
      setMeasuredLeft(lw)
      setMeasuredRight(rw)
    }
    measure()
    const ro = new ResizeObserver(measure)
    const leftEl = document.querySelector<HTMLElement>('.app-left-sidebar')
    const rightEl = document.querySelector<HTMLElement>('.app-right-sidebar')
    leftEl && ro.observe(leftEl)
    rightEl && ro.observe(rightEl)
    window.addEventListener('resize', measure)
    return () => {
      window.removeEventListener('resize', measure)
      ro.disconnect()
    }
  }, [leftPanelState, rightPanelState, showWorkspaceSidebar])

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

  // Sidebar width helpers (Tailwind widths: minimized ~ 64px, expanded ~ 320px)
  const getLeftSidebarWidth = () => {
    if (leftPanelState === "collapsed") return "w-0"
    if (leftPanelState === "minimized") return "w-16"
    return "w-80"
  }

  const getRightSidebarWidth = () => {
    if (rightPanelState === "collapsed") return "w-0"
    if (rightPanelState === "minimized") return "w-16"
    return "w-80"
  }

  const getLeftSidebarPixels = () => {
    if (leftPanelState === "collapsed") return 0
    if (leftPanelState === "minimized") return 64
    return 320
  }

  const getRightSidebarPixels = () => {
    if (!showWorkspaceSidebar) return 0
    if (rightPanelState === "collapsed") return 0
    if (rightPanelState === "minimized") return 64
    return 320
  }

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
      {/* Left Sidebar - Slides from left edge */}
      <div
        className={`
          app-left-sidebar
          fixed inset-y-0 left-0 z-40
          transition-transform duration-300 ease-in-out
          ${leftPanelState === "collapsed" ? "-translate-x-full" : "translate-x-0"}
          ${getLeftSidebarWidth()}
          bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700
          shadow-lg
        `}
      >
        <ChatSidebar
          selectedChatId={selectedChatId || ""}
          onSelectChat={handleSelectChat}
          panelState={leftPanelState}
          onSetPanelState={setLeftPanelState}
          onOpenInviteNewChat={() => setIsInviteOpen(true)}
          onToggleWorkspace={handleToggleWorkspace}
        />
        
        {/* Left Sidebar Paddle - only when sidebar is visible */}
        {leftPanelState !== "collapsed" && (
          <div className="absolute top-1/2 -translate-y-1/2 -right-5 z-50">
            <HamburgerMenu
              panelState={leftPanelState}
              onToggle={cycleLeft}
              side="left"
            />
          </div>
        )}
      </div>

      {/* Left Paddle when sidebar is collapsed */}
      {leftPanelState === "collapsed" && (
        <div className="fixed top-1/2 -translate-y-1/2 left-2 z-50">
          <HamburgerMenu
            panelState={leftPanelState}
            onToggle={cycleLeft}
            side="left"
          />
        </div>
      )}

      {/* Right Sidebar - Slides from right edge */}
      {showWorkspaceSidebar && (
        <div
          className={`
            app-right-sidebar
            fixed inset-y-0 right-0 z-40
            transition-transform duration-300 ease-in-out
            ${rightPanelState === "collapsed" ? "translate-x-full" : "translate-x-0"}
            ${getRightSidebarWidth()}
            bg-white dark:bg-[#1f2937] border-l border-gray-200 dark:border-gray-700
            shadow-lg
          `}
        >
          <WorkspaceSidebar
            selectedAgentId={selectedAgentId}
            onSelectAgent={handleSelectAgent}
            panelState={rightPanelState}
            onSetPanelState={setRightPanelState}
            chatId={selectedChatId || ""}
            activeParticipants={1}
            isConnected={true}
          />
          
          {/* Right Sidebar Paddle - only when sidebar is visible */}
          {rightPanelState !== "collapsed" && (
            <div className="absolute top-1/2 -translate-y-1/2 -left-5 z-50">
              <HamburgerMenu
                panelState={rightPanelState}
                onToggle={cycleRight}
                side="right"
              />
            </div>
          )}
        </div>
      )}

      {/* Right Paddle when sidebar is collapsed */}
      {rightPanelState === "collapsed" && showWorkspaceSidebar && (
        <div className="fixed top-1/2 -translate-y-1/2 right-2 z-50">
          <HamburgerMenu
            panelState={rightPanelState}
            onToggle={cycleRight}
            side="right"
          />
        </div>
      )}

      {/* Main Chat Area - Fixed inset between sidebars for perfect centering */}
      {(() => {
        // Respect panel state over measurements so collapsed sidebars don't reserve width
        const leftPx = leftPanelState === "collapsed"
          ? 0
          : (measuredLeft ?? getLeftSidebarPixels())
        const rightPx = (!showWorkspaceSidebar || rightPanelState === "collapsed")
          ? 0
          : (measuredRight ?? getRightSidebarPixels())
        const leftPaddle = leftPanelState !== "collapsed" ? 20 : 0
        const rightPaddle = (showWorkspaceSidebar && rightPanelState !== "collapsed") ? 20 : 0
        const insetLeft = leftPx + leftPaddle
        const insetRight = rightPx + rightPaddle
        return (
          <div
            className="fixed inset-y-0 transition-[left,right] duration-300 ease-in-out"
            style={{ left: insetLeft, right: insetRight }}
          >
            <div className="h-full w-full">
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
                  onStartNewChat={() => {
                    setIsInviteOpen(true)
                  }}
                />
              )}
            </div>
          </div>
        )
      })()}
      

      {/* Overlay for mobile when sidebars are open */}
      {(isMobile || (screenSize === "tablet" && orientation === "portrait")) && 
       (leftPanelState === "expanded" || rightPanelState === "expanded") && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => {
            setLeftPanelState("collapsed")
            setRightPanelState("collapsed")
          }}
          style={{ touchAction: "none" }}
        />
      )}


      {/* Invite dialog for creating a new conversation */}
      <InviteUsersDialog
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
        // No chatId: this is for creating a brand new chat
        onInviteUsers={async (users) => {
          // Resolve identifiers to user IDs
          const resolvedIds: string[] = []
          for (const u of users as Array<{ identifier: string; type: "email" | "username" | "wallet" }>) {
            try {
              if (u.type === "wallet") {
                const prof = await profileService.getProfileByWalletAddress(u.identifier)
                if (prof?.user_id) resolvedIds.push(prof.user_id)
              } else {
                const prof = await profileService.getProfileByIdentifier(u.identifier)
                if (prof?.user_id) resolvedIds.push(prof.user_id)
              }
            } catch {/* ignore individual resolution failures */}
          }
          // Deduplicate and exclude self
          const { data: auth } = await supabase.auth.getUser()
          const selfId = auth?.user?.id
          const participantIds = Array.from(new Set(resolvedIds)).filter((id) => !!id && id !== selfId)
          if (participantIds.length === 0) {
            throw new Error("No valid users to invite")
          }
          const conv = await createConversationWithParticipants(
            "New Chat",
            participantIds,
            selectedAgentId
          )
          setSelectedChatId(conv.id)
          if (isMobile) setLeftPanelState("collapsed")
          setIsInviteOpen(false)
        }}
      />
    </div>
  )
}
