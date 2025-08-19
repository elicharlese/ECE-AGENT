'use client'

import React, { useState, useEffect } from 'react'
import { Database, Globe, GitBranch, FileSearch, Terminal, Calculator, Settings, ChevronDown, ChevronRight, Play, Check, X, Github } from 'lucide-react'
import { cn } from '@/lib/utils'
import { mcpService } from '@/services/mcp-service'

interface MCPToolsPanelProps {
  chatId: string
}

export function MCPToolsPanel({ chatId }: MCPToolsPanelProps) {
  const [expandedCategory, setExpandedCategory] = useState<string | null>('database')
  const [executingTool, setExecutingTool] = useState<string | null>(null)
  const [results, setResults] = useState<Record<string, any>>({})
  const [tools, setTools] = useState(mcpService.getTools())
  const [gateways, setGateways] = useState(mcpService.getGateways())
  const [githubToken, setGithubToken] = useState('')
  const [isConnecting, setIsConnecting] = useState(false)

  useEffect(() => {
    // Refresh tools and gateways
    setTools(mcpService.getTools())
    setGateways(mcpService.getGateways())
  }, [])

  const categories = [
    { id: 'all', name: 'All Tools', count: 8 },
    { id: 'data', name: 'Data', count: 3 },
    { id: 'dev', name: 'Development', count: 2 },
    { id: 'utility', name: 'Utilities', count: 3 }
  ]

  const getToolIcon = (category: string) => {
    switch (category) {
      case 'database': return Database
      case 'web': return Globe
      case 'git': return GitBranch
      case 'file': return FileSearch
      case 'terminal': return Terminal
      case 'math': return Calculator
      case 'github': return Github
      default: return Globe
    }
  }

  const filteredTools = categories.find(category => category.id === expandedCategory)?.id === 'all' 
    ? tools 
    : tools.filter(tool => tool.category === expandedCategory)

  const executeTool = async (toolId: string) => {
    setExecutingTool(toolId)
    try {
      // Get appropriate params based on tool
      let params = {}
      if (toolId === 'calculator') {
        params = { expression: '2 + 2' } // Demo expression
      } else if (toolId === 'web-search') {
        params = { query: 'latest AI news' } // Demo query
      } else if (toolId === 'github-api') {
        params = { endpoint: '/user', method: 'GET' } // Demo API call
      }

      const result = await mcpService.executeTool(toolId, params)
      setResults({
        ...results,
        [toolId]: result,
      })
    } catch (error) {
      setResults({
        ...results,
        [toolId]: {
          success: false,
          error: error instanceof Error ? error.message : 'Execution failed',
        },
      })
    } finally {
      setExecutingTool(null)
    }
  }

  const toggleTool = (toolId: string, enabled: boolean) => {
    mcpService.toggleTool(toolId, enabled)
    setTools(mcpService.getTools())
  }

  const connectGitHub = async () => {
    if (!githubToken.trim()) return
    setIsConnecting(true)
    try {
      await mcpService.connectGitHub(githubToken)
      setGateways(mcpService.getGateways())
      setTools(mcpService.getTools())
      setGithubToken('')
    } catch (error) {
      console.error('Failed to connect GitHub:', error)
      alert('Failed to connect GitHub. Please check your token.')
    } finally {
      setIsConnecting(false)
    }
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center gap-2 mb-4">
        <Settings className="w-5 h-5 text-blue-600" />
        <h2 className="text-lg font-semibold">MCP Tools</h2>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 mb-4 overflow-x-auto">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setExpandedCategory(category.id)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              expandedCategory === category.id
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {category.name}
            <span className="ml-1 text-xs opacity-70">({category.count})</span>
          </button>
        ))}
      </div>

      {/* GitHub Connection Gateway */}
      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
        <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
          <Github className="w-4 h-4" />
          GitHub Gateway
        </h4>
        {gateways.find(g => g.type === 'github' && g.status === 'connected') ? (
          <div className="flex items-center justify-between">
            <span className="text-xs text-green-600 flex items-center gap-1">
              <Check className="w-3 h-3" /> Connected
            </span>
            <button
              onClick={() => {
                mcpService.disconnectGitHub()
                setGateways(mcpService.getGateways())
                setTools(mcpService.getTools())
              }}
              className="text-xs text-red-600 hover:underline"
            >
              Disconnect
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <input
              type="password"
              value={githubToken}
              onChange={(e) => setGithubToken(e.target.value)}
              placeholder="Enter GitHub personal access token"
              className="w-full px-2 py-1 text-xs border rounded"
              disabled={isConnecting}
            />
            <button
              onClick={connectGitHub}
              disabled={!githubToken.trim() || isConnecting}
              className="w-full px-2 py-1 text-xs bg-black text-white rounded hover:bg-gray-800 disabled:bg-gray-400"
            >
              {isConnecting ? 'Connecting...' : 'Connect GitHub'}
            </button>
          </div>
        )}
      </div>

      {/* Tools Grid */}
      <div className="flex-1 overflow-y-auto">
        <div className="space-y-2">
          {categories.map((category) => {
            const categoryTools = tools.filter((t) => t.category === category.id)
            const Icon = getToolIcon(category.id)

            return (
              <div key={category.id}>
                <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                  <Icon className="w-4 h-4" />
                  {category.name}
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  {categoryTools.map((tool) => {
                    const isComingSoon = false // Tools don't have status property

                    return (
                      <div
                        key={tool.id}
                        onClick={() => !isComingSoon && executeTool(tool.id)}
                        className={`p-3 rounded-lg border transition-all ${
                          isComingSoon
                            ? 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 cursor-pointer'
                        }`}
                      >
                        <div className="flex flex-col items-center text-center">
                          <div className={`p-2 rounded-lg mb-2 ${
                            isComingSoon
                              ? 'bg-gray-100'
                              : 'bg-gray-100'
                          }`}>
                            <Icon className={`w-6 h-6 ${
                              isComingSoon
                                ? 'text-gray-400'
                                : 'text-gray-600'
                            }`} />
                          </div>
                          <h3 className="text-sm font-medium text-gray-900">{tool.name}</h3>
                          {isComingSoon && (
                            <span className="mt-1 px-2 py-0.5 bg-gray-200 text-gray-500 text-xs rounded-full">
                              Coming Soon
                            </span>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>

        {/* Tool Details */}
        {executingTool && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            {(() => {
              const tool = tools.find(t => t.id === executingTool)
              if (!tool) return null
              const Icon = getToolIcon(tool.category)

              return (
                <>
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className="w-5 h-5 text-blue-600" />
                    <h3 className="font-medium text-gray-900">{tool.name}</h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{tool.description}</p>
                  <button className="w-full px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors">
                    Use Tool
                  </button>
                </>
              )
            })()}
          </div>
        )}
      </div>

      {/* Settings */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="text-xs text-gray-500 mb-2">Connected MCP Servers: 3</div>
        <button className="w-full px-4 py-2 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200 transition-colors">
          Configure MCP Tools
        </button>
      </div>
    </div>
  )
}
