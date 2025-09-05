"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { Button } from '@/libs/design-system'
import { Badge } from '@/libs/design-system'
import { Card, CardContent, CardHeader, CardTitle } from '@/libs/design-system'
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels"
import {
  Play,
  Pause,
  Square,
  Download,
  Share2,
  Eye,
  Code,
  Image,
  Music,
  Video,
  FileText,
  Zap,
  Trash2,
  Copy,
  ExternalLink
} from "lucide-react"
import { cn } from "@/lib/utils"

interface WorkspaceItem {
  id: string
  type: 'code' | 'image' | 'audio' | 'video' | 'document' | 'tool_result' | 'data_viz'
  title: string
  content: any
  status: 'generating' | 'completed' | 'error'
  timestamp: Date
  author: string
  metadata?: Record<string, any>
}

interface WorkspaceCanvasProps {
  items: WorkspaceItem[]
  onItemAction: (itemId: string, action: string, params?: any) => void
  onItemDelete: (itemId: string) => void
  className?: string
}

export function WorkspaceCanvas({ 
  items, 
  onItemAction, 
  onItemDelete, 
  className 
}: WorkspaceCanvasProps) {
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [draggedItem, setDraggedItem] = useState<string | null>(null)
  const canvasRef = useRef<HTMLDivElement>(null)

  const handleItemSelect = useCallback((itemId: string, multiSelect = false) => {
    if (multiSelect) {
      setSelectedItems(prev => 
        prev.includes(itemId) 
          ? prev.filter(id => id !== itemId)
          : [...prev, itemId]
      )
    } else {
      setSelectedItems([itemId])
    }
  }, [])

  const renderWorkspaceItem = (item: WorkspaceItem) => {
    const isSelected = selectedItems.includes(item.id)
    
    switch (item.type) {
      case 'code':
        return (
          <Card 
            key={item.id}
            className={cn(
              "cursor-pointer transition-all hover:shadow-md",
              isSelected && "ring-2 ring-blue-500",
              item.status === 'generating' && "animate-pulse"
            )}
            onClick={(e) => handleItemSelect(item.id, e.ctrlKey || e.metaKey)}
          >
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Code className="h-4 w-4" />
                  {item.title}
                </CardTitle>
                <div className="flex items-center gap-1">
                  <Badge variant={item.status === 'completed' ? 'default' : 'secondary'}>
                    {item.status}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      onItemAction(item.id, 'run')
                    }}
                  >
                    <Play className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <pre className="text-xs bg-gray-900 text-green-400 p-2 rounded overflow-x-auto max-h-32">
                <code>{item.content.code}</code>
              </pre>
              {item.content.output && (
                <div className="mt-2 text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded">
                  <strong>Output:</strong> {item.content.output}
                </div>
              )}
            </CardContent>
          </Card>
        )

      case 'image':
        return (
          <Card 
            key={item.id}
            className={cn(
              "cursor-pointer transition-all hover:shadow-md",
              isSelected && "ring-2 ring-blue-500"
            )}
            onClick={(e) => handleItemSelect(item.id, e.ctrlKey || e.metaKey)}
          >
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Image className="h-4 w-4" />
                  {item.title}
                </CardTitle>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      onItemAction(item.id, 'view')
                    }}
                  >
                    <Eye className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      onItemAction(item.id, 'download')
                    }}
                  >
                    <Download className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {item.status === 'generating' ? (
                <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse flex items-center justify-center">
                  <span className="text-sm text-gray-500">Generating...</span>
                </div>
              ) : (
                <img 
                  src={item.content.url} 
                  alt={item.content?.prompt || item.title || 'Workspace image'}
                  className="w-full h-32 object-cover rounded"
                />
              )}
              <p className="text-xs text-gray-500 mt-2 truncate">
                {item.content.prompt}
              </p>
            </CardContent>
          </Card>
        )

      case 'audio':
        return (
          <Card 
            key={item.id}
            className={cn(
              "cursor-pointer transition-all hover:shadow-md",
              isSelected && "ring-2 ring-blue-500"
            )}
            onClick={(e) => handleItemSelect(item.id, e.ctrlKey || e.metaKey)}
          >
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Music className="h-4 w-4" />
                  {item.title}
                </CardTitle>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      onItemAction(item.id, 'play')
                    }}
                  >
                    <Play className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      onItemAction(item.id, 'download')
                    }}
                  >
                    <Download className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {item.status === 'generating' ? (
                <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse flex items-center justify-center">
                  <span className="text-sm text-gray-500">Generating audio...</span>
                </div>
              ) : (
                <audio controls className="w-full">
                  <source src={item.content.url} type="audio/mpeg" />
                </audio>
              )}
              <p className="text-xs text-gray-500 mt-2 truncate">
                {item.content.prompt}
              </p>
            </CardContent>
          </Card>
        )

      case 'video':
        return (
          <Card 
            key={item.id}
            className={cn(
              "cursor-pointer transition-all hover:shadow-md",
              isSelected && "ring-2 ring-blue-500"
            )}
            onClick={(e) => handleItemSelect(item.id, e.ctrlKey || e.metaKey)}
          >
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Video className="h-4 w-4" />
                  {item.title}
                </CardTitle>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      onItemAction(item.id, 'play')
                    }}
                  >
                    <Play className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      onItemAction(item.id, 'download')
                    }}
                  >
                    <Download className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {item.status === 'generating' ? (
                <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse flex items-center justify-center">
                  <span className="text-sm text-gray-500">Generating video...</span>
                </div>
              ) : (
                <video controls className="w-full h-32 rounded">
                  <source src={item.content.url} type="video/mp4" />
                </video>
              )}
              <p className="text-xs text-gray-500 mt-2 truncate">
                {item.content.prompt}
              </p>
            </CardContent>
          </Card>
        )

      case 'tool_result':
        return (
          <Card 
            key={item.id}
            className={cn(
              "cursor-pointer transition-all hover:shadow-md",
              isSelected && "ring-2 ring-blue-500"
            )}
            onClick={(e) => handleItemSelect(item.id, e.ctrlKey || e.metaKey)}
          >
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  {item.title}
                </CardTitle>
                <div className="flex items-center gap-1">
                  <Badge variant="outline">
                    {item.content.toolType}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      onItemAction(item.id, 'copy')
                    }}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-sm space-y-2">
                <div>
                  <strong>Input:</strong>
                  <pre className="text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded mt-1 overflow-x-auto">
                    {JSON.stringify(item.content.input, null, 2)}
                  </pre>
                </div>
                {item.content.output && (
                  <div>
                    <strong>Output:</strong>
                    <pre className="text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded mt-1 overflow-x-auto">
                      {typeof item.content.output === 'string' 
                        ? item.content.output 
                        : JSON.stringify(item.content.output, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )

      case 'data_viz':
        return (
          <Card 
            key={item.id}
            className={cn(
              "cursor-pointer transition-all hover:shadow-md",
              isSelected && "ring-2 ring-blue-500"
            )}
            onClick={(e) => handleItemSelect(item.id, e.ctrlKey || e.metaKey)}
          >
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  {item.title}
                </CardTitle>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      onItemAction(item.id, 'fullscreen')
                    }}
                  >
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      onItemAction(item.id, 'export')
                    }}
                  >
                    <Download className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-32 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded flex items-center justify-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {item.content.chartType} Chart
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Dataset: {item.content.dataset}
              </p>
            </CardContent>
          </Card>
        )

      default:
        return null
    }
  }

  return (
    <div 
      ref={canvasRef}
      className={cn("p-4 h-full overflow-y-auto", className)}
    >
      {/* Canvas Actions */}
      {selectedItems.length > 0 && (
        <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-2 mb-4 flex items-center gap-2">
          <span className="text-sm font-medium">
            {selectedItems.length} selected
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              selectedItems.forEach(id => onItemAction(id, 'copy'))
              setSelectedItems([])
            }}
          >
            <Copy className="h-3 w-3 mr-1" />
            Copy
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              selectedItems.forEach(id => onItemAction(id, 'share'))
              setSelectedItems([])
            }}
          >
            <Share2 className="h-3 w-3 mr-1" />
            Share
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              selectedItems.forEach(id => onItemDelete(id))
              setSelectedItems([])
            }}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-3 w-3 mr-1" />
            Delete
          </Button>
        </div>
      )}

      {/* Workspace Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {items.map(renderWorkspaceItem)}
      </div>

      {/* Empty State */}
      {items.length === 0 && (
        <div className="flex flex-col items-center justify-center h-64 text-gray-500">
          <Zap className="h-12 w-12 mb-4 opacity-50" />
          <h3 className="text-lg font-medium mb-2">Empty Workspace</h3>
          <p className="text-sm text-center max-w-md">
            Start creating by running code, generating media, or using AI tools. 
            Your workspace items will appear here.
          </p>
        </div>
      )}
    </div>
  )
}
