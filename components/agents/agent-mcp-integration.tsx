'use client'

import React, { useState, useEffect } from 'react'
import { Brain, Database, Code, Search, GitBranch, CreditCard, Server, AlertCircle } from 'lucide-react'

interface MCPTool {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  category: 'search' | 'database' | 'code' | 'payment' | 'thinking' | 'version-control'
  enabled: boolean
  config?: any
}

const availableMCPTools: MCPTool[] = [
  {
    id: 'brave-search',
    name: 'Brave Search',
    description: 'Web and local search capabilities',
    icon: <Search className="w-4 h-4" />,
    category: 'search',
    enabled: true
  },
  {
    id: 'linear',
    name: 'Linear',
    description: 'Project and issue management',
    icon: <Database className="w-4 h-4" />,
    category: 'database',
    enabled: true
  },
  {
    id: 'git',
    name: 'Git Integration',
    description: 'Version control operations',
    icon: <GitBranch className="w-4 h-4" />,
    category: 'version-control',
    enabled: true
  },
  {
    id: 'stripe',
    name: 'Stripe',
    description: 'Payment processing and management',
    icon: <CreditCard className="w-4 h-4" />,
    category: 'payment',
    enabled: false
  },
  {
    id: 'puppeteer',
    name: 'Browser Automation',
    description: 'Automated web browser control',
    icon: <Code className="w-4 h-4" />,
    category: 'code',
    enabled: true
  },
  {
    id: 'sequential-thinking',
    name: 'Sequential Thinking',
    description: 'Step-by-step problem solving',
    icon: <Brain className="w-4 h-4" />,
    category: 'thinking',
    enabled: true
  },
  {
    id: 'memory',
    name: 'Memory Database',
    description: 'Knowledge graph storage',
    icon: <Database className="w-4 h-4" />,
    category: 'database',
    enabled: true
  },
  {
    id: 'supabase',
    name: 'Supabase',
    description: 'Backend database operations',
    icon: <Server className="w-4 h-4" />,
    category: 'database',
    enabled: true
  }
]

interface MCPIntegrationProps {
  agentId: string
  onToolExecute: (toolId: string, params: any) => Promise<any>
}

export function AgentMCPIntegration({ agentId, onToolExecute }: MCPIntegrationProps) {
  const [tools, setTools] = useState<MCPTool[]>(availableMCPTools)
  const [activeTools, setActiveTools] = useState<string[]>([])
  const [isExecuting, setIsExecuting] = useState(false)
  const [lastExecution, setLastExecution] = useState<{
    toolId: string
    status: 'success' | 'error'
    message: string
    timestamp: Date
  } | null>(null)

  const toggleTool = (toolId: string) => {
    setTools(prev =>
      prev.map(tool =>
        tool.id === toolId ? { ...tool, enabled: !tool.enabled } : tool
      )
    )
  }

  const executeTool = async (toolId: string) => {
    setIsExecuting(true)
    setActiveTools(prev => [...prev, toolId])
    
    try {
      const result = await onToolExecute(toolId, {})
      setLastExecution({
        toolId,
        status: 'success',
        message: `${toolId} executed successfully`,
        timestamp: new Date()
      })
      return result
    } catch (error) {
      setLastExecution({
        toolId,
        status: 'error',
        message: `Failed to execute ${toolId}: ${error}`,
        timestamp: new Date()
      })
      throw error
    } finally {
      setIsExecuting(false)
      setActiveTools(prev => prev.filter(id => id !== toolId))
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'search': return 'text-blue-600 bg-blue-50'
      case 'database': return 'text-purple-600 bg-purple-50'
      case 'code': return 'text-green-600 bg-green-50'
      case 'payment': return 'text-yellow-600 bg-yellow-50'
      case 'thinking': return 'text-pink-600 bg-pink-50'
      case 'version-control': return 'text-gray-600 bg-gray-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">MCP Tools</h3>
        <div className="flex items-center gap-2">
          {isExecuting && (
            <div className="flex items-center gap-2 text-sm text-blue-600">
              <div className="animate-spin w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full" />
              Executing...
            </div>
          )}
          <span className="text-sm text-gray-500">
            {tools.filter(t => t.enabled).length} / {tools.length} enabled
          </span>
        </div>
      </div>

      {lastExecution && (
        <div className={`p-3 rounded-lg border ${
          lastExecution.status === 'success' 
            ? 'bg-green-50 border-green-200 text-green-700'
            : 'bg-red-50 border-red-200 text-red-700'
        }`}>
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm">{lastExecution.message}</span>
          </div>
        </div>
      )}

      <div className="grid gap-2">
        {tools.map(tool => (
          <div
            key={tool.id}
            className={`p-3 rounded-lg border transition-all ${
              tool.enabled 
                ? 'border-blue-200 bg-white' 
                : 'border-gray-200 bg-gray-50 opacity-60'
            } ${activeTools.includes(tool.id) ? 'ring-2 ring-blue-500' : ''}`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <div className={`p-1 rounded ${getCategoryColor(tool.category)}`}>
                    {tool.icon}
                  </div>
                  <h4 className="font-medium">{tool.name}</h4>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${getCategoryColor(tool.category)}`}>
                    {tool.category}
                  </span>
                </div>
                <p className="text-sm text-gray-600">{tool.description}</p>
              </div>
              <button
                onClick={() => toggleTool(tool.id)}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  tool.enabled
                    ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {tool.enabled ? 'Enabled' : 'Disabled'}
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="pt-4 border-t">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Quick Actions</h4>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => executeTool('brave-search')}
            disabled={!tools.find(t => t.id === 'brave-search')?.enabled || isExecuting}
            className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Search Web
          </button>
          <button
            onClick={() => executeTool('sequential-thinking')}
            disabled={!tools.find(t => t.id === 'sequential-thinking')?.enabled || isExecuting}
            className="px-3 py-1.5 text-sm bg-pink-600 text-white rounded-md hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Analyze Problem
          </button>
          <button
            onClick={() => executeTool('memory')}
            disabled={!tools.find(t => t.id === 'memory')?.enabled || isExecuting}
            className="px-3 py-1.5 text-sm bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Access Memory
          </button>
        </div>
      </div>
    </div>
  )
}
