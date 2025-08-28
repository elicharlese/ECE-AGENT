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
  const [results, setResults] = useState<Record<string, unknown>>({})
  const [tools, setTools] = useState(mcpService.getTools())
  const [gateways, setGateways] = useState(mcpService.getGateways())
  const [githubToken, setGithubToken] = useState('')
  const [isConnecting, setIsConnecting] = useState(false)
  const [mcpEvents, setMcpEvents] = useState<string[]>([])
  const [mcpStatus, setMcpStatus] = useState(() => mcpService.getMcpStatus?.() ?? { connected: false, sessionId: null, streaming: false, lastEventAt: null })
  const [presetInputs, setPresetInputs] = useState({
    owner: '',
    repo: '',
    base: 'main',
    head: '',
    title: '',
    body: '',
    filePath: '',
    ref: 'main',
  })

  useEffect(() => {
    // Refresh tools and gateways
    setTools(mcpService.getTools())
    setGateways(mcpService.getGateways())
    setMcpStatus(prev => mcpService.getMcpStatus?.() ?? prev)

    // Subscribe to MCP streaming events
    const handler = (evt: string) => {
      setMcpEvents(prev => [...prev, evt].slice(-200))
      // Update status with last event time
      setMcpStatus(prev => mcpService.getMcpStatus?.() ?? prev)
    }
    mcpService.onMcpEvent(handler)
    const interval = setInterval(() => {
      setMcpStatus(prev => mcpService.getMcpStatus?.() ?? prev)
    }, 5000)
    return () => {
      mcpService.offMcpEvent(handler)
      clearInterval(interval)
    }
  }, [])

  const categories = [
    { id: 'database', name: 'Database', count: tools.filter(t => t.category === 'database').length },
    { id: 'web', name: 'Web', count: tools.filter(t => t.category === 'web').length },
    { id: 'git', name: 'Git', count: tools.filter(t => t.category === 'git').length },
    { id: 'file', name: 'File', count: tools.filter(t => t.category === 'file').length },
    { id: 'terminal', name: 'Terminal', count: tools.filter(t => t.category === 'terminal').length },
    { id: 'math', name: 'Math', count: tools.filter(t => t.category === 'math').length },
    { id: 'github', name: 'GitHub', count: tools.filter(t => t.category === 'github').length },
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

  const filteredTools = tools.filter(tool => !expandedCategory || tool.category === expandedCategory)

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
      } else if (toolId === 'github-mcp') {
        params = { request: { type: 'ping', ts: Date.now() } }
      }

      const result = await mcpService.executeTool(toolId, params)
      setResults(prev => ({
        ...prev,
        [toolId]: result,
      }))
    } catch (error) {
      setResults(prev => ({
        ...prev,
        [toolId]: {
          success: false,
          error: error instanceof Error ? error.message : 'Execution failed',
        },
      }))
    } finally {
      setExecutingTool(null)
    }
  }

  const execPreset = async (action: 'list_repos' | 'open_pr' | 'review_file') => {
    const request = (() => {
      switch (action) {
        case 'list_repos':
          return { action: 'list_repos' }
        case 'open_pr':
          return {
            action: 'open_pr',
            params: {
              owner: presetInputs.owner,
              repo: presetInputs.repo,
              base: presetInputs.base,
              head: presetInputs.head,
              title: presetInputs.title,
              body: presetInputs.body,
            },
          }
        case 'review_file':
          return {
            action: 'review_file',
            params: {
              owner: presetInputs.owner,
              repo: presetInputs.repo,
              path: presetInputs.filePath,
              ref: presetInputs.ref,
            },
          }
      }
    })()
    setExecutingTool('github-mcp')
    try {
      const result = await mcpService.executeTool('github-mcp', { request })
      setResults(prev => ({ ...prev, ['github-mcp']: result }))
    } catch (error) {
      setResults(prev => ({
        ...prev,
        ['github-mcp']: { success: false, error: error instanceof Error ? error.message : 'Preset failed' },
      }))
    } finally {
      setExecutingTool(null)
    }
  }

  const formatLastEvent = (ts: number | null) => {
    if (!ts) return '—'
    const diff = Date.now() - ts
    const s = Math.floor(diff / 1000)
    if (s < 60) return `${s}s ago`
    const m = Math.floor(s / 60)
    if (m < 60) return `${m}m ago`
    const h = Math.floor(m / 60)
    return `${h}h ago`
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
        <p className="text-xs text-gray-500 mb-2">
          Tip: For presets like Open PR or Review File, use a PAT with <span className="font-medium">repo</span> scope. Read-only actions may work with minimal scopes.
        </p>
        {gateways.find(g => g.type === 'github' && g.status === 'connected') ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-green-600 flex items-center gap-1">
                <Check className="w-3 h-3" /> Connected
              </span>
              <button
                onClick={() => {
                  mcpService.disconnectGitHub()
                  setGateways(mcpService.getGateways())
                  setTools(mcpService.getTools())
                  setMcpStatus(prev => mcpService.getMcpStatus?.() ?? prev)
                }}
                className="text-xs text-red-600 hover:underline"
              >
                Disconnect
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
              <div>
                <span className="font-medium">Session:</span>{' '}
                <span className="font-mono">{mcpStatus.sessionId ? String(mcpStatus.sessionId).slice(0, 8) + '…' : '—'}</span>
              </div>
              <div>
                <span className="font-medium">Streaming:</span>{' '}
                <span className={mcpStatus.streaming ? 'text-green-700' : 'text-gray-600'}>
                  {mcpStatus.streaming ? 'Yes' : 'No'}
                </span>
              </div>
              <div>
                <span className="font-medium">Last Event:</span>{' '}
                {formatLastEvent(mcpStatus.lastEventAt ?? null)}
              </div>
            </div>
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={async () => {
                  try {
                    await mcpService.startMcpStreaming?.()
                  } finally {
                    setMcpStatus(prev => mcpService.getMcpStatus?.() ?? prev)
                  }
                }}
                disabled={!!mcpStatus.streaming}
                className="px-2 py-1 text-xs rounded bg-blue-600 text-white disabled:bg-gray-300 flex items-center gap-1"
                title="Start MCP stream"
              >
                <Play className="w-3 h-3" /> Start Stream
              </button>
              <button
                onClick={() => {
                  mcpService.stopMcpStreaming?.()
                  setMcpStatus(prev => mcpService.getMcpStatus?.() ?? prev)
                }}
                disabled={!mcpStatus.streaming}
                className="px-2 py-1 text-xs rounded bg-gray-200 text-gray-800 disabled:bg-gray-100 flex items-center gap-1"
                title="Stop MCP stream (session persists)"
              >
                <X className="w-3 h-3" /> Stop Stream
              </button>
            </div>
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

      {/* GitHub MCP Presets */}
      {mcpStatus.connected && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
            <Github className="w-4 h-4" /> GitHub MCP Presets
          </h4>
          <div className="grid grid-cols-1 gap-2">
            <div className="flex items-center gap-2">
              <button
                onClick={() => execPreset('list_repos')}
                className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                List My Repos
              </button>
              <span className="text-xs text-gray-500">Reads your repositories (no write)</span>
            </div>

            <div className="p-2 bg-white border rounded">
              <div className="text-xs font-medium mb-2">Open Pull Request</div>
              <div className="grid grid-cols-2 gap-2 mb-2">
                <input className="px-2 py-1 text-xs border rounded" placeholder="owner" value={presetInputs.owner} onChange={e => setPresetInputs({ ...presetInputs, owner: e.target.value })} />
                <input className="px-2 py-1 text-xs border rounded" placeholder="repo" value={presetInputs.repo} onChange={e => setPresetInputs({ ...presetInputs, repo: e.target.value })} />
                <input className="px-2 py-1 text-xs border rounded" placeholder="base (default main)" value={presetInputs.base} onChange={e => setPresetInputs({ ...presetInputs, base: e.target.value })} />
                <input className="px-2 py-1 text-xs border rounded" placeholder="head (branch)" value={presetInputs.head} onChange={e => setPresetInputs({ ...presetInputs, head: e.target.value })} />
                <input className="px-2 py-1 text-xs border rounded col-span-2" placeholder="title" value={presetInputs.title} onChange={e => setPresetInputs({ ...presetInputs, title: e.target.value })} />
                <input className="px-2 py-1 text-xs border rounded col-span-2" placeholder="body (optional)" value={presetInputs.body} onChange={e => setPresetInputs({ ...presetInputs, body: e.target.value })} />
              </div>
              <button
                onClick={() => execPreset('open_pr')}
                disabled={!presetInputs.owner || !presetInputs.repo || !presetInputs.head || !presetInputs.title}
                className="px-2 py-1 text-xs bg-emerald-600 text-white rounded hover:bg-emerald-700 disabled:bg-gray-300"
              >
                Open PR
              </button>
            </div>

            <div className="p-2 bg-white border rounded">
              <div className="text-xs font-medium mb-2">Review File</div>
              <div className="grid grid-cols-2 gap-2 mb-2">
                <input className="px-2 py-1 text-xs border rounded" placeholder="owner" value={presetInputs.owner} onChange={e => setPresetInputs({ ...presetInputs, owner: e.target.value })} />
                <input className="px-2 py-1 text-xs border rounded" placeholder="repo" value={presetInputs.repo} onChange={e => setPresetInputs({ ...presetInputs, repo: e.target.value })} />
                <input className="px-2 py-1 text-xs border rounded col-span-2" placeholder="path (e.g., src/index.ts)" value={presetInputs.filePath} onChange={e => setPresetInputs({ ...presetInputs, filePath: e.target.value })} />
                <input className="px-2 py-1 text-xs border rounded col-span-2" placeholder="ref (branch/tag/sha)" value={presetInputs.ref} onChange={e => setPresetInputs({ ...presetInputs, ref: e.target.value })} />
              </div>
              <button
                onClick={() => execPreset('review_file')}
                disabled={!presetInputs.owner || !presetInputs.repo || !presetInputs.filePath}
                className="px-2 py-1 text-xs bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:bg-gray-300"
              >
                Review File
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tools Grid */}
      <div className="flex-1 overflow-y-auto">
        <div className="space-y-2">
          <div>
            <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
              <Github className="w-4 h-4" /> Tools
            </h4>
            <div className="grid grid-cols-2 gap-3">
              {filteredTools.map((tool) => {
                const Icon = getToolIcon(tool.category)
                const isDisabled = !tool.enabled
                return (
                  <div
                    key={tool.id}
                    onClick={() => !isDisabled && executeTool(tool.id)}
                    className={`p-3 rounded-lg border transition-all ${
                      isDisabled
                        ? 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 cursor-pointer'
                    }`}
                  >
                    <div className="flex flex-col items-center text-center">
                      <div className="p-2 rounded-lg mb-2 bg-gray-100">
                        <Icon className={`w-6 h-6 ${isDisabled ? 'text-gray-400' : 'text-gray-600'}`} />
                      </div>
                      <h3 className="text-sm font-medium text-gray-900">{tool.name}</h3>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
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

        {/* MCP Streaming Events */}
        {mcpEvents.length > 0 && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <Github className="w-4 h-4 text-gray-700" />
              <h4 className="text-sm font-medium">GitHub MCP Stream</h4>
              <button
                onClick={() => setMcpEvents([])}
                className="ml-auto text-xs px-2 py-1 rounded bg-gray-200 hover:bg-gray-300"
              >
                Clear
              </button>
            </div>
            <pre className="text-xs whitespace-pre-wrap max-h-56 overflow-auto bg-white p-2 rounded border">
              {mcpEvents.join('\n\n')}
            </pre>
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
