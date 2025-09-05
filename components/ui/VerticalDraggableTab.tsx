"use client"

import React, { useCallback, useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"
import {
  Label
} from '@/libs/design-system';

export type VerticalDraggableTabProps = React.ComponentPropsWithoutRef<"button"> & {
  ariaLabel: string
  icon: React.ReactNode
  storageKey: string
  side?: "right" | "left"
  initialTopPercent?: number // 0..100
}

// A small icon-only tab pinned to the viewport edge that can be dragged vertically.
// Position is stored as a percentage of viewport height in localStorage for persistence.
export const VerticalDraggableTab = React.forwardRef<HTMLButtonElement, VerticalDraggableTabProps>(
  function VerticalDraggableTab(
    {
      ariaLabel,
      icon,
      storageKey,
      side = "right",
      initialTopPercent = 50,
      className,
      onClick: restOnClick,
      onMouseDown: restOnMouseDown,
      onTouchStart: restOnTouchStart,
      style: restStyle,
      ...rest
    },
    ref,
  ) {
    const [topPct, setTopPct] = useState<number>(initialTopPercent)
    const [dragging, setDragging] = useState(false)
    const startYRef = useRef<number | null>(null)
    const wasDraggedRef = useRef<boolean>(false)

    // Load saved position
    useEffect(() => {
      try {
        const raw = localStorage.getItem(storageKey)
        if (raw != null) {
          const v = Number(raw)
          if (!Number.isNaN(v)) setTopPct(Math.min(95, Math.max(5, v)))
        }
      } catch {}
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    // Save on change
    useEffect(() => {
      try {
        localStorage.setItem(storageKey, String(topPct))
      } catch {}
    }, [storageKey, topPct])

    const clampPct = (yPct: number) => Math.min(95, Math.max(5, yPct))

    const startDragMouse = useCallback(
      (e: React.MouseEvent<HTMLButtonElement>) => {
        // Do not prevent default; allow DrawerTrigger to receive events.
        wasDraggedRef.current = false
        startYRef.current = e.clientY
        setDragging(true)
        restOnMouseDown?.(e)
      },
      [restOnMouseDown],
    )

    const startDragTouch = useCallback(
      (e: React.TouchEvent<HTMLButtonElement>) => {
        wasDraggedRef.current = false
        if (e.touches && e.touches.length > 0) {
          startYRef.current = e.touches[0].clientY
        }
        setDragging(true)
        restOnTouchStart?.(e)
      },
      [restOnTouchStart],
    )

    const endDrag = useCallback(() => {
      setDragging(false)
    }, [])

    const handleMove = useCallback((clientY: number) => {
      const pct = (clientY / window.innerHeight) * 100
      setTopPct((prev) => clampPct(pct))
      if (startYRef.current != null) {
        const dy = Math.abs(clientY - startYRef.current)
        if (dy > 5) wasDraggedRef.current = true
      }
    }, [])

    // Mouse events on document while dragging
    useEffect(() => {
      if (!dragging) return

      const onMouseMove = (e: MouseEvent) => handleMove(e.clientY)
      const onMouseUp = () => endDrag()

      const onTouchMove = (e: TouchEvent) => {
        if (e.touches && e.touches.length > 0) handleMove(e.touches[0].clientY)
      }
      const onTouchEnd = () => endDrag()

      document.addEventListener("mousemove", onMouseMove)
      document.addEventListener("mouseup", onMouseUp)
      document.addEventListener("touchmove", onTouchMove, { passive: false })
      document.addEventListener("touchend", onTouchEnd)

      return () => {
        document.removeEventListener("mousemove", onMouseMove)
        document.removeEventListener("mouseup", onMouseUp)
        document.removeEventListener("touchmove", onTouchMove)
        document.removeEventListener("touchend", onTouchEnd)
      }
    }, [dragging, endDrag, handleMove])

    const onKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
      if (e.key === "ArrowUp") {
        e.preventDefault()
        setTopPct((v) => clampPct(v - 2))
      } else if (e.key === "ArrowDown") {
        e.preventDefault()
        setTopPct((v) => clampPct(v + 2))
      }
    }

    const onClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      // Suppress click if a drag just occurred to avoid toggling drawers accidentally.
      if (wasDraggedRef.current) {
        e.preventDefault()
        e.stopPropagation()
        wasDraggedRef.current = false
        return
      }
      // Pass click through to parent (e.g., Vaul DrawerTrigger)
      restOnClick?.(e)
    }

    const sideClasses = side === "right" ? "right-0 rounded-l-md" : "left-0 rounded-r-md"

    return (
      <button
        {...rest}
        ref={ref}
        type="button"
        aria-label={ariaLabel}
        title={ariaLabel}
        onMouseDown={startDragMouse}
        onTouchStart={startDragTouch}
        onClick={onClick}
        onKeyDown={onKeyDown}
        className={cn(
          "fixed z-50 bg-indigo-600 text-white shadow hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500",
          "flex items-center justify-center h-10 w-10 cursor-grab active:cursor-grabbing",
          sideClasses,
          className,
        )}
        style={{ ...(restStyle || {}), top: `${topPct}%`, transform: "translateY(-50%)" }}
      >
        {icon}
      </button>
    )
  },
)
