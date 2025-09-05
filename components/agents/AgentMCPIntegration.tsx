'use client'

import React, { useEffect, useState } from 'react'
import { agentService, Agent } from '@/services/agent-service'
import { Button } from '@/libs/design-system'
import { Badge } from '@/libs/design-system'

export interface AgentMCPIntegrationProps {
  agentId: string
  onToolExecute: (toolId: string, params: any) => Promise<any>
}

interface ToolResultMap {
  [toolId: string]: any
}

export function AgentMCPIntegration({ agentId, onToolExecute }: AgentMCPIntegrationProps) {
  const [agent, setAgent] = useState<Agent | null>(null)
  const [executing, setExecuting] = useState<string | null>(null)
  const [results, setResults] = useState<ToolResultMap>({})

  useEffect(() => {
    let mounted = true
    ;(async () => {
      const a = await agentService.getAgent(agentId)
      if (mounted) setAgent(a)
    })()
    return () => {
      mounted = false
    }
  }, [agentId])

  const defaultParamsFor = (toolId: string) => {
    switch (toolId) {
      case 'brave-search':
        return { query: 'hello world' }
      case 'git':
        return { action: 'status' }
      case 'linear':
        return { action: 'list' }
      case 'stripe':
        return { action: 'balance' }
      case 'sequential-thinking':
        return { prompt: 'Analyze project structure' }
      case 'memory':
        return { op: 'status' }
      default:
        return {}
    }
  }

  const executeTool = async (toolId: string) => {
    try {
      setExecuting(toolId)
      const params = defaultParamsFor(toolId)
      const res = await onToolExecute(toolId, params)
      setResults((prev) => ({ ...prev, [toolId]: res }))
    } catch (e) {
      setResults((prev) => ({ ...prev, [toolId]: { error: e instanceof Error ? e.message : String(e) } }))
    } finally {
      setExecuting(null)
    }
  }

  if (!agent) {
    return <div className="p-4 text-sm text-gray-600 dark:text-gray-300">Loading MCP tools…</div>
  }

  const tools = agent.mcpTools ?? []

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold">MCP Tools for {agent.name}</h3>
        <Badge variant="secondary">{tools.length} tools</Badge>
      </div>

      {tools.length === 0 ? (
        <div className="text-sm text-gray-600 dark:text-gray-300">No MCP tools configured for this agent.</div>
      ) : (
        <div className="space-y-3">
          {tools.map((tool) => (
            <div key={tool} className="p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{tool}</span>
                  <Badge variant="outline" className="text-xs">MCP</Badge>
                </div>
                <Button size="sm" onClick={() => executeTool(tool)} disabled={executing === tool}>
                  {executing === tool ? 'Running…' : 'Run'}
                </Button>
              </div>
              {results[tool] && (
                <pre className="mt-2 text-xs bg-gray-50 dark:bg-gray-900 p-2 rounded overflow-x-auto">
                  {JSON.stringify(results[tool], null, 2)}
                </pre>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
