"use client"

import { useState } from "react"
import { Search, Plus, X, Zap, Archive, Trash2, Share2 } from "lucide-react"
import {
  Button,
  Separator,
  Switch
} from '@/libs/design-system';
import { Input } from '@/libs/design-system'
import { Avatar, AvatarFallback, AvatarImage } from '@/libs/design-system'
import { Badge } from '@/libs/design-system'
import { UserProfile } from "./user-profile"
import { ContactsManager } from "./contacts-manager"
import { useConversations } from "@/hooks/use-conversations"
import { useResponsiveLayout } from "@/hooks/use-responsive-layout"
import { Skeleton } from '@/libs/design-system'
// TODO: Replace deprecated components: ContextMenu
// 
// TODO: Replace deprecated components: ContextMenu
// import { ContextMenu } from '@/components/ui/context-menu'

// TODO: Replace deprecated components: Switch
// 
// TODO: Replace deprecated components: Switch
// import { Switch } from '@/components/ui/switch'
 

interface ChatSidebarProps {
  selectedChatId: string
  onSelectChat: (chatId: string) => void
  panelState: "expanded" | "minimized" | "collapsed"
  onSetPanelState: (state: "expanded" | "minimized" | "collapsed") => void
  onOpenInviteNewChat: () => void
  onToggleWorkspace?: () => void
}

export function ChatSidebar({ selectedChatId, onSelectChat, panelState, onSetPanelState, onOpenInviteNewChat, onToggleWorkspace }: ChatSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [showArchived, setShowArchived] = useState(false)
  const { conversations, loading, error, fetchConversations } = useConversations()
  const { isMobile, screenSize, orientation } = useResponsiveLayout()
  const isSmallOverlay = isMobile || (screenSize === "tablet" && orientation === "portrait")

  // Hide archived by default; toggle via Show archived
  const visibleConversations = conversations.filter((conv) => showArchived || !conv.is_archived)
  const chats = visibleConversations.map(conv => ({
    id: conv.id,
    name: conv.title || `Conversation ${conv.id.slice(0, 8)}`,
    lastMessage: "", // We would need to extract this from messages
    timestamp: new Date(conv.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    unreadCount: 0,
    isOnline: false,
  }))

  const filteredChats = chats.filter(chat =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // No pinned grouping; show a single list

  const handleStartChat = async (contactId: string) => {
    // Open invite dialog instead of creating placeholder conversation
    onOpenInviteNewChat()
    if (isSmallOverlay) onSetPanelState("collapsed")
  }

  const handleNewChat = async () => {
    onOpenInviteNewChat()
    if (isSmallOverlay) onSetPanelState("collapsed")
  }

  if (panelState === "collapsed") return null

  if (panelState === "minimized") {
    // Compact rail with an expand button and a couple of quick actions
    return (
      <div className="h-full bg-white dark:bg-[#1f2937] border-r border-transparent flex flex-col items-center py-3 w-full">
        <div className="flex-1 overflow-y-auto hide-scrollbar w-full px-2 pt-3">
          {/* Minimal list of recent conversations: just avatars */}
          <div className="flex flex-col items-center gap-2">
            {chats.slice(0, 12).map((chat) => (
              <button
                key={chat.id}
                title={chat.name}
                aria-label={chat.name}
                onClick={() => onSelectChat(chat.id)}
                className={`w-10 h-10 rounded-full flex items-center justify-center bg-gray-50 dark:bg-white/10 hover:bg-gray-100 dark:hover:bg-white/15 transition ${
                  selectedChatId === chat.id ? "ring-2 ring-indigo-500" : ""
                }`}
              >
                <span className="text-[10px] font-medium text-gray-600 dark:text-gray-200">
                  {chat.name.split(" ").map((n: string) => n[0]).join("")}
                </span>
              </button>
            ))}
          </div>
        </div>
        <div className="w-full px-2 pt-2 border-t border-transparent flex items-center justify-center">
          <Button variant="ghost" size="sm" aria-label="New chat" className="w-10 h-10 p-0" onClick={handleNewChat}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full bg-white dark:bg-[#1f2937] border-r border-transparent flex flex-col">
      {/* Header */}
      <div className="px-3 py-2 border-b border-transparent">
        
        {/* Profile + actions (moved from footer) */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="min-w-0 flex-1">
            <UserProfile />
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <ContactsManager onStartChat={handleStartChat} />
            <Button variant="ghost" size="sm" aria-label="New chat" onClick={handleNewChat}>
              <Plus className="h-4 w-4" />
            </Button>
            {isSmallOverlay && (
              <Button
                variant="ghost"
                size="sm"
                aria-label="Close conversations sidebar"
                onClick={() => onSetPanelState("collapsed")}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-9 bg-gray-50 dark:bg-white/10 border-0 placeholder:text-gray-400 dark:placeholder:text-gray-400"
          />
        </div>

        {/* Quick Actions removed; moved into UserProfile popout */}
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto hide-scrollbar pt-2">
        {/* Loading skeleton */}
        {loading && (
          <div className="p-2 space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && filteredChats.length === 0 && (
          <div className="p-6 text-center text-sm text-gray-600 dark:text-gray-300">
            <p>No conversations yet.</p>
            <Button onClick={handleNewChat} size="sm" className="mt-3" aria-label="Start new chat">
              <Plus className="h-4 w-4 mr-1" /> New chat
            </Button>
          </div>
        )}

        {/* Data present */}
        {!loading && filteredChats.length > 0 && (
          <div className="p-2 pt-2">
            {filteredChats.map((chat) => (
              <ChatItem
                key={chat.id}
                chat={chat}
                isSelected={selectedChatId === chat.id}
                onSelect={() => onSelectChat(chat.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer removed: profile and actions moved to header */}
    </div>
  )
}

function ChatItem({ chat, isSelected, onSelect }: { chat: any; isSelected: boolean; onSelect: () => void }) {
  return (
    <div
      onClick={onSelect}
      className={`
        flex items-center gap-3 p-2.5 rounded-lg cursor-pointer transition-colors
        ${
          isSelected
            ? "bg-blue-50 dark:bg-white/15 border border-transparent"
            : "hover:bg-gray-50 dark:hover:bg-white/10"
        }
      `}
    >
      <div className="relative">
        <Avatar className="h-10 w-10">
          <AvatarImage src={chat.avatar || "/placeholder.svg"} />
          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
            {chat.name
              .split(" ")
              .map((n: string) => n[0])
              .join("")}
          </AvatarFallback>
        </Avatar>
        {chat.isOnline && (
          <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <h3
            className={`font-medium truncate ${isSelected ? "text-blue-700 dark:text-blue-300" : "text-gray-900 dark:text-white"}`}
          >
            {chat.name}
          </h3>
          <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">{chat.timestamp}</span>
        </div>
        <div className="flex items-center justify-between mt-1">
          <p className="text-sm text-gray-600 dark:text-gray-300 truncate">{chat.lastMessage}</p>
          {chat.unreadCount > 0 && (
            <Badge className="ml-2 bg-blue-500 hover:bg-blue-600 text-white text-xs px-1.5 py-0.5 min-w-[1.25rem] h-5">
              {chat.unreadCount}
            </Badge>
          )}
        </div>
      </div>
    </div>
  )
}
