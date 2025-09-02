"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  Code, 
  Image, 
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
  Zap,
  Palette,
  Camera,
  Mic,
  Users,
  WifiOff
} from "lucide-react"
import { cn } from "@/lib/utils"
import { trackEvent } from "@/lib/analytics"

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
  onSelectAgent,
  workspaceItems = [],
  onExecuteTool,
  onGenerateMedia,
  activeParticipants = 0,
  isConnected = true
}: WorkspaceSidebarProps) {
  const [activeTab, setActiveTab] = useState("workspace")
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())

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
    <div className="h-full bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 flex flex-col">
      {isMinimized ? (
        <div className="flex flex-col items-center py-4 space-y-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setActiveTab("workspace")}
            className={cn("p-2", activeTab === "workspace" && "bg-accent")}
          >
            <Zap className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setActiveTab("ai")}
            className={cn("p-2", activeTab === "ai" && "bg-accent")}
          >
            <Bot className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setActiveTab("settings")}
            className={cn("p-2", activeTab === "settings" && "bg-accent")}
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <div className="border-b border-gray-200 dark:border-gray-700 p-3">
            <div className="flex items-center justify-between mb-3">
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
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="workspace" className="text-xs">
                <Zap className="h-3 w-3 mr-1" />
                Workspace
              </TabsTrigger>
              <TabsTrigger value="ai" className="text-xs">
                <Bot className="h-3 w-3 mr-1" />
                AI Models
              </TabsTrigger>
              <TabsTrigger value="settings" className="text-xs">
                <Settings className="h-3 w-3 mr-1" />
                Settings
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="workspace" className="flex-1 flex flex-col m-0">
            <div className="p-3 border-b border-gray-200 dark:border-gray-700">
              <h3 className="font-medium text-sm mb-2">Quick Tools</h3>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleToolExecution('code_interpreter')}
                  className="text-xs"
                >
                  <Code className="h-3 w-3 mr-1" />
                  Code
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleMediaGeneration('image')}
                  className="text-xs"
                >
                  <Camera className="h-3 w-3 mr-1" />
                  Image
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleMediaGeneration('audio')}
                  className="text-xs"
                >
                  <Mic className="h-3 w-3 mr-1" />
                  Audio
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleToolExecution('web_search')}
                  className="text-xs"
                >
                  <FileText className="h-3 w-3 mr-1" />
                  Search
                </Button>
              </div>
            </div>

            <div className="flex-1 flex flex-col">
              <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-sm">Workspace Items</h3>
                  <Badge variant="secondary" className="text-xs">
                    {workspaceItems.length}
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

              <ScrollArea className="flex-1">
                <div className="p-3 space-y-2">
                  {workspaceItems.length === 0 ? (
                    <div className="text-center py-8 text-sm text-gray-500 dark:text-gray-400">
                      <Zap className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No workspace items yet</p>
                      <p className="text-xs mt-1">Use tools and generate media to see items here</p>
                    </div>
                  ) : (
                    workspaceItems.map((item) => (
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

          <TabsContent value="ai" className="flex-1 flex flex-col m-0">
            <div className="p-3">
              <h3 className="font-medium text-sm mb-3">AI Model Setup</h3>
              <div className="space-y-3">
                <div className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">GPT-4</span>
                    <Badge variant="secondary" className="text-xs">Active</Badge>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                    Advanced reasoning and code generation
                  </p>
                  <Button variant="outline" size="sm" className="w-full text-xs">
                    Configure
                  </Button>
                </div>
                
                <div className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg opacity-60">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Claude 3</span>
                    <Badge variant="outline" className="text-xs">Available</Badge>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                    Long context and analysis
                  </p>
                  <Button variant="outline" size="sm" className="w-full text-xs">
                    Enable
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="flex-1 flex flex-col m-0">
            <ScrollArea className="flex-1">
              <div className="p-3 space-y-4">
                <div>
                  <h3 className="font-medium text-sm mb-2">Workspace Settings</h3>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 text-sm">
                      <input type="checkbox" className="rounded" defaultChecked />
                      <span>Auto-save workspace items</span>
                    </label>
                    <label className="flex items-center space-x-2 text-sm">
                      <input type="checkbox" className="rounded" />
                      <span>Show item previews</span>
                    </label>
                    <label className="flex items-center space-x-2 text-sm">
                      <input type="checkbox" className="rounded" defaultChecked />
                      <span>Enable real-time collaboration</span>
                    </label>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium text-sm mb-2">Chat Settings</h3>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 text-sm">
                      <input type="checkbox" className="rounded" defaultChecked />
                      <span>Show typing indicators</span>
                    </label>
                    <label className="flex items-center space-x-2 text-sm">
                      <input type="checkbox" className="rounded" />
                      <span>Enable message reactions</span>
                    </label>
                    <label className="flex items-center space-x-2 text-sm">
                      <input type="checkbox" className="rounded" defaultChecked />
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
        return <Image className="h-4 w-4" />
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
      "p-2 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer transition-colors",
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
