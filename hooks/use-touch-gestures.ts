"use client"

import type React from "react"

import { useCallback, useRef, useState } from "react"

interface TouchGestureOptions {
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  onSwipeUp?: () => void
  onSwipeDown?: () => void
  onLongPress?: () => void
  threshold?: number
  longPressDelay?: number
}

export function useTouchGestures({
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  onLongPress,
  threshold = 50,
  longPressDelay = 500,
}: TouchGestureOptions) {
  const touchStart = useRef<{ x: number; y: number; time: number } | null>(null)
  const longPressTimer = useRef<NodeJS.Timeout | null>(null)
  const [isLongPressing, setIsLongPressing] = useState(false)

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      const touch = e.touches[0]
      touchStart.current = {
        x: touch.clientX,
        y: touch.clientY,
        time: Date.now(),
      }

      // Start long press timer
      if (onLongPress) {
        longPressTimer.current = setTimeout(() => {
          setIsLongPressing(true)
          onLongPress()
        }, longPressDelay)
      }
    },
    [onLongPress, longPressDelay],
  )

  const handleTouchMove = useCallback(() => {
    // Cancel long press if user moves finger
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
      longPressTimer.current = null
    }
  }, [])

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current)
        longPressTimer.current = null
      }

      if (isLongPressing) {
        setIsLongPressing(false)
        return
      }

      if (!touchStart.current) return

      const touch = e.changedTouches[0]
      const deltaX = touch.clientX - touchStart.current.x
      const deltaY = touch.clientY - touchStart.current.y
      const deltaTime = Date.now() - touchStart.current.time

      // Ignore if touch was too slow (likely not a swipe)
      if (deltaTime > 300) return

      const absDeltaX = Math.abs(deltaX)
      const absDeltaY = Math.abs(deltaY)

      // Determine swipe direction
      if (absDeltaX > threshold && absDeltaX > absDeltaY) {
        if (deltaX > 0) {
          onSwipeRight?.()
        } else {
          onSwipeLeft?.()
        }
      } else if (absDeltaY > threshold && absDeltaY > absDeltaX) {
        if (deltaY > 0) {
          onSwipeDown?.()
        } else {
          onSwipeUp?.()
        }
      }

      touchStart.current = null
    },
    [onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, threshold, isLongPressing],
  )

  return {
    touchHandlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
    },
    isLongPressing,
  }
}
