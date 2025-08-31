"use client"

import { useState } from "react"
import { Search, Plus, Menu, X, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { UserProfile } from "./user-profile"
import { ContactsManager } from "./contacts-manager"
import { useConversations } from "@/hooks/use-conversations"
import { useResponsiveLayout } from "@/hooks/use-responsive-layout"
import { Skeleton } from "@/components/ui/skeleton"
import { Switch } from "@/components/ui/switch"
 

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
    isPinned: !!conv.is_pinned,
  }))

  const filteredChats = chats.filter(chat =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const pinnedChats = filteredChats.filter((chat) => chat.isPinned)
  const regularChats = filteredChats.filter((chat) => !chat.isPinned)

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
      <div className="h-full bg-white dark:bg-gray-800 border-r border-transparent flex flex-col items-center py-3 w-full">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onSetPanelState("expanded")}
          aria-label="Expand conversations sidebar"
          className="mb-2"
        >
          <Menu className="h-4 w-4" />
        </Button>
        <div className="flex-1 overflow-y-auto hide-scrollbar w-full px-2">
          {/* Minimal list of recent conversations: just avatars */}
          <div className="flex flex-col items-center gap-2">
            {chats.slice(0, 12).map((chat) => (
              <button
                key={chat.id}
                title={chat.name}
                aria-label={chat.name}
                onClick={() => onSelectChat(chat.id)}
                className={`w-10 h-10 rounded-full flex items-center justify-center bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition ${
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
    <div className="h-full bg-white dark:bg-gray-800 border-r border-transparent flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-transparent">
        
        {/* Profile + actions (moved from footer) */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="min-w-0 flex-1">
            <UserProfile />
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {onToggleWorkspace && (
              <Button variant="ghost" size="sm" aria-label="Toggle workspace" onClick={onToggleWorkspace}>
                <Zap className="h-4 w-4" />
              </Button>
            )}
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
            className="pl-10 bg-gray-50 dark:bg-gray-700 border-0"
          />
        </div>

        {/* Archived toggle */}
        <div className="mt-3 flex items-center justify-between">
          <span className="text-xs text-gray-500 dark:text-gray-400">Show archived</span>
          <Switch checked={showArchived} onCheckedChange={(v) => setShowArchived(!!v)} aria-label="Show archived conversations" />
        </div>

        {/* Quick Actions removed; moved into UserProfile popout */}
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto hide-scrollbar">
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
          <>
            {/* Pinned Chats */}
            {pinnedChats.length > 0 && (
              <div className="p-2">
                <div className="text-xs font-medium text-gray-500 dark:text-gray-400 px-2 py-1 mb-1">PINNED</div>
                {pinnedChats.map((chat) => (
                  <ChatItem
                    key={chat.id}
                    chat={chat}
                    isSelected={selectedChatId === chat.id}
                    onSelect={() => onSelectChat(chat.id)}
                  />
                ))}
              </div>
            )}

            {/* Regular Chats */}
            <div className="p-2">
              {regularChats.length > 0 && pinnedChats.length > 0 && (
                <div className="text-xs font-medium text-gray-500 dark:text-gray-400 px-2 py-1 mb-1">ALL MESSAGES</div>
              )}
              {regularChats.map((chat) => (
                <ChatItem
                  key={chat.id}
                  chat={chat}
                  isSelected={selectedChatId === chat.id}
                  onSelect={() => onSelectChat(chat.id)}
                />
              ))}
            </div>
          </>
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
        flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors
        ${
          isSelected
            ? "bg-blue-50 dark:bg-blue-900/20 border border-transparent"
            : "hover:bg-gray-50 dark:hover:bg-gray-700"
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
