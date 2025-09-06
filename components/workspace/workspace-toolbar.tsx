"use client"

import {
  Button,
  Label,
  Separator
} from '@/libs/design-system';
import { Badge } from '@/libs/design-system'

// TODO: Replace deprecated components: Separator
// 
// TODO: Replace deprecated components: Separator
// import { Separator } from '@/components/ui/separator'
// Dropdown menus removed per design change (Code/Media/AI Tools)
import {
  MessageSquare,
  Video,
  Phone,
  Grid3X3,
  Maximize2,
  Minimize2,
  Users,
  Settings,
  
} from "lucide-react"
import { cn } from "@/lib/utils"
import { ThemeToggle } from '@/libs/design-system'

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
    <div className="flex items-center justify-between p-3 bg-background text-foreground border-b border-border">
      {/* Left Section - Mode & Status */}
      <div className="flex items-center gap-3">
        <Button
          variant={mode === 'workspace' ? 'primary' : 'ghost'}
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

      {/* Center Section - Quick Actions (voice/video only) */}
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
        </div>
      )}

      {/* Right Section - Layout Controls */}
      <div className="flex items-center gap-2">
        {mode === 'workspace' && (
          <>
            {/* Tab Navigation */}
            <div className="flex items-center bg-secondary rounded-lg p-1">
              <Button
                variant={activeTab === 'chat' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => onTabChange('chat')}
                className="h-7 px-2"
              >
                <MessageSquare className="h-3 w-3" />
              </Button>
              <Button
                variant={activeTab === 'media' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => onTabChange('media')}
                className="h-7 px-2"
              >
                <Image className="h-3 w-3" />
              </Button>
              <Button
                variant={activeTab === 'tools' ? 'primary' : 'ghost'}
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
