'use client'

import { AiToolsSidebar } from '@/components/ai/ai-panel-sidebar'
import { Bot, Wrench, X } from 'lucide-react'
import { useState } from 'react'

export default function MessagesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [showAiPanel, setShowAiPanel] = useState(false)
  const [activeTab, setActiveTab] = useState<'agents' | 'mcp'>('agents')

  const handleToggle = (tab: 'agents' | 'mcp') => {
    if (showAiPanel && activeTab === tab) {
      setShowAiPanel(false)
    } else {
      setActiveTab(tab)
      setShowAiPanel(true)
    }
  }

  return (
    <div className="flex h-screen w-full">
      <div className="flex-1 flex">
        {children}
      </div>
      
      {/* Right Rail - Collapsed by default */}
      <div className="flex">
        {showAiPanel && (
          <div className="w-80 border-l border-gray-200 bg-white">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-semibold">
                {activeTab === 'agents' ? 'AI Agents' : 'MCP Tools'}
              </h3>
              <button
                onClick={() => setShowAiPanel(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <AiToolsSidebar activeTab={activeTab} />
          </div>
        )}
        
        {/* Toggle buttons */}
        <div className="flex flex-col gap-2 p-2 bg-gray-50 border-l">
          <button
            onClick={() => handleToggle('agents')}
            className={`p-2 rounded hover:bg-gray-200 transition-colors ${
              showAiPanel && activeTab === 'agents' ? 'bg-gray-200' : ''
            }`}
            title="AI Agents"
          >
            <Bot className="w-5 h-5" />
          </button>
          <button
            onClick={() => handleToggle('mcp')}
            className={`p-2 rounded hover:bg-gray-200 transition-colors ${
              showAiPanel && activeTab === 'mcp' ? 'bg-gray-200' : ''
            }`}
            title="MCP Tools"
          >
            <Wrench className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}
