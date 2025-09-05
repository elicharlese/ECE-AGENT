"use client"

import type React from "react"

import { useState } from "react"
import { Button } from '@/libs/design-system'
import { useTouchGestures } from "@/hooks/use-touch-gestures"
import { useHaptics } from "@/hooks/use-haptics"
import { Reply, Pin, Heart, Trash2 } from "lucide-react"

interface SwipeActionsProps {
  children: React.ReactNode
  onReply?: () => void
  onPin?: () => void
  onLike?: () => void
  onDelete?: () => void
  className?: string
}

export function SwipeActions({ children, onReply, onPin, onLike, onDelete, className }: SwipeActionsProps) {
  const [swipeOffset, setSwipeOffset] = useState(0)
  const [isRevealed, setIsRevealed] = useState(false)
  const { triggerHaptic } = useHaptics()

  const handleSwipeLeft = () => {
    setIsRevealed(true)
    setSwipeOffset(-80)
    triggerHaptic("light")
  }

  const handleSwipeRight = () => {
    if (onReply) {
      onReply()
      triggerHaptic("medium")
    }
    resetSwipe()
  }

  const resetSwipe = () => {
    setIsRevealed(false)
    setSwipeOffset(0)
  }

  const { touchHandlers } = useTouchGestures({
    onSwipeLeft: handleSwipeLeft,
    onSwipeRight: handleSwipeRight,
    threshold: 30,
  })

  const handleAction = (action: () => void) => {
    action()
    triggerHaptic("medium")
    resetSwipe()
  }

  return (
    <div className={`relative overflow-hidden ${className}`} {...touchHandlers}>
      {/* Main content */}
      <div
        className="transition-transform duration-200 ease-out"
        style={{ transform: `translateX(${swipeOffset}px)` }}
        onClick={resetSwipe}
      >
        {children}
      </div>

      {/* Action buttons (revealed on swipe) */}
      {isRevealed && (
        <div className="absolute right-0 top-0 h-full flex items-center bg-gray-100 dark:bg-gray-700">
          {onLike && (
            <Button
              variant="ghost"
              size="sm"
              className="h-full px-3 rounded-none bg-red-500 hover:bg-red-600 text-white"
              onClick={() => handleAction(onLike)}
            >
              <Heart className="h-4 w-4" />
            </Button>
          )}
          {onPin && (
            <Button
              variant="ghost"
              size="sm"
              className="h-full px-3 rounded-none bg-blue-500 hover:bg-blue-600 text-white"
              onClick={() => handleAction(onPin)}
            >
              <Pin className="h-4 w-4" />
            </Button>
          )}
          {onDelete && (
            <Button
              variant="ghost"
              size="sm"
              className="h-full px-3 rounded-none bg-red-600 hover:bg-red-700 text-white"
              onClick={() => handleAction(onDelete)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      )}

      {/* Reply indicator (shown on right swipe) */}
      {onReply && (
        <div className="absolute left-0 top-0 h-full flex items-center pl-4 pointer-events-none">
          <div className="flex items-center gap-2 text-blue-500 opacity-0 transition-opacity duration-200">
            <Reply className="h-4 w-4" />
            <span className="text-sm font-medium">Reply</span>
          </div>
        </div>
      )}
    </div>
  )
}
