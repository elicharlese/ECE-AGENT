'use client'

import React, { ReactNode, useRef, useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useSidebar, SidebarState } from '@/contexts/sidebar-context'

interface CollapsibleSidebarProps {
  side: 'left' | 'right'
  children: ReactNode
  className?: string
  minimizedContent?: ReactNode
}

export function CollapsibleSidebar({
  side,
  children,
  className,
  minimizedContent,
}: CollapsibleSidebarProps) {
  const {
    leftSidebar,
    rightSidebar,
    leftWidth,
    rightWidth,
    setLeftSidebar,
    setRightSidebar,
    setLeftWidth,
    setRightWidth,
  } = useSidebar()

  const state = side === 'left' ? leftSidebar : rightSidebar
  const width = side === 'left' ? leftWidth : rightWidth
  const setState = side === 'left' ? setLeftSidebar : setRightSidebar
  const setWidth = side === 'left' ? setLeftWidth : setRightWidth

  const sidebarRef = useRef<HTMLDivElement>(null)
  const [isResizing, setIsResizing] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // Check for mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Handle resize
  const handleMouseDown = (e: React.MouseEvent) => {
    if (state !== 'expanded') return
    e.preventDefault()
    setIsResizing(true)
  }

  useEffect(() => {
    if (!isResizing) return

    const handleMouseMove = (e: MouseEvent) => {
      if (!sidebarRef.current) return
      
      const newWidth = side === 'left'
        ? e.clientX
        : window.innerWidth - e.clientX
      
      setWidth(newWidth)
    }

    const handleMouseUp = () => {
      setIsResizing(false)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isResizing, side, setWidth])

  // Toggle state
  const toggleState = () => {
    if (state === 'expanded') setState('minimized')
    else if (state === 'minimized') setState('hidden')
    else setState('expanded')
  }

  // Calculate styles based on state
  const getStyles = () => {
    if (isMobile) {
      return {
        width: state === 'hidden' ? 0 : '100%',
        position: 'fixed' as const,
        height: '100%',
        zIndex: state === 'hidden' ? -1 : 50,
      }
    }

    switch (state) {
      case 'expanded':
        return { width: `${width}px` }
      case 'minimized':
        return { width: '64px' }
      case 'hidden':
        // On desktop, keep a thin rail visible so the panel is discoverable
        // and the toggle remains reachable.
        return { width: '12px', overflow: 'visible' as const }
      default:
        return {}
    }
  }

  return (
    <div
      ref={sidebarRef}
      className={cn(
        'relative flex-shrink-0 transition-all duration-300 ease-in-out',
        'bg-background border-r',
        side === 'right' && 'border-l border-r-0',
        isResizing && 'transition-none',
        className
      )}
      style={getStyles()}
    >
      {/* Toggle Button */}
      <button
        onClick={toggleState}
        className={cn(
          // Higher z-index to stay above main content
          'absolute z-50 p-1.5 bg-background border rounded-md shadow-sm',
          'hover:bg-accent transition-colors',
          // When hidden on desktop, keep the toggle closer to the rail
          state === 'hidden'
            ? (side === 'left' ? '-right-3 top-3' : '-left-3 top-3')
            : (side === 'left' ? '-right-10 top-3' : '-left-10 top-3')
        )}
        aria-label={`Toggle ${side} sidebar`}
      >
        {state === 'hidden' ? (
          <Menu className="h-4 w-4" />
        ) : state === 'minimized' ? (
          side === 'left' ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )
        ) : (
          side === 'left' ? (
            <ChevronLeft className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )
        )}
      </button>

      {/* Resize Handle */}
      {state === 'expanded' && !isMobile && (
        <div
          className={cn(
            'absolute top-0 w-1 h-full cursor-col-resize hover:bg-primary/20',
            'transition-colors z-20',
            side === 'left' ? 'right-0' : 'left-0'
          )}
          onMouseDown={handleMouseDown}
        />
      )}

      {/* Content */}
      <div className="w-full h-full overflow-hidden">
        {state === 'minimized' && minimizedContent ? (
          <div className="p-2">{minimizedContent}</div>
        ) : state === 'expanded' ? (
          <div className="w-full h-full overflow-y-auto">{children}</div>
        ) : null}
      </div>

      {/* Mobile Overlay */}
      {isMobile && state !== 'hidden' && (
        <button
          onClick={() => setState('hidden')}
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          aria-label="Close sidebar"
        />
      )}
    </div>
  )
}

// Sidebar trigger for mobile
export function SidebarTrigger({ side }: { side: 'left' | 'right' }) {
  const { setLeftSidebar, setRightSidebar } = useSidebar()
  const setState = side === 'left' ? setLeftSidebar : setRightSidebar

  return (
    <button
      onClick={() => setState('expanded')}
      className="p-2 md:hidden"
      aria-label={`Open ${side} sidebar`}
    >
      <Menu className="h-5 w-5" />
    </button>
  )
}
