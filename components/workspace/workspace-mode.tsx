"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels"
import { 
  MessageSquare, 
  Video, 
  Phone, 
  Code, 
  Image, 
  Music, 
  FileText, 
  Play, 
  Pause, 
  Square,
  Maximize2,
  Minimize2,
  Users,
  Bot,
  Zap,
  Eye,
  Download,
  Share2
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useWebSocket } from "@/hooks/use-websocket"
import { useIsMobile } from "@/hooks/use-mobile"
import { trackEvent } from "@/lib/analytics"

// Import existing components
import { MessageBubble } from "../chat/message-bubble"
import { DesktopMessageInput } from "../chat/DesktopMessageInput"
import { MobileMessageInput } from "../chat/mobile-message-input"
import { PhoneCallUI } from "../calls/phone-call-ui"
import { VideoCallUI } from "../calls/video-call-ui"
import { TypingIndicator } from "../chat/typing-indicator"

interface WorkspaceItem {
  id: string
  type: 'message' | 'code' | 'image' | 'audio' | 'video' | 'document' | 'tool_execution'
  content: any
  timestamp: Date
  author: string
  status?: 'generating' | 'completed' | 'error'
  metadata?: Record<string, any>
}

interface WorkspaceModeProps {
  chatId: string
  messages: any[]
  onSendMessage: (content: string) => void
  onEditMessage: (id: string, content: string) => void
  typingUsers: Record<string, boolean>
  isConnected: boolean
}

