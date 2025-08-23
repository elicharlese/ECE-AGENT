"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { MediaPreview } from "./media-preview"
import { MessageActions } from "./message-actions"
import { SwipeActions } from "./swipe-actions"
import { Button } from "@/components/ui/button"
import { Download, FileText, Pin, Heart, ImageIcon } from "lucide-react"
import { useHaptics } from "@/hooks/use-haptics"
import { useIsMobile } from "@/hooks/use-mobile"
import { MessageReactions } from "./message-reactions"
import type { Message as SharedMessage } from "@/types/message"

interface UIReaction {
  emoji: string
  count: number
  users: string[]
  hasReacted: boolean
}

interface MessageBubbleProps {
  message: SharedMessage
  currentUserId?: string
}

export function MessageBubble({ message, currentUserId }: MessageBubbleProps) {
  const metadata = (message.metadata as Record<string, any> | null) ?? null
  const mediaUrl: string | undefined = metadata?.mediaUrl
  const fileName: string | undefined = metadata?.fileName
  const fileSize: string | undefined = metadata?.fileSize
  const gifData: {
    id?: string
    title?: string
    url?: string
    preview_url?: string
    width?: number
    height?: number
  } | undefined = metadata?.gifData

  const initialPinned: boolean = Boolean(metadata?.isPinned)
  const initialLiked: boolean = Boolean(metadata?.isLiked)
  const initialLikeCount: number = Number(metadata?.likeCount ?? 0)

  const initialReactions: UIReaction[] = Array.isArray(metadata?.reactions)
    ? (metadata!.reactions as UIReaction[])
    : (message.reactions || []).map(r => ({ emoji: r.emoji, count: r.count, users: [], hasReacted: false }))

  const [isPinned, setIsPinned] = useState(initialPinned)
  const [isLiked, setIsLiked] = useState(initialLiked)
  const [likeCount, setLikeCount] = useState(initialLikeCount)
  const [reactions, setReactions] = useState<UIReaction[]>(initialReactions)
  const [showReactionPicker, setShowReactionPicker] = useState(false)
  const { triggerHaptic } = useHaptics()
  const isMobile = useIsMobile()

  const createdAt = new Date(message.created_at)

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  const handlePin = (messageId: string) => {
    setIsPinned(true)
    triggerHaptic("medium")
    console.log("Pinning message:", messageId)
  }

  const handleUnpin = (messageId: string) => {
    setIsPinned(false)
    triggerHaptic("light")
    console.log("Unpinning message:", messageId)
  }

  const handleLike = (messageId: string) => {
    setIsLiked(true)
    setLikeCount((prev) => prev + 1)
    triggerHaptic("light")
    console.log("Liking message:", messageId)
  }

  const handleUnlike = (messageId: string) => {
    setIsLiked(false)
    setLikeCount((prev) => Math.max(0, prev - 1))
    triggerHaptic("selection")
    console.log("Unliking message:", messageId)
  }

  const handleReply = (messageId: string) => {
    triggerHaptic("medium")
    console.log("Replying to message:", messageId)
  }

  const handleForward = (messageId: string) => {
    triggerHaptic("medium")
    console.log("Forwarding message:", messageId)
  }

  const handleCopy = (messageId: string) => {
    navigator.clipboard.writeText(message.content)
    triggerHaptic("light")
    console.log("Copied message:", messageId)
  }

  const handleDelete = (messageId: string) => {
    triggerHaptic("heavy")
    console.log("Deleting message:", messageId)
  }

  const handleAddReaction = (messageId: string, emoji: string) => {
    setReactions((prev) => {
      const existingReaction = prev.find((r) => r.emoji === emoji)
      const actor = currentUserId || "current-user"
      if (existingReaction) {
        return prev.map((r) => (r.emoji === emoji ? { ...r, count: r.count + 1, hasReacted: true, users: r.users?.includes(actor) ? r.users : [...r.users, actor] } : r))
      } else {
        return [...prev, { emoji, count: 1, users: [actor], hasReacted: true }]
      }
    })
    console.log("Adding reaction:", emoji, "to message:", messageId)
  }

  const handleRemoveReaction = (messageId: string, emoji: string) => {
    setReactions((prev) => {
      const actor = currentUserId || "current-user"
      return prev
        .map((r) => (r.emoji === emoji ? { ...r, count: Math.max(0, r.count - 1), hasReacted: false, users: r.users.filter(u => u !== actor) } : r))
        .filter((r) => r.count > 0)
    })
    console.log("Removing reaction:", emoji, "from message:", messageId)
  }

  const handleLongPress = () => {
    if (isMobile) {
      setShowReactionPicker(true)
      triggerHaptic("medium")
    }
  }

  const handleDoubleClick = () => {
    if (!isMobile) {
      handleAddReaction(message.id, "❤️")
    }
  }

  if (message.type === "system") {
    return (
      <div className="flex justify-center">
        <span className="text-xs text-muted-foreground bg-accent px-3 py-1 rounded-full">
          {message.content}
        </span>
      </div>
    )
  }

  const renderMessageContent = () => {
    const msgType = (message.type as string | undefined) || "text"
    switch (msgType) {
      case "image":
        return (
          <div className="max-w-xs">
            <MediaPreview
              src={mediaUrl || "/placeholder.svg?height=200&width=300"}
              type="image"
              alt={message.content}
              className="w-full h-48"
            />
            {message.content && <p className="mt-2 text-sm">{message.content}</p>}
          </div>
        )

      case "video":
        return (
          <div className="max-w-sm">
            <MediaPreview
              src={mediaUrl || "/placeholder.svg?height=200&width=300"}
              type="video"
              className="w-full h-48"
            />
            {message.content && <p className="mt-2 text-sm">{message.content}</p>}
          </div>
        )

      case "audio":
        return (
          <div className="max-w-xs">
            <MediaPreview src={mediaUrl || ""} type="audio" className="w-full" />
            {message.content && <p className="mt-2 text-sm">{message.content}</p>}
          </div>
        )

      case "document":
        return (
          <div className="bg-accent rounded-lg p-3 max-w-xs">
            <div className="flex items-center gap-3">
              <div className="bg-primary rounded-lg p-2">
                <FileText className="h-4 w-4 text-primary-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{fileName || "Document"}</p>
                <p className="text-xs text-muted-foreground">{fileSize || "Unknown size"}</p>
              </div>
              <Button variant="ghost" size="sm">
                <Download className="h-4 w-4" />
              </Button>
            </div>
            {message.content && <p className="mt-2 text-sm">{message.content}</p>}
          </div>
        )

      case "gif":
        return (
          <div className="max-w-xs">
            <div className="relative rounded-lg overflow-hidden bg-accent">
              <img
                src={gifData?.url || mediaUrl || "/placeholder.svg?height=200&width=300"}
                alt={gifData?.title || message.content || "GIF"}
                className="w-full h-auto max-h-64 object-cover"
                loading="lazy"
              />
              {/* GIF indicator */}
              <div className="absolute top-2 left-2">
                <Badge variant="secondary" className="text-xs px-2 py-1 bg-foreground/70 text-background border-0">
                  <ImageIcon className="h-3 w-3 mr-1" />
                  GIF
                </Badge>
              </div>
              {/* GIF title overlay */}
              {gifData?.title && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-foreground/70 to-transparent p-2">
                  <p className="text-background text-xs font-medium truncate">{gifData.title}</p>
                </div>
              )}
            </div>
            {message.content && message.content !== gifData?.title && (
              <p className="mt-2 text-sm">{message.content}</p>
            )}
          </div>
        )

      default:
        return <span>{message.content}</span>
    }
  }

  const messageContent = (
    <div className={`flex gap-2 group ${(() => {
      const own = !message.is_ai && (currentUserId ? message.user_id === currentUserId : message.user_id === "current-user")
      return own ? "justify-end" : "justify-start"
    })()}`}>
      {(() => {
        const own = !message.is_ai && (currentUserId ? message.user_id === currentUserId : message.user_id === "current-user")
        return !own
      })() && (
        <Avatar className={`${isMobile ? "h-8 w-8" : "h-6 w-6"} mt-1`}>
          <AvatarImage src={message.user?.avatar_url ?? undefined} />
          <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground text-xs">
            {(message.user?.name || "U")
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </AvatarFallback>
        </Avatar>
      )}

      <div className={`max-w-xs lg:max-w-md ${(() => {
        const own = !message.is_ai && (currentUserId ? message.user_id === currentUserId : message.user_id === "current-user")
        return own ? "order-1" : ""
      })()}`}>
        {/* Message indicators */}
        <div className={`flex items-center gap-1 mb-1 ${(() => {
          const own = !message.is_ai && (currentUserId ? message.user_id === currentUserId : message.user_id === "current-user")
          return own ? "justify-end" : "justify-start"
        })()}`}>
          {isPinned && (
            <Badge variant="secondary" className="text-xs px-1 py-0">
              <Pin className="h-2 w-2 mr-1" />
              Pinned
            </Badge>
          )}
        </div>

        <div className="relative">
          <MessageReactions
            messageId={message.id}
            reactions={reactions}
            onAddReaction={handleAddReaction}
            onRemoveReaction={handleRemoveReaction}
            showPicker={showReactionPicker}
            onTogglePicker={() => setShowReactionPicker(false)}
          />

          <div
            className={`
            ${(((message.type as string | undefined) || "text") === "text") ? `${isMobile ? "px-3 py-2" : "px-4 py-2"}` : "p-1"} rounded-2xl text-sm
            ${(() => {
              const own = !message.is_ai && (currentUserId ? message.user_id === currentUserId : message.user_id === "current-user")
              const isText = (((message.type as string | undefined) || "text") === "text")
              return own
                ? `${isText ? "bg-primary text-primary-foreground" : "bg-primary/10"} rounded-br-md`
                : `${isText ? "bg-accent text-foreground" : "bg-card"} rounded-bl-md`
            })()}
          `}
            onTouchStart={handleLongPress}
            onDoubleClick={handleDoubleClick}
            onContextMenu={(e) => {
              e.preventDefault()
              setShowReactionPicker(true)
            }}
          >
            {renderMessageContent()}
          </div>

          {!isMobile && (
            <Button
              variant="ghost"
              size="sm"
              className={`absolute top-1 ${(() => {
                const own = !message.is_ai && (currentUserId ? message.user_id === currentUserId : message.user_id === "current-user")
                return own ? "-left-10" : "-right-10"
              })()} opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0 rounded-full`}
              onClick={() => setShowReactionPicker(!showReactionPicker)}
            >
              <span className="text-sm">😊</span>
            </Button>
          )}

          {/* Message Actions - Hidden on mobile, shown via swipe */}
          {!isMobile && (
            <div className={`absolute top-1 ${(() => {
              const own = !message.is_ai && (currentUserId ? message.user_id === currentUserId : message.user_id === "current-user")
              return own ? "-left-8" : "-right-8"
            })()}`}>
              <MessageActions
                messageId={message.id}
                isPinned={isPinned}
                isLiked={isLiked}
                onPin={handlePin}
                onUnpin={handleUnpin}
                onLike={handleLike}
                onUnlike={handleUnlike}
                onReply={handleReply}
                onForward={handleForward}
                onCopy={handleCopy}
                onDelete={handleDelete}
              />
            </div>
          )}
        </div>

        {/* Message footer */}
        <div className={`flex items-center gap-2 mt-1 ${(() => {
          const own = !message.is_ai && (currentUserId ? message.user_id === currentUserId : message.user_id === "current-user")
          return own ? "justify-end" : "justify-start"
        })()}`}>
          <span className="text-xs text-muted-foreground">{formatTime(createdAt)}</span>
          {likeCount > 0 && (
            <div className="flex items-center gap-1">
              <Heart className="h-3 w-3 text-destructive fill-current" />
              <span className="text-xs text-muted-foreground">{likeCount}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )

  // Wrap with swipe actions on mobile
  if (isMobile) {
    return (
      <SwipeActions
        onReply={() => handleReply(message.id)}
        onPin={isPinned ? () => handleUnpin(message.id) : () => handlePin(message.id)}
        onLike={isLiked ? () => handleUnlike(message.id) : () => handleLike(message.id)}
        onDelete={() => handleDelete(message.id)}
      >
        {messageContent}
      </SwipeActions>
    )
  }

  return messageContent
}
