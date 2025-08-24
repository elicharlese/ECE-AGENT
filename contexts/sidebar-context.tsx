'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export type SidebarState = 'expanded' | 'minimized' | 'hidden'

interface SidebarContextType {
  leftSidebar: SidebarState
  rightSidebar: SidebarState
  leftWidth: number
  rightWidth: number
  setLeftSidebar: (state: SidebarState) => void
  setRightSidebar: (state: SidebarState) => void
  setLeftWidth: (width: number) => void
  setRightWidth: (width: number) => void
  toggleLeftSidebar: () => void
  toggleRightSidebar: () => void
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined)

const STORAGE_KEY = 'sidebar-preferences'
const DEFAULT_LEFT_WIDTH = 280
const DEFAULT_RIGHT_WIDTH = 320
const MIN_WIDTH = 200
const MAX_WIDTH = 480

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [leftSidebar, setLeftSidebarState] = useState<SidebarState>('expanded')
  const [rightSidebar, setRightSidebarState] = useState<SidebarState>('expanded')
  const [leftWidth, setLeftWidth] = useState(DEFAULT_LEFT_WIDTH)
  const [rightWidth, setRightWidth] = useState(DEFAULT_RIGHT_WIDTH)

  // Load preferences from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        const prefs = JSON.parse(stored)
        setLeftSidebarState(prefs.leftSidebar || 'expanded')
        setRightSidebarState(prefs.rightSidebar || 'expanded')
        setLeftWidth(prefs.leftWidth || DEFAULT_LEFT_WIDTH)
        setRightWidth(prefs.rightWidth || DEFAULT_RIGHT_WIDTH)
      } catch (e) {
        console.error('Failed to load sidebar preferences:', e)
      }
    }
  }, [])

  // On first load without stored prefs, default both sidebars to hidden on small screens
  useEffect(() => {
    // Avoid SSR references and avoid overriding stored preferences
    if (typeof window === 'undefined') return
    if (localStorage.getItem(STORAGE_KEY)) return
    if (window.innerWidth < 768) {
      setLeftSidebarState('hidden')
      setRightSidebarState('hidden')
    }
  }, [])

  // Save preferences to localStorage
  useEffect(() => {
    const prefs = {
      leftSidebar,
      rightSidebar,
      leftWidth,
      rightWidth,
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs))
  }, [leftSidebar, rightSidebar, leftWidth, rightWidth])

  const setLeftSidebar = (state: SidebarState) => {
    setLeftSidebarState(state)
  }

  const setRightSidebar = (state: SidebarState) => {
    setRightSidebarState(state)
  }

  const toggleLeftSidebar = () => {
    setLeftSidebarState(prev => {
      if (prev === 'expanded') return 'minimized'
      if (prev === 'minimized') return 'hidden'
      return 'expanded'
    })
  }

  const toggleRightSidebar = () => {
    setRightSidebarState(prev => {
      if (prev === 'expanded') return 'minimized'
      if (prev === 'minimized') return 'hidden'
      return 'expanded'
    })
  }

  const setLeftWidthSafe = (width: number) => {
    setLeftWidth(Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, width)))
  }

  const setRightWidthSafe = (width: number) => {
    setRightWidth(Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, width)))
  }

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Cmd/Ctrl + B: Toggle left sidebar
      if ((e.metaKey || e.ctrlKey) && e.key === 'b') {
        e.preventDefault()
        toggleLeftSidebar()
      }
      // Cmd/Ctrl + /: Toggle right sidebar
      if ((e.metaKey || e.ctrlKey) && e.key === '/') {
        e.preventDefault()
        toggleRightSidebar()
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [])

  return (
    <SidebarContext.Provider
      value={{
        leftSidebar,
        rightSidebar,
        leftWidth,
        rightWidth,
        setLeftSidebar,
        setRightSidebar,
        setLeftWidth: setLeftWidthSafe,
        setRightWidth: setRightWidthSafe,
        toggleLeftSidebar,
        toggleRightSidebar,
      }}
    >
      {children}
    </SidebarContext.Provider>
  )
}

export function useSidebar() {
  const context = useContext(SidebarContext)
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider')
  }
  return context
}
