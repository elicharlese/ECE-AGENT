"use client"

import { useState } from "react"
import { 
  Phone, 
  Video, 
  Bot, 
  SquareArrowOutUpRight,
  Pin,
  Settings,
  ChevronDown,
  ChevronUp,
  MoreVertical,
  Users,
  UserPlus,
  Shield,
  Bell,
  Archive,
  Trash2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Card,
  CardContent,
} from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { CreditsPopover } from "@/components/credits/CreditsPopover"

interface EnhancedChatHeaderProps {
  chatInfo: {
    id: string
    name: string
    type?: "direct" | "group" | "ai" | "combination"
    participants?: number
    avatar?: string
    status?: "online" | "offline" | "busy" | "away"
    customStatus?: string
    isAgent?: boolean
  }
  pinnedMessages: Array<{
    id: string
    content: string
    sender: string
    timestamp: Date
  }>
  onPhoneCall: () => void
  onVideoCall: () => void
  onOpenAgentSettings: () => void
  onPopout: () => void
  onOpenAppLauncher: () => void
  onInviteUsers?: () => void
  isMobile?: boolean
}

export function EnhancedChatHeader({
  chatInfo,
  pinnedMessages,
  onPhoneCall,
  onVideoCall,
  onOpenAgentSettings,
  onPopout,
  onOpenAppLauncher,
  onInviteUsers,
  isMobile = false
}: EnhancedChatHeaderProps) {
  const [showPinnedBanner, setShowPinnedBanner] = useState(pinnedMessages.length > 0)
  const [expandedPins, setExpandedPins] = useState(false)

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "online": return "bg-green-500"
      case "busy": return "bg-red-500"
      case "away": return "bg-yellow-500"
      default: return "bg-gray-400"
    }
  }

  const getChatTypeIcon = () => {
    switch (chatInfo.type) {
      case "group": return <Users className="h-3 w-3" />
      case "ai": return <Bot className="h-3 w-3" />
      case "combination": return <Shield className="h-3 w-3" />
      default: return null
    }
  }

  return (
    <div className="flex flex-col bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      {/* Main Header */}
      <div className={cn(
        "flex items-center justify-between",
        isMobile ? "px-3 py-2 safe-area-inset-top" : "px-4 py-3"
      )}>
        {/* Left Section - User/Chat Info */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="relative">
            <Avatar className={isMobile ? "h-9 w-9" : "h-10 w-10"}>
              <AvatarImage src={chatInfo.avatar} />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                {chatInfo.name.split(" ").map(n => n[0]).join("")}
              </AvatarFallback>
            </Avatar>
            {chatInfo.status && (
              <div className={cn(
                "absolute -bottom-0.5 -right-0.5 h-3 w-3 border-2 border-white dark:border-gray-800 rounded-full",
                getStatusColor(chatInfo.status)
              )} />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-sm truncate">{chatInfo.name}</h3>
              {getChatTypeIcon()}
              {chatInfo.isAgent && (
                <Badge variant="secondary" className="text-xs">
                  AI Agent
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              {chatInfo.customStatus ? (
                <span className="truncate">{chatInfo.customStatus}</span>
              ) : (
                <>
                  {chatInfo.type === "group" && (
                    <span>{chatInfo.participants || 0} participants</span>
                  )}
                  {chatInfo.status && <span>{chatInfo.status}</span>}
                </>
              )}
              {pinnedMessages.length > 0 && (
                <>
                  <span>•</span>
                  <button
                    onClick={() => setExpandedPins(!expandedPins)}
                    className="flex items-center gap-1 hover:text-gray-700 dark:hover:text-gray-200 transition"
                  >
                    <Pin className="h-3 w-3" />
                    {pinnedMessages.length} pinned
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right Section - Actions */}
        <div className="flex items-center gap-1">
          {chatInfo.type === "group" && onInviteUsers && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onInviteUsers}
              title="Invite users"
            >
              <UserPlus className="h-4 w-4" />
            </Button>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            onClick={onPhoneCall}
            title="Voice call"
          >
            <Phone className="h-4 w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={onVideoCall}
            title="Video call"
          >
            <Video className="h-4 w-4" />
          </Button>

          {chatInfo.isAgent && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onOpenAgentSettings}
              title="Agent settings"
            >
              <Settings className="h-4 w-4" />
            </Button>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={onPopout}
            title="Open in new window"
            aria-label="Open in new window"
          >
            <SquareArrowOutUpRight className="h-4 w-4" />
          </Button>

          <CreditsPopover />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Chat Options</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onOpenAppLauncher}>
                <Bot className="h-4 w-4 mr-2" />
                Launch App
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Bell className="h-4 w-4 mr-2" />
                Mute Notifications
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Archive className="h-4 w-4 mr-2" />
                Archive Chat
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Chat
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Pinned Messages Banner */}
      {showPinnedBanner && pinnedMessages.length > 0 && (
        <div className={cn(
          "border-t border-gray-100 dark:border-gray-700 bg-amber-50 dark:bg-amber-900/20",
          expandedPins ? "max-h-64" : "max-h-12",
          "transition-all duration-200 overflow-hidden"
        )}>
          <div className="px-4 py-2">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <Pin className="h-3 w-3 text-amber-600 dark:text-amber-400" />
                <span className="text-xs font-medium text-amber-700 dark:text-amber-300">
                  Pinned Messages ({pinnedMessages.length})
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2"
                  onClick={() => setShowPinnedBanner(false)}
                >
                  <span className="text-xs">Hide</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => setExpandedPins(!expandedPins)}
                >
                  {expandedPins ? (
                    <ChevronUp className="h-3 w-3" />
                  ) : (
                    <ChevronDown className="h-3 w-3" />
                  )}
                </Button>
              </div>
            </div>

            {expandedPins ? (
              <div className="space-y-2 mt-2 max-h-48 overflow-y-auto">
                {pinnedMessages.map(msg => (
                  <Card key={msg.id} className="bg-white dark:bg-gray-800 border-amber-200 dark:border-amber-800">
                    <CardContent className="p-2">
                      <div className="flex items-start justify-between">
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                            {msg.sender}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                            {msg.content}
                          </p>
                        </div>
                        <span className="text-xs text-gray-500 ml-2">
                          {msg.timestamp.toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-xs text-amber-700 dark:text-amber-300 truncate">
                Latest: {pinnedMessages[0]?.content}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
