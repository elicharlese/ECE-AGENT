"use client"

import { useState } from "react"
import { Button } from '@/libs/design-system'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/libs/design-system'
import { Avatar, AvatarFallback, AvatarImage } from '@/libs/design-system'
import { Badge } from '@/libs/design-system'
import { Pin, X } from "lucide-react"

interface PinnedMessage {
  id: string
  content: string
  timestamp: Date
  senderName: string
  senderId: string
  type: "text" | "image" | "video" | "audio" | "document"
  mediaUrl?: string
}

const mockPinnedMessages: PinnedMessage[] = [
  {
    id: "pin1",
    content: "Meeting tomorrow at 2 PM in conference room A",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
    senderName: "Sarah Wilson",
    senderId: "2",
    type: "text",
  },
  {
    id: "pin2",
    content: "Project deadline is Friday - don't forget!",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48),
    senderName: "Alex Chen",
    senderId: "3",
    type: "text",
  },
  {
    id: "pin3",
    content: "Team photo from last week",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 72),
    senderName: "Maria Garcia",
    senderId: "4",
    type: "image",
    mediaUrl: "/placeholder.svg?height=200&width=300",
  },
]

interface PinnedMessagesProps {
  chatId: string
  onUnpin?: (messageId: string) => void
  onJumpToMessage?: (messageId: string) => void
}

export function PinnedMessages({ chatId, onUnpin, onJumpToMessage }: PinnedMessagesProps) {
  const [pinnedMessages, setPinnedMessages] = useState<PinnedMessage[]>(mockPinnedMessages)

  const handleUnpin = (messageId: string) => {
    setPinnedMessages((prev) => prev.filter((msg) => msg.id !== messageId))
    onUnpin?.(messageId)
  }

  const handleJumpToMessage = (messageId: string) => {
    onJumpToMessage?.(messageId)
  }

  const formatDate = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (days === 0) return "Today"
    if (days === 1) return "Yesterday"
    if (days < 7) return `${days} days ago`
    return date.toLocaleDateString()
  }

  if (pinnedMessages.length === 0) return null

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Pin className="h-4 w-4" />
          {pinnedMessages.length > 0 && (
            <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs bg-blue-500">{pinnedMessages.length}</Badge>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pin className="h-5 w-5" />
            Pinned Messages ({pinnedMessages.length})
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 max-h-96 overflow-y-auto">
          {pinnedMessages.map((message) => (
            <div
              key={message.id}
              className="flex gap-3 p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group"
            >
              <Avatar className="h-8 w-8">
                <AvatarImage />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-sm">
                  {message.senderName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{message.senderName}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">{formatDate(message.timestamp)}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleUnpin(message.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>

                <div className="cursor-pointer" onClick={() => handleJumpToMessage(message.id)}>
                  {message.type === "text" ? (
                    <p className="text-sm text-gray-700 dark:text-gray-300">{message.content}</p>
                  ) : message.type === "image" ? (
                    <div className="flex items-center gap-2">
                      <img
                        src={message.mediaUrl || "/placeholder.svg"}
                        alt="Pinned image"
                        className="w-12 h-12 rounded object-cover"
                      />
                      <span className="text-sm text-gray-600 dark:text-gray-400">{message.content}</span>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-600 dark:text-gray-400 italic">{message.content}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {pinnedMessages.length === 0 && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <Pin className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No pinned messages</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
