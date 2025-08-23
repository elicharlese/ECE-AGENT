'use client'

import { useState, useEffect } from 'react'
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable'
import { Button } from '@/components/ui/button'
import { EnhancedConversationList } from './enhanced-conversation-list'
import { ChatWindow } from './chat-window'
import { EnhancedAgentSidebar } from '../ai/enhanced-agent-sidebar'
import { MCPToolsPanel } from '../mcp/mcp-tools-panel'
// import { ProfilePopout } from '../user/profile-popout'
import { conversationService } from '@/services/conversation-service'
import { Menu, X, MessageSquare, Bot, Wrench } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from '@/hooks/use-toast'
import { useDensity } from '@/contexts/density-context'

interface ImessageLayoutProps {
  userId: string
}

export function ImessageLayout({ userId }: ImessageLayoutProps) {
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null)
  const [conversations, setConversations] = useState<any[]>([])
  const [rightPanelOpen, setRightPanelOpen] = useState(false)
  const [rightPanelTab, setRightPanelTab] = useState<'agents' | 'mcp'>('agents')
  const [profileOpen, setProfileOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [loading, setLoading] = useState(true)
  const [leftSize, setLeftSize] = useState<number>(24)
  const [leftCollapsed, setLeftCollapsed] = useState(false)
  const [conversationPanelSize, setConversationPanelSize] = useState<number>(24)
  const [showConversationList, setShowConversationList] = useState(true)
  const { density, setDensity } = useDensity()

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Load conversations
  useEffect(() => {
    const loadConversations = async () => {
      try {
        const data = await conversationService.getConversations()
        setConversations(data || [])
      } catch (error) {
        console.error('Failed to load conversations:', error)
        toast({
          title: 'Failed to load conversations',
          description: 'Please try again or check your connection.',
          variant: 'destructive',
        })
      } finally {
        setLoading(false)
      }
    }
    loadConversations()
  }, [])

  const handleStartDirectMessage = async (username: string) => {
    const name = username.trim()
    if (!name) {
      const err = new Error('Enter a username')
      toast({ title: 'Enter a username', description: 'Please type a username to start a DM.' })
      throw err
    }
    try {
      // const conversation = await dmService.startDirectMessageByUsername(name)
      // if (conversation) {
      //   setSelectedConversation(conversation.id)
      //   await loadConversations()
      // }
      // TODO: Implement direct message start functionality
      toast({ title: 'Feature coming soon', description: 'Direct messaging will be available soon' })
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to start chat'
      toast({ title: 'Could not start chat', description: message, variant: 'destructive' })
      throw (error instanceof Error ? error : new Error(message))
    }
  }

  return (
    <div className="flex h-screen bg-background">
      <div className="flex-1">
        <ResizablePanelGroup direction="horizontal" className="h-full">
          {/* Left Sidebar - Conversation List (collapsible) */}
          <ResizablePanel
            id="left"
            defaultSize={conversationPanelSize}
            minSize={15}
            maxSize={40}
            collapsible
            collapsedSize={4}
            onCollapse={() => setLeftCollapsed(true)}
            onExpand={() => setLeftCollapsed(false)}
            onResize={(size: number) => setConversationPanelSize(size)}
          >
            <EnhancedConversationList
              selectedConversationId={selectedConversation}
              onSelect={setSelectedConversation}
              onNewMessage={() => {}}
              onOpenProfile={() => setProfileOpen(true)}
              userId={userId}
              isMobile={isMobile}
              isCollapsed={conversationPanelSize <= 10}
              className="h-full"
            />
          </ResizablePanel>

          <ResizableHandle className="w-1 bg-border hover:bg-border/80 transition-colors cursor-col-resize" />

          {/* Middle - Chat Window */}
          <ResizablePanel defaultSize={rightPanelOpen ? 56 : 76}>
            {/* Toolbar: density selector */}
            <div className="px-4 py-2 border-b bg-background flex items-center justify-end gap-2">
              <label htmlFor="density-select-imessage" className="text-xs text-muted-foreground">Density</label>
              <select
                id="density-select-imessage"
                value={density}
                onChange={(e) => setDensity(e.target.value as 'compact' | 'comfortable' | 'airy')}
                className="px-2 py-1 text-sm border rounded-md bg-background"
              >
                <option value="compact">Compact</option>
                <option value="comfortable">Comfortable</option>
                <option value="airy">Airy</option>
              </select>
            </div>
            {selectedConversation ? (
              <ChatWindow
                conversationId={selectedConversation}
                onOpenAiTools={() => {
                  setRightPanelTab('agents')
                  setRightPanelOpen(true)
                }}
                onOpenMcpTools={() => {
                  setRightPanelTab('mcp')
                  setRightPanelOpen(true)
                }}
                isMobile={isMobile}
              />
            ) : (
              <div className="flex h-full items-center justify-center bg-card">
                <div className="text-center">
                  <div className="text-6xl mb-4">💬</div>
                  <h2 className="text-2xl font-semibold text-foreground mb-2">
                    Select a conversation
                  </h2>
                  <p className="text-muted-foreground">
                    Choose a chat from the list or start a new one
                  </p>
                </div>
              </div>
            )}
          </ResizablePanel>

          {/* Right Sidebar - AI & MCP Tools (resizable when open on desktop) */}
          {!isMobile && rightPanelOpen && (
            <>
              <ResizableHandle className="w-1 bg-gray-200 hover:bg-gray-300 transition-colors cursor-col-resize" />
              <ResizablePanel defaultSize={20}>
                {rightPanelTab === 'agents' ? (
                  <EnhancedAgentSidebar />
                ) : (
                  <MCPToolsPanel chatId={selectedConversation || ''} />
                )}
              </ResizablePanel>
            </>
          )}
        </ResizablePanelGroup>
      </div>

      {/* Collapsed Right Rail (desktop) */}
      {!isMobile && !rightPanelOpen && (
        <div className="w-10 bg-card border-l flex flex-col items-center py-4 space-y-3">
          <button
            onClick={() => {
              setRightPanelTab('agents')
              setRightPanelOpen(true)
            }}
            className="p-2 hover:bg-accent rounded-lg transition-colors"
            title="AI Agents"
            aria-label="Open AI Agents"
          >
            <Bot className="w-5 h-5 text-muted-foreground" />
          </button>
          <button
            onClick={() => {
              setRightPanelTab('mcp')
              setRightPanelOpen(true)
            }}
            className="p-2 hover:bg-accent rounded-lg transition-colors"
            title="MCP Tools"
            aria-label="Open MCP Tools"
          >
            <Wrench className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>
      )}

      {/* Profile Popout - TODO: Implement */}

      {/* Mobile Drawer for Right Panel */}
      {isMobile && rightPanelOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={() => setRightPanelOpen(false)}
          />
          <div className="absolute right-0 top-0 bottom-0 w-80 bg-card shadow-xl">
            {rightPanelTab === 'agents' ? (
              <EnhancedAgentSidebar />
            ) : (
              <MCPToolsPanel chatId={selectedConversation || ''} />
            )}
          </div>
        </div>
      )}
    </div>
  )
}
