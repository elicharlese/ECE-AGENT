"use client"

import type React from "react"

import { useState, useRef } from "react"
import { RefreshCw } from "lucide-react"
import { useHaptics } from "@/hooks/use-haptics"

interface PullToRefreshProps {
  children: React.ReactNode
  onRefresh: () => Promise<void>
  threshold?: number
}

export function PullToRefresh({ children, onRefresh, threshold = 80 }: PullToRefreshProps) {
  const [pullDistance, setPullDistance] = useState(0)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [canRefresh, setCanRefresh] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const { triggerHaptic } = useHaptics()

  const handleTouchStart = (e: React.TouchEvent) => {
    const container = containerRef.current
    if (!container || container.scrollTop > 0) return

    const touch = e.touches[0]
    const startY = touch.clientY

    const handleTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0]
      const currentY = touch.clientY
      const distance = Math.max(0, currentY - startY)

      if (distance > 0 && container.scrollTop === 0) {
        e.preventDefault()
        setPullDistance(Math.min(distance * 0.5, threshold * 1.5))

        if (distance > threshold && !canRefresh) {
          setCanRefresh(true)
          triggerHaptic("medium")
        } else if (distance <= threshold && canRefresh) {
          setCanRefresh(false)
        }
      }
    }

    const handleTouchEnd = async () => {
      if (canRefresh && !isRefreshing) {
        setIsRefreshing(true)
        triggerHaptic("heavy")
        try {
          await onRefresh()
        } finally {
          setIsRefreshing(false)
        }
      }

      setPullDistance(0)
      setCanRefresh(false)
      document.removeEventListener("touchmove", handleTouchMove)
      document.removeEventListener("touchend", handleTouchEnd)
    }

    document.addEventListener("touchmove", handleTouchMove, { passive: false })
    document.addEventListener("touchend", handleTouchEnd)
  }

  return (
    <div ref={containerRef} className="relative h-full flex flex-col" onTouchStart={handleTouchStart}>
      {/* Pull indicator */}
      <div
        className="absolute top-0 left-0 right-0 flex items-center justify-center transition-transform duration-200 ease-out z-10"
        style={{
          transform: `translateY(${pullDistance - 60}px)`,
          opacity: pullDistance > 20 ? 1 : 0,
        }}
      >
        <div className="bg-white dark:bg-gray-800 rounded-full p-3 shadow-lg border border-gray-200 dark:border-gray-700">
          <RefreshCw
            className={`h-5 w-5 text-gray-600 dark:text-gray-300 ${
              isRefreshing ? "animate-spin" : canRefresh ? "text-blue-500" : ""
            }`}
          />
        </div>
      </div>

      {/* Content */}
      <div
        className="flex-1 overflow-y-auto hide-scrollbar pr-4 -mr-4 transition-transform duration-200 ease-out"
        style={{ transform: `translateY(${pullDistance}px)` }}
      >
        {children}
      </div>
    </div>
  )
}
