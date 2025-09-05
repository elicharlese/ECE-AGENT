"use client"
import { Button } from '@/libs/design-system'
import { useHaptics } from "@/hooks/use-haptics"
import { useIsMobile } from "@/hooks/use-mobile"

interface Reaction {
  emoji: string
  count: number
  users: string[]
  hasReacted: boolean
}

interface MessageReactionsProps {
  messageId: string
  reactions: Reaction[]
  onAddReaction: (messageId: string, emoji: string) => void
  onRemoveReaction: (messageId: string, emoji: string) => void
  showPicker: boolean
  onTogglePicker: () => void
}

const REACTION_EMOJIS = [
  { emoji: "👍", label: "Like" },
  { emoji: "❤️", label: "Love" },
  { emoji: "😂", label: "Laugh" },
  { emoji: "😮", label: "Wow" },
  { emoji: "😢", label: "Sad" },
  { emoji: "😡", label: "Angry" },
]

export function MessageReactions({
  messageId,
  reactions,
  onAddReaction,
  onRemoveReaction,
  showPicker,
  onTogglePicker,
}: MessageReactionsProps) {
  const { triggerHaptic } = useHaptics()
  const isMobile = useIsMobile()

  const handleReactionClick = (emoji: string) => {
    const reaction = reactions.find((r) => r.emoji === emoji)
    if (reaction?.hasReacted) {
      onRemoveReaction(messageId, emoji)
      triggerHaptic("light")
    } else {
      onAddReaction(messageId, emoji)
      triggerHaptic("medium")
    }
    onTogglePicker()
  }

  const handleReactionBubbleClick = (emoji: string, hasReacted: boolean) => {
    if (hasReacted) {
      onRemoveReaction(messageId, emoji)
      triggerHaptic("light")
    } else {
      onAddReaction(messageId, emoji)
      triggerHaptic("medium")
    }
  }

  return (
    <div className="relative">
      {/* Reaction Picker */}
      {showPicker && (
        <div className={`absolute ${isMobile ? "bottom-full mb-2" : "top-full mt-2"} left-0 z-50`}>
          <div className="bg-white dark:bg-gray-800 rounded-full shadow-lg border border-gray-200 dark:border-gray-700 p-2 flex gap-1">
            {REACTION_EMOJIS.map(({ emoji, label }) => (
              <Button
                key={emoji}
                variant="ghost"
                size="sm"
                className="h-10 w-10 p-0 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 hover:scale-110"
                onClick={() => handleReactionClick(emoji)}
                title={label}
              >
                <span className="text-lg">{emoji}</span>
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Reaction Bubbles */}
      {reactions.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-1">
          {reactions.map(({ emoji, count, hasReacted }) => (
            <Button
              key={emoji}
              variant="ghost"
              size="sm"
              className={`h-6 px-2 py-0 rounded-full text-xs transition-all duration-200 hover:scale-105 ${
                hasReacted
                  ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
              }`}
              onClick={() => handleReactionBubbleClick(emoji, hasReacted)}
            >
              <span className="mr-1">{emoji}</span>
              <span>{count}</span>
            </Button>
          ))}
        </div>
      )}
    </div>
  )
}
