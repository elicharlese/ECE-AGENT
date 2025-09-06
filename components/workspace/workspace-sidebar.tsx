"use client"

import { useState, useCallback, useEffect, useMemo } from "react"
import {
  Button,
  ScrollArea,
  Select,
  Tabs
} from '@/libs/design-system';
import { Badge } from '@/libs/design-system'
import { TabsContent, TabsList, TabsTrigger } from '@/libs/design-system'
// TODO: Replace deprecated components: Tabs
// 
// TODO: Replace deprecated components: Tabs
// import { Tabs } from '@/components/ui/tabs'

// TODO: Replace deprecated components: ScrollArea
// 
// TODO: Replace deprecated components: ScrollArea
// import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Code, 
  Image as ImageIcon, 
  Music, 
  FileText, 
  Play, 
  Pause, 
  Square,
  Download,
  Share2,
  Copy,
  Trash2,
  Eye,
  Bot,
  Settings,
  Terminal,
  Zap,
  Palette,
  Camera,
  Mic,
  Users,
  WifiOff
} from "lucide-react"
import { cn } from "@/lib/utils"
import { trackEvent } from "@/lib/analytics"
import { MCPToolsPanel } from "@/components/mcp/mcp-tools-panel"
import { AIPanelSidebar } from "@/components/ai/ai-panel-sidebar"
import { messageService, subscribeToMessages } from "@/services/message-service"
import { profileService, getWorkspaceSettings, setWorkspaceSettings } from "@/services/profile-service"
import { mcpService } from "@/services/mcp-service"

interface WorkspaceItem {
  id: string
  type: 'message' | 'code' | 'image' | 'audio' | 'video' | 'document' | 'tool_execution'
  content: any
  timestamp: Date
  author: string
  status?: 'generating' | 'completed' | 'error'
  metadata?: Record<string, any>
}

interface WorkspaceSidebarProps {
  panelState: "expanded" | "minimized" | "collapsed"
  onSetPanelState: (state: "expanded" | "minimized" | "collapsed") => void
  selectedAgentId?: string
  chatId?: string
  onSelectAgent?: (agentId: string) => void
  workspaceItems?: WorkspaceItem[]
  onExecuteTool?: (toolType: string) => void
  onGenerateMedia?: (type: string) => void
  activeParticipants?: number
  isConnected?: boolean
}

