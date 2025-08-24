"use client"

import { useState, useEffect } from "react"
import { Search, Plus, Archive, ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { AgentBranding } from "@/components/agent-branding"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { UserProfile } from "./user-profile"
import { ContactsManager } from "./contacts-manager"
import { useConversations } from "@/hooks/use-conversations"
import { dmService } from "@/services/dm-service"
import { toast } from "@/hooks/use-toast"

interface ChatSidebarProps {
  selectedChatId: string
  onSelectChat: (chatId: string) => void
  collapsed: boolean
  onToggleCollapse: () => void
}

export function ChatSidebar({ selectedChatId, onSelectChat, collapsed, onToggleCollapse }: ChatSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const { conversations, loading, error, fetchConversations } = useConversations()
  const [startDmOpen, setStartDmOpen] = useState(false)
  const [dmIdentifier, setDmIdentifier] = useState("")
  const [startingDm, setStartingDm] = useState(false)

  // Convert conversations to chat format for display
  const chats = conversations.map(conv => ({
    id: conv.id,
    name: conv.title || `Conversation ${conv.id.slice(0, 8)}`,
    lastMessage: "", // We would need to extract this from messages
    timestamp: new Date(conv.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    unreadCount: 0,
    isOnline: false,
    isPinned: false,
  }))

  const filteredChats = chats.filter(chat =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const pinnedChats = filteredChats.filter((chat) => chat.isPinned)
  const regularChats = filteredChats.filter((chat) => !chat.isPinned)

  const handleStartChat = async (identifier: string) => {
    const id = (identifier || "").trim()
    if (!id) {
      toast({ title: "Enter a username or email", description: "Please provide an identifier to start a DM." })
      return
    }
    try {
      setStartingDm(true)
      const conversation = await dmService.startDirectMessageByUsername(id)
      onSelectChat(conversation.id)
      await fetchConversations()
      setStartDmOpen(false)
      setDmIdentifier("")
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to start DM"
      toast({ title: "Could not start chat", description: message, variant: "destructive" })
    } finally {
      setStartingDm(false)
    }
  }

  if (collapsed) return null

  return (
    <div className="h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <AgentBranding variant="compact" />
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Messages</h1>
          </div>
          <div className="flex items-center gap-2">
            <ContactsManager onStartChat={handleStartChat} />
            <Dialog open={startDmOpen} onOpenChange={setStartDmOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm" aria-label="Start a direct message">
                  <Plus className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent title="Start a direct message" description="Enter a username or email to chat with." className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Start a direct message</DialogTitle>
                </DialogHeader>
                <div className="space-y-3">
                  <Input
                    autoFocus
                    placeholder="username or email"
                    value={dmIdentifier}
                    onChange={(e) => setDmIdentifier(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        handleStartChat(dmIdentifier)
                      }
                    }}
                  />
                  <div className="flex justify-end gap-2">
                    <Button
                      onClick={() => handleStartChat(dmIdentifier)}
                      disabled={startingDm || !dmIdentifier.trim()}
                    >
                      {startingDm ? 'Starting…' : 'Start DM'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            <Button variant="ghost" size="sm" onClick={onToggleCollapse}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
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

        {/* Quick Actions */}
        <div className="flex gap-2 mt-3">
          <Button variant="ghost" size="sm" className="text-xs">
            <Archive className="h-3 w-3 mr-1" />
            Archived
          </Button>
          {/* SettingsPanel removed (legacy). Replace with noop button or omit entirely. */}
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
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
      </div>

      {/* User Profile at Bottom */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <UserProfile />
      </div>
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
            ? "bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800"
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
