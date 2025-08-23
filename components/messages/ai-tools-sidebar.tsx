'use client'

import { useState } from 'react'
import { X, Bot, Wrench, Sparkles, Code, Database, Globe, Zap } from 'lucide-react'

interface AiToolsSidebarProps {
  tab: 'agents' | 'mcp'
  onTabChange: (tab: 'agents' | 'mcp') => void
  onClose: () => void
  conversationId: string | null
}

const aiAgents = [
  {
    id: 'gpt4',
    name: 'GPT-4',
    description: 'Advanced reasoning and analysis',
    icon: '🧠',
    color: 'purple'
  },
  {
    id: 'claude3',
    name: 'Claude 3',
    description: 'Creative writing and coding',
    icon: '✍️',
    color: 'blue'
  },
  {
    id: 'gemini',
    name: 'Gemini Pro',
    description: 'Multimodal understanding',
    icon: '👁️',
    color: 'green'
  },
  {
    id: 'llama',
    name: 'Llama 3',
    description: 'Fast and efficient responses',
    icon: '🦙',
    color: 'orange'
  }
]

const mcpTools = [
  {
    id: 'github',
    name: 'GitHub MCP',
    description: 'Repository management & code review',
    icon: <Code className="w-5 h-5" />,
    status: 'connected'
  },
  {
    id: 'database',
    name: 'Database Tools',
    description: 'SQL operations & data management',
    icon: <Database className="w-5 h-5" />,
    status: 'available'
  },
  {
    id: 'api',
    name: 'API Connector',
    description: 'External service integration',
    icon: <Globe className="w-5 h-5" />,
    status: 'available'
  },
  {
    id: 'automation',
    name: 'Automation Tools',
    description: 'Workflow automation & scripting',
    icon: <Zap className="w-5 h-5" />,
    status: 'connected'
  }
]

export function AiToolsSidebar({
  tab,
  onTabChange,
  onClose,
  conversationId
}: AiToolsSidebarProps) {
  const [selectedAgent, setSelectedAgent] = useState<string | null>('gpt4')
  const [selectedTools, setSelectedTools] = useState<string[]>(['github', 'automation'])

  const toggleTool = (toolId: string) => {
    setSelectedTools(prev =>
      prev.includes(toolId)
        ? prev.filter(id => id !== toolId)
        : [...prev, toolId]
    )
  }

  return (
    <div className="w-80 bg-white border-l flex flex-col">
      {/* Header */}
      <div className="p-4 border-b flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">AI & Tools</h3>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b">
        <button
          onClick={() => onTabChange('agents')}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${
            tab === 'agents'
              ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          }`}
        >
          <Bot className="w-4 h-4 inline mr-2" />
          AI Agents
        </button>
        <button
          onClick={() => onTabChange('mcp')}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${
            tab === 'mcp'
              ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          }`}
        >
          <Wrench className="w-4 h-4 inline mr-2" />
          MCP Tools
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {tab === 'agents' ? (
          <div className="space-y-3">
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-3">
                Select an AI model for this conversation
              </p>
            </div>
            {aiAgents.map((agent) => (
              <button
                key={agent.id}
                onClick={() => setSelectedAgent(agent.id)}
                className={`w-full p-3 border rounded-lg transition-all ${
                  selectedAgent === agent.id
                    ? 'border-purple-500 bg-purple-50 shadow-sm'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="text-2xl">{agent.icon}</div>
                  <div className="flex-1 text-left">
                    <h4 className={`font-medium ${
                      selectedAgent === agent.id ? 'text-purple-900' : 'text-gray-900'
                    }`}>
                      {agent.name}
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">
                      {agent.description}
                    </p>
                  </div>
                  {selectedAgent === agent.id && (
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                  )}
                </div>
              </button>
            ))}
            
            <div className="mt-6 p-3 bg-purple-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-medium text-purple-900">
                  Model Settings
                </span>
              </div>
              <div className="space-y-2">
                <label className="flex items-center justify-between text-sm">
                  <span className="text-gray-700">Temperature</span>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    defaultValue="70"
                    className="w-24"
                  />
                </label>
                <label className="flex items-center justify-between text-sm">
                  <span className="text-gray-700">Max tokens</span>
                  <select className="px-2 py-1 border rounded text-xs">
                    <option>2048</option>
                    <option>4096</option>
                    <option>8192</option>
                  </select>
                </label>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-3">
                Enable tools for enhanced capabilities
              </p>
            </div>
            {mcpTools.map((tool) => (
              <button
                key={tool.id}
                onClick={() => toggleTool(tool.id)}
                className={`w-full p-3 border rounded-lg transition-all ${
                  selectedTools.includes(tool.id)
                    ? 'border-blue-500 bg-blue-50 shadow-sm'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${
                    selectedTools.includes(tool.id) ? 'bg-blue-100' : 'bg-gray-100'
                  }`}>
                    {tool.icon}
                  </div>
                  <div className="flex-1 text-left">
                    <div className="flex items-center gap-2">
                      <h4 className={`font-medium ${
                        selectedTools.includes(tool.id) ? 'text-blue-900' : 'text-gray-900'
                      }`}>
                        {tool.name}
                      </h4>
                      {tool.status === 'connected' && (
                        <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full">
                          Connected
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {tool.description}
                    </p>
                  </div>
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                    selectedTools.includes(tool.id)
                      ? 'bg-blue-500 border-blue-500'
                      : 'border-gray-300'
                  }`}>
                    {selectedTools.includes(tool.id) && (
                      <svg className="w-3 h-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </div>
              </button>
            ))}
            
            <div className="mt-6 p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Wrench className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">
                  Active Tools: {selectedTools.length}
                </span>
              </div>
              <p className="text-xs text-gray-600">
                Selected tools will be available to the AI assistant in this conversation
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t bg-gray-50">
        <button className="w-full px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:from-purple-600 hover:to-blue-600 transition-colors font-medium">
          Apply Settings
        </button>
      </div>
    </div>
  )
}
