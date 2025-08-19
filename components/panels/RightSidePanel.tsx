"use client"

import React, { useCallback, useEffect, useRef, useState } from "react"
import { Bot, Wrench, ChevronRight } from "lucide-react"
import { AgentSidebar } from "@/components/chat/agent-sidebar"
import { MCPToolsPanel } from "@/components/mcp/mcp-tools-panel"

export type RightPanelTab = "agents" | "mcp"

interface RightSidePanelProps {
  isOpen: boolean
  onClose: () => void
  activeTab: RightPanelTab
  onTabChange: (tab: RightPanelTab) => void
  chatId: string
  // Optional: used to open the panel when showing the floating handle
  onOpen?: () => void
}

export function RightSidePanel({ isOpen, activeTab, onTabChange, onClose, chatId, onOpen }: RightSidePanelProps) {
  const [panelWidth, setPanelWidth] = useState(384);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const saved = localStorage.getItem('right_panel_width');
    if (saved) setPanelWidth(parseInt(saved));
  }, []);

  useEffect(() => {
    if (isClient) {
      const saved = localStorage.getItem('right_panel_width');
      if (saved) setPanelWidth(parseInt(saved));
    }
  }, [isClient]);

  const [isResizing, setIsResizing] = useState(false);

  const startX = useRef<number | null>(null)
  const startWidth = useRef<number>(384)

  const onMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizing || startX.current === null) return
    const delta = startX.current - e.clientX // dragging from left edge
    const next = Math.min(560, Math.max(280, startWidth.current + delta))
    setPanelWidth(next)
  }, [isResizing])

  const stopResize = useCallback(() => {
    setIsResizing(false)
    startX.current = null
    document.body.style.cursor = "auto"
    if (typeof window !== 'undefined') {
      localStorage.setItem('right_panel_width', panelWidth.toString());
    }
    document.removeEventListener("mousemove", onMouseMove)
    document.removeEventListener("mouseup", stopResize)
  }, [onMouseMove, panelWidth])

  const startResize = (e: React.MouseEvent) => {
    setIsResizing(true)
    startX.current = e.clientX
    startWidth.current = panelWidth
    document.body.style.cursor = "col-resize"
    document.addEventListener("mousemove", onMouseMove)
    document.addEventListener("mouseup", stopResize)
  }

  if (!isClient) return null

  // When closed, render a small floating handle to open the tools
  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => onOpen?.()}
        className="fixed right-3 bottom-24 z-40 group"
        aria-label="Open tools"
        title="Open tools"
      >
        <div className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-full shadow-md hover:shadow-lg hover:border-gray-300">
          <Wrench className="w-4 h-4 text-gray-600" />
          <span className="text-sm text-gray-700">Open tools</span>
        </div>
      </button>
    )
  }

  return (
    <aside
      className="relative h-full bg-white border-l border-gray-200 flex flex-col select-none"
      style={{ width: panelWidth }}
      aria-label="Right side tools panel"
    >
      {/* Resizer handle (left edge) */}
      <div
        role="separator"
        aria-orientation="vertical"
        onMouseDown={startResize}
        className="absolute left-0 top-0 h-full w-1 cursor-col-resize group"
        title="Drag to resize"
      >
        <div className="h-full w-px bg-gray-200 group-hover:bg-gray-300" />
      </div>

      {/* Header with tabs and close */}
      <div className="pl-3 pr-2 py-2 border-b border-gray-200 flex items-center justify-between">
        <div className="flex gap-2">
          <button
            onClick={() => onTabChange("agents")}
            className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              activeTab === "agents"
                ? "bg-purple-100 text-purple-700"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
            aria-pressed={activeTab === "agents"}
          >
            <Bot className="w-4 h-4" /> Agents
          </button>
          <button
            onClick={() => onTabChange("mcp")}
            className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              activeTab === "mcp"
                ? "bg-blue-100 text-blue-700"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
            aria-pressed={activeTab === "mcp"}
          >
            <Wrench className="w-4 h-4" /> MCP Tools
          </button>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={onClose}
            className="p-2 rounded-md hover:bg-gray-100"
            aria-label="Close panel"
            title="Close panel"
          >
            <ChevronRight className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Content area */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto p-4">
          {activeTab === "agents" ? (
            <AgentSidebar 
              selectedAgentId={undefined}
              onSelectAgent={(agentId) => console.log('Selected agent:', agentId)}
              collapsed={false}
              onToggleCollapse={onClose}
            />
          ) : (
            <MCPToolsPanel chatId={chatId} />
          )}
        </div>
      </div>
    </aside>
  )
}


