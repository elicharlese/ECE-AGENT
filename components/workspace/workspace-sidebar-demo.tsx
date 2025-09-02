"use client"

import { useState } from "react"
import { WorkspaceSidebar } from "./workspace-sidebar"

// Mock workspace items for testing
const mockWorkspaceItems = [
  {
    id: "1",
    type: "code" as const,
    content: "console.log('Hello, World!');",
    timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
    author: "user",
    status: "completed" as const,
    metadata: { language: "javascript" }
  },
  {
    id: "2", 
    type: "image" as const,
    content: "Generated landscape image with mountains and sunset",
    timestamp: new Date(Date.now() - 1000 * 60 * 15), // 15 minutes ago
    author: "ai",
    status: "completed" as const,
    metadata: { width: 1024, height: 768 }
  },
  {
    id: "3",
    type: "tool_execution" as const,
    content: "Web search for 'React best practices 2024'",
    timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
    author: "ai",
    status: "generating" as const,
    metadata: { tool: "web_search" }
  },
  {
    id: "4",
    type: "document" as const,
    content: "Project requirements document with feature specifications",
    timestamp: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
    author: "user",
    status: "completed" as const,
    metadata: { format: "markdown", pages: 12 }
  }
]

export function WorkspaceSidebarDemo() {
  const [panelState, setPanelState] = useState<"expanded" | "minimized" | "collapsed">("expanded")
  const [selectedAgentId, setSelectedAgentId] = useState<string>("gpt-4")
  const [activeParticipants, setActiveParticipants] = useState(3)
  const [isConnected, setIsConnected] = useState(true)

  const handleExecuteTool = (toolType: string) => {
    console.log(`Executing tool: ${toolType}`)
    // In a real app, this would trigger tool execution
  }

  const handleGenerateMedia = (type: string) => {
    console.log(`Generating media: ${type}`)
    // In a real app, this would trigger media generation
  }

  const handleSelectAgent = (agentId: string) => {
    console.log(`Selected agent: ${agentId}`)
    setSelectedAgentId(agentId)
  }

  return (
    <div className="h-screen flex">
      {/* Demo controls */}
      <div className="w-64 p-4 bg-gray-100 dark:bg-gray-800 border-r">
        <h3 className="font-semibold mb-4">Demo Controls</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Panel State</label>
            <select 
              value={panelState} 
              onChange={(e) => setPanelState(e.target.value as any)}
              className="w-full p-2 border rounded"
            >
              <option value="expanded">Expanded</option>
              <option value="minimized">Minimized</option>
              <option value="collapsed">Collapsed</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Active Participants</label>
            <input
              type="number"
              value={activeParticipants}
              onChange={(e) => setActiveParticipants(parseInt(e.target.value) || 0)}
              className="w-full p-2 border rounded"
              min="0"
              max="10"
            />
          </div>

          <div>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={isConnected}
                onChange={(e) => setIsConnected(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm">Connected</span>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Selected Agent</label>
            <select 
              value={selectedAgentId} 
              onChange={(e) => setSelectedAgentId(e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="gpt-4">GPT-4</option>
              <option value="claude-3">Claude 3</option>
              <option value="gemini">Gemini</option>
            </select>
          </div>
        </div>

        <div className="mt-6">
          <h4 className="font-medium mb-2">Test Actions</h4>
          <div className="space-y-2">
            <button 
              onClick={() => handleExecuteTool('code_interpreter')}
              className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Execute Code Tool
            </button>
            <button 
              onClick={() => handleGenerateMedia('image')}
              className="w-full p-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Generate Image
            </button>
          </div>
        </div>
      </div>

      {/* Workspace Sidebar */}
      <div className="flex-1 flex">
        <div className="flex-1 bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          <div className="text-center text-gray-500">
            <h2 className="text-xl font-semibold mb-2">Workspace Sidebar Demo</h2>
            <p>The workspace sidebar is displayed on the right →</p>
            <p className="text-sm mt-2">Use the controls on the left to test different states</p>
          </div>
        </div>
        
        <div className="w-80">
          <WorkspaceSidebar
            panelState={panelState}
            onSetPanelState={setPanelState}
            selectedAgentId={selectedAgentId}
            onSelectAgent={handleSelectAgent}
            workspaceItems={mockWorkspaceItems}
            onExecuteTool={handleExecuteTool}
            onGenerateMedia={handleGenerateMedia}
            activeParticipants={activeParticipants}
            isConnected={isConnected}
          />
        </div>
      </div>
    </div>
  )
}
