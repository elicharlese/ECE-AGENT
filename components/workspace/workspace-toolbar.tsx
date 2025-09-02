"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  MessageSquare,
  Video,
  Phone,
  Code,
  Image,
  Music,
  Bot,
  Zap,
  Grid3X3,
  Maximize2,
  Minimize2,
  Play,
  Square,
  Users,
  Settings,
  ChevronDown
} from "lucide-react"
import { cn } from "@/lib/utils"
import { ThemeToggle } from "@/components/ui/ThemeToggle"

interface WorkspaceToolbarProps {
  mode: 'chat' | 'workspace'
  layout: 'unified' | 'split'
  activeTab: 'chat' | 'media' | 'tools'
  activeParticipants: number
  isConnected: boolean
  onModeChange: (mode: 'chat' | 'workspace') => void
  onLayoutChange: (layout: 'unified' | 'split') => void
  onTabChange: (tab: 'chat' | 'media' | 'tools') => void
  onStartVideoCall: () => void
  onStartPhoneCall: () => void
  onExecuteTool: (toolType: string) => void
  onGenerateMedia: (type: 'image' | 'audio' | 'video') => void
}

export function WorkspaceToolbar({
  mode,
  layout,
  activeTab,
  activeParticipants,
  isConnected,
  onModeChange,
  onLayoutChange,
  onTabChange,
  onStartVideoCall,
  onStartPhoneCall,
  onExecuteTool,
  onGenerateMedia
}: WorkspaceToolbarProps) {
  return (
    <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
      {/* Left Section - Mode & Status */}
      <div className="flex items-center gap-3">
        <Button
          variant={mode === 'workspace' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => onModeChange(mode === 'workspace' ? 'chat' : 'workspace')}
          className="flex items-center gap-2"
        >
          <Grid3X3 className="h-4 w-4" />
          Workspace
        </Button>
        
        <Separator orientation="vertical" className="h-6" />
        
        <Badge variant="outline" className="flex items-center gap-1">
          <Users className="h-3 w-3" />
          {activeParticipants} active
        </Badge>
        
        {!isConnected && (
          <Badge variant="destructive">Disconnected</Badge>
        )}
      </div>

      {/* Center Section - Quick Actions (when in workspace mode) */}
      {mode === 'workspace' && (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onStartPhoneCall}
            className="flex items-center gap-1"
          >
            <Phone className="h-4 w-4" />
            Voice
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={onStartVideoCall}
            className="flex items-center gap-1"
          >
            <Video className="h-4 w-4" />
            Video
          </Button>

          <Separator orientation="vertical" className="h-6" />

          {/* Quick Tool Actions */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="flex items-center gap-1">
                <Code className="h-4 w-4" />
                Code
                <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Code Tools</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onExecuteTool('python_interpreter')}>
                <Play className="h-4 w-4 mr-2" />
                Python Interpreter
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onExecuteTool('javascript_runner')}>
                <Play className="h-4 w-4 mr-2" />
                JavaScript Runner
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onExecuteTool('sql_query')}>
                <Play className="h-4 w-4 mr-2" />
                SQL Query
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="flex items-center gap-1">
                <Image className="h-4 w-4" />
                Media
                <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Generate Media</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onGenerateMedia('image')}>
                <Image className="h-4 w-4 mr-2" />
                Generate Image
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onGenerateMedia('audio')}>
                <Music className="h-4 w-4 mr-2" />
                Generate Audio
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onGenerateMedia('video')}>
                <Video className="h-4 w-4 mr-2" />
                Generate Video
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="flex items-center gap-1">
                <Bot className="h-4 w-4" />
                AI Tools
                <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>AI Tools</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onExecuteTool('web_search')}>
                <Zap className="h-4 w-4 mr-2" />
                Web Search
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onExecuteTool('data_analysis')}>
                <Zap className="h-4 w-4 mr-2" />
                Data Analysis
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onExecuteTool('3d_modeling')}>
                <Zap className="h-4 w-4 mr-2" />
                3D Modeling
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

      {/* Right Section - Layout Controls */}
      <div className="flex items-center gap-2">
        {mode === 'workspace' && (
          <>
            {/* Tab Navigation */}
            <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
              <Button
                variant={activeTab === 'chat' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onTabChange('chat')}
                className="h-7 px-2"
              >
                <MessageSquare className="h-3 w-3" />
              </Button>
              <Button
                variant={activeTab === 'media' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onTabChange('media')}
                className="h-7 px-2"
              >
                <Image className="h-3 w-3" />
              </Button>
              <Button
                variant={activeTab === 'tools' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onTabChange('tools')}
                className="h-7 px-2"
              >
                <Bot className="h-3 w-3" />
              </Button>
            </div>

            <Separator orientation="vertical" className="h-6" />

            {/* Layout Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onLayoutChange(layout === 'unified' ? 'split' : 'unified')}
              title={layout === 'unified' ? 'Switch to split view' : 'Switch to unified view'}
            >
              {layout === 'unified' ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
            </Button>
          </>
        )}

        <ThemeToggle />

        <Button variant="ghost" size="sm">
          <Settings className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