export function WorkspaceMode({
  chatId,
  messages,
  onSendMessage,
  onEditMessage,
  typingUsers,
  isConnected
}: WorkspaceModeProps) {
  const [activeMode, setActiveMode] = useState<'unified' | 'split'>('unified')
  const [activeTab, setActiveTab] = useState<'chat' | 'media' | 'tools'>('chat')
  const [isVideoCallOpen, setIsVideoCallOpen] = useState(false)
  const [isPhoneCallOpen, setIsPhoneCallOpen] = useState(false)
  const [workspaceItems, setWorkspaceItems] = useState<WorkspaceItem[]>([])
  const [activeTools, setActiveTools] = useState<string[]>([])
  const [mediaGenerations, setMediaGenerations] = useState<any[]>([])
  const isMobile = useIsMobile()

  // Convert messages to workspace items
  const workspaceData = useMemo(() => {
    const items: WorkspaceItem[] = messages.map(msg => ({
      id: msg.id,
      type: 'message',
      content: msg.content,
      timestamp: new Date(msg.timestamp),
      author: msg.sender || 'user',
      metadata: { isOwn: msg.isOwn }
    }))

    // Add media generations and tool executions
    return [...items, ...workspaceItems].sort((a, b) => 
      a.timestamp.getTime() - b.timestamp.getTime()
    )
  }, [messages, workspaceItems])

  // Handle tool execution simulation
  const executeToolAction = useCallback(async (toolType: string, params: any) => {
    const toolId = `tool_${Date.now()}`
    
    // Add generating item
    const generatingItem: WorkspaceItem = {
      id: toolId,
      type: 'tool_execution',
      content: { toolType, params, output: null },
      timestamp: new Date(),
      author: 'system',
      status: 'generating'
    }
    
    setWorkspaceItems(prev => [...prev, generatingItem])
    setActiveTools(prev => [...prev, toolId])

    // Track analytics
    await trackEvent({
      name: 'workspace_tool_execution',
      properties: { chatId, toolType, params }
    })

    // Simulate tool execution
    setTimeout(() => {
      setWorkspaceItems(prev => prev.map(item => 
        item.id === toolId 
          ? { ...item, status: 'completed', content: { ...item.content, output: `Generated ${toolType} result` }}
          : item
      ))
      setActiveTools(prev => prev.filter(id => id !== toolId))
    }, 2000)
  }, [chatId])

  // Handle media generation
  const generateMedia = useCallback(async (mediaType: 'image' | 'audio' | 'video', prompt: string) => {
    const mediaId = `media_${Date.now()}`
    
    const mediaItem: WorkspaceItem = {
      id: mediaId,
      type: mediaType,
      content: { prompt, url: null },
      timestamp: new Date(),
      author: 'ai',
      status: 'generating'
    }
    
    setWorkspaceItems(prev => [...prev, mediaItem])

    await trackEvent({
      name: 'workspace_media_generation',
      properties: { chatId, mediaType, prompt }
    })

    // Simulate media generation
    setTimeout(() => {
      setWorkspaceItems(prev => prev.map(item => 
        item.id === mediaId 
          ? { 
              ...item, 
              status: 'completed', 
              content: { 
                ...item.content, 
                url: `/placeholder-${mediaType}.${mediaType === 'audio' ? 'mp3' : mediaType === 'video' ? 'mp4' : 'jpg'}`
              }
            }
          : item
      ))
    }, 3000)
  }, [chatId])

  const renderWorkspaceItem = (item: WorkspaceItem) => {
    switch (item.type) {
      case 'message':
        return (
          <MessageBubble
            key={item.id}
            message={{
              id: item.id,
              content: item.content,
              timestamp: item.timestamp.toISOString(),
              sender: item.author,
              isOwn: item.metadata?.isOwn || false
            }}
            onEdit={onEditMessage}
            showActions={true}
          />
        )

      case 'code':
        return (
          <div key={item.id} className="bg-gray-900 rounded-lg p-4 my-2">
            <div className="flex items-center justify-between mb-2">
              <Badge variant="secondary" className="flex items-center gap-1">
                <Code className="h-3 w-3" />
                Code Execution
              </Badge>
              <div className="flex gap-2">
                <Button size="sm" variant="ghost">
                  <Play className="h-3 w-3" />
                </Button>
                <Button size="sm" variant="ghost">
                  <Download className="h-3 w-3" />
                </Button>
              </div>
            </div>
            <pre className="text-sm text-green-400 overflow-x-auto">
              <code>{item.content}</code>
            </pre>
          </div>
        )

      case 'image':
        return (
          <div key={item.id} className="bg-white dark:bg-gray-800 rounded-lg p-4 my-2">
            <div className="flex items-center justify-between mb-2">
              <Badge variant="secondary" className="flex items-center gap-1">
                <Image className="h-3 w-3" />
                {item.status === 'generating' ? 'Generating Image...' : 'Generated Image'}
              </Badge>
              {item.status === 'completed' && (
                <div className="flex gap-2">
                  <Button size="sm" variant="ghost">
                    <Eye className="h-3 w-3" />
                  </Button>
                  <Button size="sm" variant="ghost">
                    <Download className="h-3 w-3" />
                  </Button>
                  <Button size="sm" variant="ghost">
                    <Share2 className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </div>
            {item.status === 'generating' ? (
              <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse flex items-center justify-center">
                <span className="text-sm text-gray-500">Generating...</span>
              </div>
            ) : (
              <img 
                src={item.content.url} 
                alt={item.content.prompt}
                className="w-full h-48 object-cover rounded"
              />
            )}
            <p className="text-xs text-gray-500 mt-2">Prompt: {item.content.prompt}</p>
          </div>
        )

      case 'audio':
        return (
          <div key={item.id} className="bg-white dark:bg-gray-800 rounded-lg p-4 my-2">
            <div className="flex items-center justify-between mb-2">
              <Badge variant="secondary" className="flex items-center gap-1">
                <Music className="h-3 w-3" />
                {item.status === 'generating' ? 'Generating Audio...' : 'Generated Audio'}
              </Badge>
              {item.status === 'completed' && (
                <div className="flex gap-2">
                  <Button size="sm" variant="ghost">
                    <Play className="h-3 w-3" />
                  </Button>
                  <Button size="sm" variant="ghost">
                    <Download className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </div>
            {item.status === 'generating' ? (
              <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse flex items-center justify-center">
                <span className="text-sm text-gray-500">Generating audio...</span>
              </div>
            ) : (
              <audio controls className="w-full">
                <source src={item.content.url} type="audio/mpeg" />
              </audio>
            )}
            <p className="text-xs text-gray-500 mt-2">Prompt: {item.content.prompt}</p>
          </div>
        )

      case 'tool_execution':
        return (
          <div key={item.id} className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 my-2">
            <div className="flex items-center justify-between mb-2">
              <Badge variant="secondary" className="flex items-center gap-1">
                <Zap className="h-3 w-3" />
                Tool: {item.content.toolType}
              </Badge>
              {item.status === 'generating' && (
                <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full" />
              )}
            </div>
            <div className="text-sm">
              <p><strong>Input:</strong> {JSON.stringify(item.content.params)}</p>
              {item.content.output && (
                <p className="mt-2"><strong>Output:</strong> {item.content.output}</p>
              )}
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900">
      {/* Workspace Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold">Active Workspace</h2>
          <Badge variant="outline" className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            {Object.keys(typingUsers).length + 1} active
          </Badge>
          {!isConnected && (
            <Badge variant="destructive">Disconnected</Badge>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {/* Communication Controls */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsPhoneCallOpen(true)}
            className="flex items-center gap-1"
          >
            <Phone className="h-4 w-4" />
            {!isMobile && "Voice"}
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsVideoCallOpen(true)}
            className="flex items-center gap-1"
          >
            <Video className="h-4 w-4" />
            {!isMobile && "Video"}
          </Button>

          {/* Mode Toggle */}
          <Button
            variant={activeMode === 'unified' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveMode(activeMode === 'unified' ? 'split' : 'unified')}
          >
            {activeMode === 'unified' ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Workspace Content */}
      {activeMode === 'unified' ? (
        <div className="flex-1 flex flex-col">
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'chat' | 'media' | 'tools')} className="flex-1 flex flex-col">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="chat" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Chat & Tools
              </TabsTrigger>
              <TabsTrigger value="media" className="flex items-center gap-2">
                <Image className="h-4 w-4" />
                Media
              </TabsTrigger>
              <TabsTrigger value="tools" className="flex items-center gap-2">
                <Bot className="h-4 w-4" />
                AI Tools
              </TabsTrigger>
            </TabsList>

            <TabsContent value="chat" className="flex-1 flex flex-col">
              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {workspaceData.map(renderWorkspaceItem)}
                <TypingIndicator typingUsers={typingUsers} />
              </div>
              
              {isMobile ? (
                <MobileMessageInput
                  value=""
                  onChange={() => {}}
                  onSend={onSendMessage}
                  placeholder="Type a message or describe what you want to create..."
                />
              ) : (
                <DesktopMessageInput
                  value=""
                  onChange={() => {}}
                  onSend={onSendMessage}
                  placeholder="Type a message or describe what you want to create..."
                />
              )}
            </TabsContent>

            <TabsContent value="media" className="flex-1 p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <Button
                  onClick={() => generateMedia('image', 'A beautiful landscape')}
                  className="flex items-center gap-2"
                >
                  <Image className="h-4 w-4" />
                  Generate Image
                </Button>
                <Button
                  onClick={() => generateMedia('audio', 'Relaxing ambient music')}
                  className="flex items-center gap-2"
                >
                  <Music className="h-4 w-4" />
                  Generate Audio
                </Button>
                <Button
                  onClick={() => generateMedia('video', 'Short animation')}
                  className="flex items-center gap-2"
                >
                  <Video className="h-4 w-4" />
                  Generate Video
                </Button>
              </div>
              
              <div className="space-y-2">
                {workspaceData
                  .filter(item => ['image', 'audio', 'video'].includes(item.type))
                  .map(renderWorkspaceItem)}
              </div>
            </TabsContent>

            <TabsContent value="tools" className="flex-1 p-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <Button
                  onClick={() => executeToolAction('code_interpreter', { code: 'print("Hello World")' })}
                  className="flex items-center gap-2"
                >
                  <Code className="h-4 w-4" />
                  Run Code
                </Button>
                <Button
                  onClick={() => executeToolAction('web_search', { query: 'latest AI news' })}
                  className="flex items-center gap-2"
                >
                  <Zap className="h-4 w-4" />
                  Web Search
                </Button>
                <Button
                  onClick={() => executeToolAction('data_analysis', { dataset: 'sample.csv' })}
                  className="flex items-center gap-2"
                >
                  <FileText className="h-4 w-4" />
                  Analyze Data
                </Button>
                <Button
                  onClick={() => executeToolAction('3d_modeling', { prompt: 'simple cube' })}
                  className="flex items-center gap-2"
                >
                  <Bot className="h-4 w-4" />
                  3D Model
                </Button>
              </div>
              
              <div className="space-y-2">
                {workspaceData
                  .filter(item => item.type === 'tool_execution')
                  .map(renderWorkspaceItem)}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      ) : (
        <PanelGroup direction="horizontal" className="flex-1">
          <Panel defaultSize={50} minSize={30}>
            <div className="h-full flex flex-col">
              <div className="p-2 border-b border-gray-200 dark:border-gray-700">
                <h3 className="font-medium">Messages</h3>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {workspaceData
                  .filter(item => item.type === 'message')
                  .map(renderWorkspaceItem)}
                <TypingIndicator typingUsers={typingUsers} />
              </div>
              {isMobile ? (
                <MobileMessageInput
                  value=""
                  onChange={() => {}}
                  onSend={onSendMessage}
                  placeholder="Type a message..."
                />
              ) : (
                <DesktopMessageInput
                  value=""
                  onChange={() => {}}
                  onSend={onSendMessage}
                  placeholder="Type a message..."
                />
              )}
            </div>
          </Panel>
          
          <PanelResizeHandle />
          
          <Panel defaultSize={50} minSize={30}>
            <div className="h-full flex flex-col">
              <div className="p-2 border-b border-gray-200 dark:border-gray-700">
                <h3 className="font-medium">Workspace</h3>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {workspaceData
                  .filter(item => item.type !== 'message')
                  .map(renderWorkspaceItem)}
              </div>
            </div>
          </Panel>
        </PanelGroup>
      )}

      {/* Call UIs */}
      <PhoneCallUI
        isOpen={isPhoneCallOpen}
        onClose={() => setIsPhoneCallOpen(false)}
        contact={{ id: chatId, name: "Workspace Call" }}
        callType="outgoing"
      />
      
      <VideoCallUI
        isOpen={isVideoCallOpen}
        onClose={() => setIsVideoCallOpen(false)}
        contact={{ id: chatId, name: "Workspace Call" }}
        callType="outgoing"
      />
    </div>
  )
}