export function WorkspaceSidebar({
  panelState,
  onSetPanelState,
  selectedAgentId,
  chatId,
  onSelectAgent,
  workspaceItems = [],
  onExecuteTool,
  onGenerateMedia,
  activeParticipants = 0,
  isConnected = true
}: WorkspaceSidebarProps) {
  const [activeTab, setActiveTab] = useState("workspace")
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())

  // Derived workspace items from real Supabase-backed messages for this chat
  const [dynamicWorkspaceItems, setDynamicWorkspaceItems] = useState<WorkspaceItem[]>([])
  // Cache for user profile display enrichment
  const [profileNames, setProfileNames] = useState<Record<string, { name: string; avatar_url?: string | null }>>({})

  // Local, per-chat settings (persisted). TODO: move to profile-backed prefs when schema supports it
  const [settings, setSettings] = useState({
    autoSaveItems: true,
    showItemPreviews: false,
    enableRTC: true,
    showTypingIndicators: true,
    enableReactions: false,
    autoScroll: true,
  })

  // Load settings from localStorage and profile when chatId changes
  useEffect(() => {
    if (typeof window === 'undefined') return
    const key = `ws_settings_${chatId || 'global'}`
    try {
      const raw = localStorage.getItem(key)
      if (raw) {
        const data = JSON.parse(raw)
        setSettings((prev) => ({ ...prev, ...data }))
      }
    } catch (e) {
      console.warn('Failed to load workspace settings', e)
    }
    // Try loading from profile metadata (non-blocking)
    ;(async () => {
      try {
        const remote = await getWorkspaceSettings(chatId)
        if (remote && Object.keys(remote).length > 0) {
          setSettings((prev) => ({ ...prev, ...remote }))
          // keep localStorage in sync for quick reloads
          if (typeof window !== 'undefined') {
            localStorage.setItem(key, JSON.stringify({ ...remote }))
          }
        }
      } catch (err) {
        // Not authenticated or network error; ignore
      }
    })()
  }, [chatId])

  const updateSetting = useCallback((key: keyof typeof settings, value: boolean) => {
    setSettings((prev) => {
      const next = { ...prev, [key]: value }
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(`ws_settings_${chatId || 'global'}`, JSON.stringify(next))
        } catch (_) {
          // ignore storage errors
        }
      }
      void trackEvent({ name: 'workspace_setting_toggled', properties: { key, value, chatId } })
      // Persist to profile metadata if available
      ;(async () => {
        try {
          await setWorkspaceSettings(chatId, next)
        } catch (_) {
          // ignore if not authenticated or fails
        }
      })()
      return next
    })
  }, [chatId])

  // Helper to map API Message to WorkspaceItem
  const mapApiMessageToItem = (msg: any): WorkspaceItem => ({
    id: msg.id,
    type: 'message',
    content: msg.content,
    timestamp: new Date(msg.created_at || msg.timestamp || Date.now()),
    author: (msg.user && msg.user.name) || (msg.is_ai ? 'Assistant' : profileNames[msg.user_id]?.name || msg.user_id || 'User'),
    metadata: {
      role: msg.role,
      is_ai: msg.is_ai,
      user_id: msg.user_id,
      type: msg.type,
      raw: msg,
    },
  })

  // Helper to map DB insert payload to WorkspaceItem
  const mapDbMessageToItem = (dbMsg: any): WorkspaceItem => ({
    id: dbMsg.id,
    type: 'message',
    content: dbMsg.content,
    timestamp: new Date(dbMsg.timestamp || Date.now()),
    author: dbMsg.role === 'assistant' ? 'Assistant' : (profileNames[dbMsg.user_id]?.name || dbMsg.user_id || 'User'),
    metadata: {
      role: dbMsg.role,
      is_ai: dbMsg.role === 'assistant',
      user_id: dbMsg.user_id,
      raw: dbMsg,
    },
  })

  // Fetch initial messages and subscribe for realtime inserts
  useEffect(() => {
    let unsubscribe: (() => void) | undefined
    let isMounted = true

    async function load() {
      if (!chatId) {
        setDynamicWorkspaceItems([])
        return
      }
      const msgs = await messageService.getMessages(chatId)
      if (!isMounted) return
      const items = (msgs || []).map(mapApiMessageToItem)
      setDynamicWorkspaceItems(items)

      // Enrich authors by fetching missing profiles (simple caching)
      const missing = Array.from(new Set((msgs || [])
        .map((m: any) => m.user_id)
        .filter((id: string | undefined) => id && !profileNames[id!]) as string[]))
      if (missing.length > 0) {
        for (const uid of missing) {
          try {
            const prof = await profileService.getProfile(uid)
            if (prof) {
              setProfileNames((prev) => ({ ...prev, [uid]: { name: prof.full_name || prof.username, avatar_url: prof.avatar_url } }))
            }
          } catch (_) {
            // ignore
          }
        }
      }

      // Subscribe to realtime inserts
      unsubscribe = subscribeToMessages(chatId, (dbMsg) => {
        const item = mapDbMessageToItem(dbMsg)
        setDynamicWorkspaceItems((prev) => {
          if (prev.some((p) => p.id === item.id)) return prev
          return [...prev, item]
        })
        // opportunistically fetch profile for new user
        const uid = (dbMsg as any)?.user_id
        if (uid && !profileNames[uid]) {
          ;(async () => {
            try {
              const prof = await profileService.getProfile(uid)
              if (prof) setProfileNames((prev) => ({ ...prev, [uid]: { name: prof.full_name || prof.username, avatar_url: prof.avatar_url } }))
            } catch (_) {}
          })()
        }
      })
    }

    void load()
    return () => {
      isMounted = false
      if (unsubscribe) unsubscribe()
    }
  }, [chatId])

  // Subscribe to MCP SSE events and add as workspace tool_execution items
  useEffect(() => {
    const handler = (eventText: string) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
      const status = mcpService.getMcpStatus()
      const item: WorkspaceItem = {
        id,
        type: 'tool_execution',
        content: eventText,
        timestamp: new Date(),
        author: 'MCP',
        metadata: { source: 'mcp', sessionId: status.sessionId },
      }
      setDynamicWorkspaceItems((prev) => [...prev, item])
    }
    mcpService.onMcpEvent(handler)
    return () => {
      mcpService.offMcpEvent(handler)
    }
  }, [])

  // Merge prop-provided items with dynamic items from Supabase
  const allItems = useMemo(() => {
    const merged = [...dynamicWorkspaceItems, ...(workspaceItems || [])]
    return merged.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
  }, [dynamicWorkspaceItems, workspaceItems])

  const handleItemAction = useCallback((action: string, itemId?: string) => {
    trackEvent({ name: 'workspace_item_action', properties: { action, itemId } })
    
    switch (action) {
      case 'run':
        // Handle run action
        break
      case 'view':
        // Handle view action
        break
      case 'download':
        // Handle download action
        break
      case 'copy':
        // Handle copy action
        break
      case 'share':
        // Handle share action
        break
      case 'delete':
        // Handle delete action
        break
    }
  }, [])

  const handleToolExecution = useCallback((toolType: string) => {
    onExecuteTool?.(toolType)
    trackEvent({ name: 'workspace_tool_execute', properties: { toolType } })
  }, [onExecuteTool])

  const handleMediaGeneration = useCallback((type: string) => {
    onGenerateMedia?.(type)
    trackEvent({ name: 'workspace_media_generate', properties: { type } })
  }, [onGenerateMedia])

  if (panelState === "collapsed") {
    return null
  }

  const isMinimized = panelState === "minimized"

  return (
    <div className="flex flex-col h-full min-h-0 bg-background">
      {isMinimized ? (
        <div className="flex flex-col items-center py-4 gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setActiveTab("workspace")}
            className={cn("p-2", activeTab === "workspace" && "bg-accent")}
            aria-label="Workspace"
            title="Workspace"
          >
            <Zap className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setActiveTab("ai")}
            className={cn("p-2", activeTab === "ai" && "bg-accent")}
            aria-label="AI Models"
            title="AI Models"
          >
            <Bot className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setActiveTab("mcp")}
            className={cn("p-2", activeTab === "mcp" && "bg-accent")}
            aria-label="MCP"
            title="MCP"
          >
            <Terminal className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setActiveTab("settings")}
            className={cn("p-2", activeTab === "settings" && "bg-accent")}
            aria-label="Settings"
            title="Settings"
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
          <div className="sticky top-0 z-10 bg-background/90 backdrop-blur px-3 pt-4 sm:pt-5 pb-2 sm:pb-3 mb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  <Users className="h-3 w-3 mr-1" />
                  {activeParticipants} active
                </Badge>
                {!isConnected && (
                  <Badge variant="destructive" className="text-xs">
                    <WifiOff className="h-3 w-3 mr-1" />
                    Disconnected
                  </Badge>
                )}
              </div>
            </div>
            <TabsList className="mt-2 sm:mt-3 flex w-full items-center justify-start gap-1 sm:gap-2 rounded-2xl bg-muted p-1.5 sm:p-2 ring-1 ring-border overflow-x-auto hide-scrollbar whitespace-nowrap snap-x snap-mandatory">
              <TabsTrigger value="workspace" className="flex-none text-xs sm:text-sm h-9 sm:h-10 rounded-xl px-3 sm:px-4 transition-colors motion-reduce:transition-none bg-transparent hover:bg-muted/60 data-[state=active]:bg-background data-[state=active]:shadow-sm text-muted-foreground data-[state=active]:text-foreground whitespace-nowrap snap-start" aria-label="Workspace" title="Workspace">
                <Zap className="h-3 w-3 mr-1" />
                <span className="hidden sm:inline">Workspace</span>
              </TabsTrigger>
              <TabsTrigger value="ai" className="flex-none text-xs sm:text-sm h-9 sm:h-10 rounded-xl px-3 sm:px-4 transition-colors motion-reduce:transition-none bg-transparent hover:bg-muted/60 data-[state=active]:bg-background data-[state=active]:shadow-sm text-muted-foreground data-[state=active]:text-foreground whitespace-nowrap snap-start" aria-label="AI Models" title="AI Models">
                <Bot className="h-3 w-3 mr-1" />
                <span className="hidden sm:inline">AI Models</span>
              </TabsTrigger>
              <TabsTrigger value="mcp" className="flex-none text-xs sm:text-sm h-9 sm:h-10 rounded-xl px-3 sm:px-4 transition-colors motion-reduce:transition-none bg-transparent hover:bg-muted/60 data-[state=active]:bg-background data-[state=active]:shadow-sm text-muted-foreground data-[state=active]:text-foreground whitespace-nowrap snap-start" aria-label="MCP" title="MCP">
                <Terminal className="h-3 w-3 mr-1" />
                <span className="hidden sm:inline">MCP</span>
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex-none text-xs sm:text-sm h-9 sm:h-10 rounded-xl px-3 sm:px-4 transition-colors motion-reduce:transition-none bg-transparent hover:bg-muted/60 data-[state=active]:bg-background data-[state=active]:shadow-sm text-muted-foreground data-[state=active]:text-foreground whitespace-nowrap snap-start" aria-label="Settings" title="Settings">
                <Settings className="h-3 w-3 mr-1" />
                <span className="hidden sm:inline">Settings</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="workspace" className="flex-1 flex flex-col m-0 min-h-0">
            <div className="px-2 sm:px-3 pt-1 pb-2 sm:pb-3">
              <h3 className="font-medium text-sm mb-2 sm:mb-3">Quick Tools</h3>
              <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/40 p-2 sm:p-3">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToolExecution('code_interpreter')}
                    className="text-xs justify-center"
                  >
                    <Code className="h-3 w-3 mr-1" />
                    Code
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleMediaGeneration('image')}
                    className="text-xs justify-center"
                  >
                    <Camera className="h-3 w-3 mr-1" />
                    Image
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleMediaGeneration('audio')}
                    className="text-xs justify-center"
                  >
                    <Mic className="h-3 w-3 mr-1" />
                    Audio
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToolExecution('web_search')}
                    className="text-xs justify-center"
                  >
                    <FileText className="h-3 w-3 mr-1" />
                    Search
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
              <div className="p-2 sm:p-3">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-sm">Workspace Items</h3>
                  <Badge variant="secondary" className="text-xs">
                    {allItems.length}
                  </Badge>
                </div>
                {selectedItems.size > 0 && (
                  <div className="flex gap-1 mb-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleItemAction('copy')}
                      className="text-xs px-2 py-1"
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleItemAction('share')}
                      className="text-xs px-2 py-1"
                    >
                      <Share2 className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleItemAction('delete')}
                      className="text-xs px-2 py-1 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>

              <ScrollArea className="flex-1 pb-24 sm:pb-8 pt-0">
                <div className="p-2 sm:p-3 space-y-2">
                  {allItems.length === 0 ? (
                    <div className="text-center py-6 sm:py-8 text-sm text-gray-500 dark:text-gray-400">
                      <Zap className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No workspace items yet</p>
                      <p className="text-xs mt-1">Use tools and generate media to see items here</p>
                    </div>
                  ) : (
                    allItems.map((item) => (
                      <WorkspaceItemCard
                        key={item.id}
                        item={item}
                        isSelected={selectedItems.has(item.id)}
                        onSelect={(selected) => {
                          const newSelected = new Set(selectedItems)
                          if (selected) {
                            newSelected.add(item.id)
                          } else {
                            newSelected.delete(item.id)
                          }
                          setSelectedItems(newSelected)
                        }}
                        onAction={handleItemAction}
                      />
                    ))
                  )}
                </div>
              </ScrollArea>
            </div>
          </TabsContent>

          <TabsContent value="ai" className="flex-1 flex flex-col m-0 min-h-0">
            <div className="flex-1">
              <AIPanelSidebar
                chatId={chatId || ""}
                isCollapsed={false}
                onToggle={() => onSetPanelState("minimized")}
              />
            </div>
          </TabsContent>

          <TabsContent value="mcp" className="flex-1 flex flex-col m-0 min-h-0">
            <div className="flex-1 p-2 sm:p-3 pt-3">
              <MCPToolsPanel chatId={chatId || ""} />
            </div>
          </TabsContent>

          <TabsContent value="settings" className="flex-1 flex flex-col m-0 min-h-0">
            <ScrollArea className="flex-1 pb-24 sm:pb-8 pt-2">
              <div className="p-2 sm:p-3 gap-4">
                <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/40 p-2 sm:p-3">
                  <h3 className="font-medium text-sm mb-2 sm:mb-3">Workspace Settings</h3>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 text-sm">
                      <input
                        type="checkbox"
                        className="rounded"
                        aria-label="Auto-save workspace items"
                        checked={settings.autoSaveItems}
                        onChange={(e) => updateSetting('autoSaveItems', e.target.checked)}
                      />
                      <span>Auto-save workspace items</span>
                    </label>
                    <label className="flex items-center space-x-2 text-sm">
                      <input
                        type="checkbox"
                        className="rounded"
                        aria-label="Show item previews"
                        checked={settings.showItemPreviews}
                        onChange={(e) => updateSetting('showItemPreviews', e.target.checked)}
                      />
                      <span>Show item previews</span>
                    </label>
                    <label className="flex items-center space-x-2 text-sm">
                      <input
                        type="checkbox"
                        className="rounded"
                        aria-label="Enable real-time collaboration"
                        checked={settings.enableRTC}
                        onChange={(e) => updateSetting('enableRTC', e.target.checked)}
                      />
                      <span>Enable real-time collaboration</span>
                    </label>
                  </div>
                </div>

                <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/40 p-2 sm:p-3">
                  <h3 className="font-medium text-sm mb-2 sm:mb-3">Chat Settings</h3>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 text-sm">
                      <input
                        type="checkbox"
                        className="rounded"
                        aria-label="Show typing indicators"
                        checked={settings.showTypingIndicators}
                        onChange={(e) => updateSetting('showTypingIndicators', e.target.checked)}
                      />
                      <span>Show typing indicators</span>
                    </label>
                    <label className="flex items-center space-x-2 text-sm">
                      <input
                        type="checkbox"
                        className="rounded"
                        aria-label="Enable message reactions"
                        checked={settings.enableReactions}
                        onChange={(e) => updateSetting('enableReactions', e.target.checked)}
                      />
                      <span>Enable message reactions</span>
                    </label>
                    <label className="flex items-center space-x-2 text-sm">
                      <input
                        type="checkbox"
                        className="rounded"
                        aria-label="Auto-scroll to new messages"
                        checked={settings.autoScroll}
                        onChange={(e) => updateSetting('autoScroll', e.target.checked)}
                      />
                      <span>Auto-scroll to new messages</span>
                    </label>
                  </div>
                </div>
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}

