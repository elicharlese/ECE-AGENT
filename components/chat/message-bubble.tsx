"use client"

import { useEffect, useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { MediaPreview } from "./media-preview"
import { MessageActions } from "./message-actions"
import { SwipeActions } from "./swipe-actions"
import { Button } from "@/components/ui/button"
import { Download, FileText, Pin, Heart, ImageIcon, Copy } from "lucide-react"
import { useHaptics } from "@/hooks/use-haptics"
import { useIsMobile } from "@/hooks/use-mobile"
import { MessageReactions } from "./message-reactions"
import ReactMarkdown from "react-markdown"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism"
import { Textarea } from "@/components/ui/textarea"

interface Message {
  id: string
  content: string
  timestamp: Date
  senderId: string
  senderName: string
  type: "text" | "image" | "video" | "audio" | "document" | "system" | "gif" | "app"
  isOwn: boolean
  mediaUrl?: string
  fileName?: string
  fileSize?: string
  isPinned?: boolean
  isLiked?: boolean
  likeCount?: number
  reactions?: Array<{
    emoji: string
    count: number
    users: string[]
    hasReacted: boolean
  }>
  gifData?: {
    id: string
    title: string
    url: string
    preview_url: string
    width: number
    height: number
  }
}

interface MessageBubbleProps {
  message: Message
  onUpdateMessage?: (id: string, content: string) => Promise<void> | void
}

export function MessageBubble({ message, onUpdateMessage }: MessageBubbleProps) {
  const [isPinned, setIsPinned] = useState(message.isPinned || false)
  const [isLiked, setIsLiked] = useState(message.isLiked || false)
  const [likeCount, setLikeCount] = useState(message.likeCount || 0)
  const [reactions, setReactions] = useState(message.reactions || [])
  const [showReactionPicker, setShowReactionPicker] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(message.content)
  const [saving, setSaving] = useState(false)
  const { triggerHaptic } = useHaptics()
  const isMobile = useIsMobile()

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
      if (existingReaction) {
        return prev.map((r) => (r.emoji === emoji ? { ...r, count: r.count + 1, hasReacted: true } : r))
      } else {
        return [...prev, { emoji, count: 1, users: ["current-user"], hasReacted: true }]
      }
    })
    console.log("Adding reaction:", emoji, "to message:", messageId)
  }

  const handleRemoveReaction = (messageId: string, emoji: string) => {
    setReactions((prev) => {
      return prev
        .map((r) => (r.emoji === emoji ? { ...r, count: Math.max(0, r.count - 1), hasReacted: false } : r))
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
      // Quick reaction with heart
      handleAddReaction(message.id, "❤️")
    }
  }

  // Keep edit value in sync if the parent updates the message content (optimistic update)
  useEffect(() => {
    if (!isEditing) setEditValue(message.content)
  }, [message.content, isEditing])

  const handleEditSave = async () => {
    if (!onUpdateMessage) return setIsEditing(false)
    const trimmed = editValue.trim()
    if (!trimmed) return // do not allow empty save
    try {
      setSaving(true)
      await onUpdateMessage(message.id, trimmed)
      setIsEditing(false)
      triggerHaptic("success")
    } finally {
      setSaving(false)
    }
  }

  const handleEditCancel = () => {
    setEditValue(message.content)
    setIsEditing(false)
    triggerHaptic("selection")
  }

  if (message.type === "system") {
    return (
      <div className="flex justify-center">
        <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
          {message.content}
        </span>
      </div>
    )
  }

  // Markdown renderer with code block copy support
  const CodeRenderer = ({ inline, className, children }: { inline?: boolean; className?: string; children: any }) => {
    const [copied, setCopied] = useState(false)
    const txt = Array.isArray(children) ? children.join("") : String(children)
    const match = /language-(\w+)/.exec(className || "")

    if (inline) {
      return <code className="px-1 py-0.5 rounded bg-gray-200 dark:bg-gray-700 text-[0.85em]">{children}</code>
    }

    const handleCopy = async () => {
      try {
        await navigator.clipboard.writeText(txt)
        setCopied(true)
        setTimeout(() => setCopied(false), 1200)
      } catch (e) {
        console.error("Copy failed", e)
      }
    }

    return (
      <div className="relative group">
        <button
          type="button"
          onClick={handleCopy}
          className="absolute right-2 top-2 z-10 text-xs bg-black/60 text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label="Copy code"
        >
          {copied ? "Copied" : <span className="inline-flex items-center gap-1"><Copy className="h-3 w-3" /> Copy</span>}
        </button>
        <SyntaxHighlighter
          language={(match && match[1]) || undefined}
          style={oneDark as any}
          customStyle={{ margin: 0, borderRadius: 8, padding: "12px" }}
          wrapLongLines
        >
          {txt.replace(/\n$/, "")}
        </SyntaxHighlighter>
      </div>
    )
  }

  const renderMessageContent = () => {
    switch (message.type) {
      case "image":
        return (
          <div className="max-w-xs">
            <MediaPreview
              src={message.mediaUrl || "/placeholder.svg?height=200&width=300"}
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
              src={message.mediaUrl || "/placeholder.svg?height=200&width=300"}
              type="video"
              className="w-full h-48"
            />
            {message.content && <p className="mt-2 text-sm">{message.content}</p>}
          </div>
        )

      case "audio":
        return (
          <div className="max-w-xs">
            <MediaPreview src={message.mediaUrl || ""} type="audio" className="w-full" />
            {message.content && <p className="mt-2 text-sm">{message.content}</p>}
          </div>
        )

      case "document":
        return (
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 max-w-xs">
            <div className="flex items-center gap-3">
              <div className="bg-blue-500 rounded-lg p-2">
                <FileText className="h-4 w-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{message.fileName || "Document"}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{message.fileSize || "Unknown size"}</p>
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
            <div className="relative rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
              <img
                src={message.gifData?.url || message.mediaUrl || "/placeholder.svg?height=200&width=300"}
                alt={message.gifData?.title || message.content || "GIF"}
                className="w-full h-auto max-h-64 object-cover"
                loading="lazy"
              />
              {/* GIF indicator */}
              <div className="absolute top-2 left-2">
                <Badge variant="secondary" className="text-xs px-2 py-1 bg-black/70 text-white border-0">
                  <ImageIcon className="h-3 w-3 mr-1" />
                  GIF
                </Badge>
              </div>
              {/* GIF title overlay */}
              {message.gifData?.title && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                  <p className="text-white text-xs font-medium truncate">{message.gifData.title}</p>
                </div>
              )}
            </div>
            {message.content && message.content !== message.gifData?.title && (
              <p className="mt-2 text-sm">{message.content}</p>
            )}
          </div>
        )

      default:
        if (isEditing && message.isOwn) {
          return (
            <div className="space-y-2">
              <Textarea
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                rows={Math.min(8, Math.max(2, Math.ceil(editValue.length / 40)))}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    void handleEditSave()
                  } else if (e.key === "Escape") {
                    e.preventDefault()
                    handleEditCancel()
                  }
                }}
                className="min-h-[60px] text-sm"
                aria-label="Edit message"
                autoFocus
              />
              <div className={`flex items-center gap-2 ${message.isOwn ? "justify-end" : "justify-start"}`}>
                <Button size="sm" onClick={() => void handleEditSave()} disabled={saving || !editValue.trim()}>
                  Save
                </Button>
                <Button size="sm" variant="ghost" onClick={handleEditCancel} disabled={saving}>
                  Cancel
                </Button>
              </div>
            </div>
          )
        }
        return (
          <div className="whitespace-pre-wrap break-words text-sm leading-5">
            <ReactMarkdown
              // Only transform code; keep other elements simple
              components={{
                code: CodeRenderer as any,
                a: ({ href, children }) => (
                  <a href={href} target="_blank" rel="noopener noreferrer" className="underline text-blue-600 dark:text-blue-400">
                    {children}
                  </a>
                ),
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>
        )
    }
  }

  const messageContent = (
    <div className={`flex gap-2 group ${message.isOwn ? "justify-end" : "justify-start"}`}>
      {!message.isOwn && (
        <Avatar className={`${isMobile ? "h-8 w-8" : "h-6 w-6"} mt-1`}>
          <AvatarImage />
          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xs">
            {message.senderName
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </AvatarFallback>
        </Avatar>
      )}

      <div className={`max-w-xs lg:max-w-md ${message.isOwn ? "order-1" : ""}`}>
        {/* Message indicators */}
        <div className={`flex items-center gap-1 mb-1 ${message.isOwn ? "justify-end" : "justify-start"}`}>
          {isPinned && (
            <Badge variant="secondary" className="text-xs px-1 py-0">
              <Pin className="h-2 w-2 mr-1" />
              Pinned
            </Badge>
          )}
        </div>

        <div className="relative">
          {/* MessageReactions moved above the message content */}
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
            ${message.type === "text" ? `${isMobile ? "px-3 py-2" : "px-4 py-2"}` : "p-1"} rounded-2xl text-sm
            ${
              message.isOwn
                ? `${message.type === "text" ? "bg-blue-500 text-white" : "bg-blue-50 dark:bg-blue-900/20"} rounded-br-md`
                : `${message.type === "text" ? "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white" : "bg-white dark:bg-gray-800"} rounded-bl-md`
            }
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
              className={`absolute top-1 ${message.isOwn ? "-left-10" : "-right-10"} opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0 rounded-full`}
              onClick={() => setShowReactionPicker(!showReactionPicker)}
            >
              <span className="text-sm">😊</span>
            </Button>
          )}

          {/* Message Actions - Hidden on mobile, shown via swipe */}
          {!isMobile && (
            <div className={`absolute top-1 ${message.isOwn ? "-left-8" : "-right-8"}`}>
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
                onEdit={message.isOwn && message.type === "text" && onUpdateMessage ? () => setIsEditing(true) : undefined}
              />
            </div>
          )}
        </div>

        {/* Message footer */}
        <div className={`flex items-center gap-2 mt-1 ${message.isOwn ? "justify-end" : "justify-start"}`}>
          <span className="text-xs text-gray-500 dark:text-gray-400">{formatTime(message.timestamp)}</span>
          {likeCount > 0 && (
            <div className="flex items-center gap-1">
              <Heart className="h-3 w-3 text-red-500 fill-current" />
              <span className="text-xs text-gray-500 dark:text-gray-400">{likeCount}</span>
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
