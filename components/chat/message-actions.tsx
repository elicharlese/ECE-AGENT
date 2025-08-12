"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Pin, PinOff, Copy, Reply, Forward, Trash2, MoreHorizontal, Heart, HeartOff } from "lucide-react"

interface MessageActionsProps {
  messageId: string
  isPinned?: boolean
  isLiked?: boolean
  onPin?: (messageId: string) => void
  onUnpin?: (messageId: string) => void
  onLike?: (messageId: string) => void
  onUnlike?: (messageId: string) => void
  onReply?: (messageId: string) => void
  onForward?: (messageId: string) => void
  onCopy?: (messageId: string) => void
  onDelete?: (messageId: string) => void
}

export function MessageActions({
  messageId,
  isPinned = false,
  isLiked = false,
  onPin,
  onUnpin,
  onLike,
  onUnlike,
  onReply,
  onForward,
  onCopy,
  onDelete,
}: MessageActionsProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handlePin = () => {
    if (isPinned) {
      onUnpin?.(messageId)
    } else {
      onPin?.(messageId)
    }
    setIsOpen(false)
  }

  const handleLike = () => {
    if (isLiked) {
      onUnlike?.(messageId)
    } else {
      onLike?.(messageId)
    }
    setIsOpen(false)
  }

  const handleReply = () => {
    onReply?.(messageId)
    setIsOpen(false)
  }

  const handleForward = () => {
    onForward?.(messageId)
    setIsOpen(false)
  }

  const handleCopy = () => {
    onCopy?.(messageId)
    setIsOpen(false)
  }

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this message?")) {
      onDelete?.(messageId)
    }
    setIsOpen(false)
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0">
          <MoreHorizontal className="h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={handleLike}>
          {isLiked ? (
            <>
              <HeartOff className="h-4 w-4 mr-2" />
              Unlike
            </>
          ) : (
            <>
              <Heart className="h-4 w-4 mr-2" />
              Like
            </>
          )}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handlePin}>
          {isPinned ? (
            <>
              <PinOff className="h-4 w-4 mr-2" />
              Unpin
            </>
          ) : (
            <>
              <Pin className="h-4 w-4 mr-2" />
              Pin
            </>
          )}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleReply}>
          <Reply className="h-4 w-4 mr-2" />
          Reply
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleForward}>
          <Forward className="h-4 w-4 mr-2" />
          Forward
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleCopy}>
          <Copy className="h-4 w-4 mr-2" />
          Copy
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleDelete} className="text-red-600">
          <Trash2 className="h-4 w-4 mr-2" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