interface WorkspaceItemCardProps {
  item: WorkspaceItem
  isSelected: boolean
  onSelect: (selected: boolean) => void
  onAction: (action: string, itemId: string) => void
}

function WorkspaceItemCard({ item, isSelected, onSelect, onAction }: WorkspaceItemCardProps) {
  const getItemIcon = () => {
    switch (item.type) {
      case 'code':
        return <Code className="h-4 w-4" />
      case 'image':
        return <ImageIcon className="h-4 w-4" />
      case 'audio':
        return <Music className="h-4 w-4" />
      case 'video':
        return <Play className="h-4 w-4" />
      case 'document':
        return <FileText className="h-4 w-4" />
      case 'tool_execution':
        return <Zap className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const getStatusColor = () => {
    switch (item.status) {
      case 'generating':
        return 'text-blue-600 dark:text-blue-400'
      case 'completed':
        return 'text-green-600 dark:text-green-400'
      case 'error':
        return 'text-red-600 dark:text-red-400'
      default:
        return 'text-gray-600 dark:text-gray-400'
    }
  }

  return (
    <div className={cn(
              "p-2 sm:p-3 border border-gray-200 dark:border-gray-800 rounded-xl bg-white dark:bg-gray-900/40 cursor-pointer transition-colors hover:bg-accent/40",
              isSelected && "bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-600"
            )}>
      <div className="flex items-start space-x-2">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={(e) => onSelect(e.target.checked)}
          className="mt-1 rounded"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1">
            <span className={getStatusColor()}>
              {getItemIcon()}
            </span>
            <span className="text-xs font-medium truncate">
              {item.type.replace('_', ' ').toUpperCase()}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
            {typeof item.content === 'string' ? item.content : JSON.stringify(item.content).slice(0, 100)}
          </p>
          <div className="flex items-center space-x-1 mt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onAction('view', item.id)}
              className="text-xs px-1 py-0.5 h-auto"
            >
              <Eye className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onAction('download', item.id)}
              className="text-xs px-1 py-0.5 h-auto"
            >
              <Download className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
