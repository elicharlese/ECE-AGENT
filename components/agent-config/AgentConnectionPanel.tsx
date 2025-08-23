'use client'

import React, { useState } from 'react'
import { Bot, Settings, Plus, Check, X, Zap, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface AgentConnection {
  id: string
  name: string
  model: string
  provider: 'openai' | 'openrouter'
  status: 'connected' | 'disconnected' | 'error'
  capabilities: string[]
  config: {
    temperature: number
    maxTokens: number
    systemPrompt: string
    apiKey?: string
    endpoint?: string
  }
}

interface AgentConnectionPanelProps {
  connections: AgentConnection[]
  onAddConnection: (connection: Omit<AgentConnection, 'id'>) => void
  onUpdateConnection: (id: string, updates: Partial<AgentConnection>) => void
  onRemoveConnection: (id: string) => void
  onTestConnection: (id: string) => Promise<boolean>
  selectedId?: string
  onSelectConnection?: (id: string) => void
}

export function AgentConnectionPanel({
  connections,
  onAddConnection,
  onUpdateConnection,
  onRemoveConnection,
  onTestConnection,
  selectedId,
  onSelectConnection,
}: AgentConnectionPanelProps) {
  const [isAdding, setIsAdding] = useState(false)
  const [testingId, setTestingId] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const handleTest = async (id: string) => {
    setTestingId(id)
    try {
      const success = await onTestConnection(id)
      if (success) {
        onUpdateConnection(id, { status: 'connected' })
      } else {
        onUpdateConnection(id, { status: 'error' })
      }
    } finally {
      setTestingId(null)
    }
  }

  return (
    <div className="p-4 h-full overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Bot className="h-5 w-5" />
          AI Agents
        </h2>
        <button
          onClick={() => setIsAdding(true)}
          className="p-1.5 hover:bg-accent rounded-md transition-colors"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      {/* Agent List */}
      <div className="space-y-3">
        {connections.map(agent => (
          <div
            key={agent.id}
            className={cn(
              'border rounded-lg p-3 transition-all',
              'hover:shadow-md cursor-pointer',
              (expandedId === agent.id || selectedId === agent.id) && 'shadow-md border-primary'
            )}
            onClick={() => {
              setExpandedId(expandedId === agent.id ? null : agent.id)
              onSelectConnection?.(agent.id)
            }}
          >
            {/* Agent Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    'w-2 h-2 rounded-full',
                    agent.status === 'connected' && 'bg-green-500',
                    agent.status === 'disconnected' && 'bg-gray-400',
                    agent.status === 'error' && 'bg-red-500'
                  )}
                />
                <span className="font-medium">{agent.name}</span>
                <span className="text-xs text-muted-foreground">{agent.model}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-accent text-muted-foreground uppercase">
                  {agent.provider}
                </span>
                {selectedId === agent.id && (
                  <Check className="h-3.5 w-3.5 text-green-600" />
                )}
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleTest(agent.id)
                  }}
                  className="p-1 hover:bg-accent rounded transition-colors"
                  disabled={testingId === agent.id}
                >
                  <Zap className={cn(
                    'h-3.5 w-3.5',
                    testingId === agent.id && 'animate-pulse'
                  )} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onRemoveConnection(agent.id)
                  }}
                  className="p-1 hover:bg-accent rounded transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Agent Details (Expanded) */}
            {expandedId === agent.id && (
              <div className="mt-3 pt-3 border-t space-y-3">
                {/* Capabilities */}
                <div>
                  <label className="text-xs font-medium text-muted-foreground">
                    Capabilities
                  </label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {agent.capabilities.map(cap => (
                      <span
                        key={cap}
                        className="px-2 py-0.5 bg-accent text-xs rounded-full"
                      >
                        {cap}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Configuration */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">
                    Configuration
                  </label>

                  {/* Provider */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs">Provider</span>
                    <select
                      value={agent.provider}
                      onChange={(e) => onUpdateConnection(agent.id, { provider: e.target.value as AgentConnection['provider'] })}
                      className="w-32 px-2 py-1 text-xs border rounded"
                    >
                      <option value="openai">OpenAI</option>
                      <option value="openrouter">OpenRouter</option>
                    </select>
                  </div>

                  {/* Temperature */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs">Temperature</span>
                    <input
                      type="range"
                      min="0"
                      max="2"
                      step="0.1"
                      value={agent.config.temperature}
                      onChange={(e) => onUpdateConnection(agent.id, {
                        config: { ...agent.config, temperature: parseFloat(e.target.value) }
                      })}
                      className="w-24"
                    />
                    <span className="text-xs w-8 text-right">
                      {agent.config.temperature}
                    </span>
                  </div>

                  {/* Max Tokens */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs">Max Tokens</span>
                    <input
                      type="number"
                      value={agent.config.maxTokens}
                      onChange={(e) => onUpdateConnection(agent.id, {
                        config: { ...agent.config, maxTokens: parseInt(e.target.value) }
                      })}
                      className="w-20 px-2 py-0.5 text-xs border rounded"
                    />
                  </div>

                  {/* System Prompt */}
                  <div>
                    <span className="text-xs">System Prompt</span>
                    <textarea
                      value={agent.config.systemPrompt}
                      onChange={(e) => onUpdateConnection(agent.id, {
                        config: { ...agent.config, systemPrompt: e.target.value }
                      })}
                      className="w-full mt-1 px-2 py-1 text-xs border rounded resize-none"
                      rows={3}
                    />
                  </div>

                  {/* API Key */}
                  <div>
                    <span className="text-xs">API Key</span>
                    <input
                      type="password"
                      value={agent.config.apiKey || ''}
                      onChange={(e) => onUpdateConnection(agent.id, {
                        config: { ...agent.config, apiKey: e.target.value }
                      })}
                      className="w-full mt-1 px-2 py-1 text-xs border rounded"
                      placeholder={agent.provider === 'openrouter' ? 'sk-or-v1-...' : 'sk-...'}
                    />
                  </div>

                  {/* Endpoint */}
                  <div>
                    <span className="text-xs">Endpoint</span>
                    <input
                      type="text"
                      value={agent.config.endpoint || ''}
                      onChange={(e) => onUpdateConnection(agent.id, {
                        config: { ...agent.config, endpoint: e.target.value }
                      })}
                      className="w-full mt-1 px-2 py-1 text-xs border rounded"
                      placeholder={agent.provider === 'openrouter' ? 'https://openrouter.ai/api/v1/chat/completions' : 'https://api.openai.com/v1/chat/completions'}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add New Agent Form */}
      {isAdding && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background border rounded-lg p-4 w-96 max-h-[80vh] overflow-y-auto">
            <h3 className="font-semibold mb-4">Add New Agent</h3>
            <AgentAddForm
              onAdd={(agent) => {
                onAddConnection(agent)
                setIsAdding(false)
              }}
              onCancel={() => setIsAdding(false)}
            />
          </div>
        </div>
      )}
    </div>
  )
}

function AgentAddForm({
  onAdd,
  onCancel,
}: {
  onAdd: (agent: Omit<AgentConnection, 'id'>) => void
  onCancel: () => void
}) {
  const [name, setName] = useState('')
  const [model, setModel] = useState('gpt-4')
  const [provider, setProvider] = useState<AgentConnection['provider']>('openai')
  const [capabilities, setCapabilities] = useState<string[]>(['chat'])
  const [temperature, setTemperature] = useState(0.7)
  const [maxTokens, setMaxTokens] = useState(2048)
  const [systemPrompt, setSystemPrompt] = useState('')
  const [apiKey, setApiKey] = useState('')
  const [endpoint, setEndpoint] = useState('')

  const availableCapabilities = [
    'chat', 'code', 'analysis', 'search', 'vision', 'audio', 'tools'
  ]

  const availableModels = [
    'gpt-4', 'gpt-3.5-turbo', 'claude-3-opus', 'claude-3-sonnet',
    'gemini-pro', 'llama-2-70b', 'mixtral-8x7b'
  ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onAdd({
      name,
      model,
      provider,
      status: 'disconnected',
      capabilities,
      config: {
        temperature,
        maxTokens,
        systemPrompt,
        apiKey,
        endpoint: endpoint || (provider === 'openrouter' ? 'https://openrouter.ai/api/v1/chat/completions' : 'https://api.openai.com/v1/chat/completions'),
      },
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="text-sm font-medium">Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full mt-1 px-3 py-1.5 border rounded-md"
          required
        />
      </div>

      <div>
        <label className="text-sm font-medium">Provider</label>
        <select
          value={provider}
          onChange={(e) => setProvider(e.target.value as AgentConnection['provider'])}
          className="w-full mt-1 px-3 py-1.5 border rounded-md"
        >
          <option value="openai">OpenAI</option>
          <option value="openrouter">OpenRouter</option>
        </select>
      </div>

      <div>
        <label className="text-sm font-medium">Model</label>
        <select
          value={model}
          onChange={(e) => setModel(e.target.value)}
          className="w-full mt-1 px-3 py-1.5 border rounded-md"
        >
          {availableModels.map(m => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-sm font-medium">Capabilities</label>
        <div className="flex flex-wrap gap-2 mt-1">
          {availableCapabilities.map(cap => (
            <label key={cap} className="flex items-center gap-1">
              <input
                type="checkbox"
                checked={capabilities.includes(cap)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setCapabilities([...capabilities, cap])
                  } else {
                    setCapabilities(capabilities.filter(c => c !== cap))
                  }
                }}
              />
              <span className="text-sm">{cap}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="text-sm font-medium">Temperature: {temperature}</label>
        <input
          type="range"
          min="0"
          max="2"
          step="0.1"
          value={temperature}
          onChange={(e) => setTemperature(parseFloat(e.target.value))}
          className="w-full mt-1"
        />
      </div>

      <div>
        <label className="text-sm font-medium">Max Tokens</label>
        <input
          type="number"
          value={maxTokens}
          onChange={(e) => setMaxTokens(parseInt(e.target.value))}
          className="w-full mt-1 px-3 py-1.5 border rounded-md"
        />
      </div>

      <div>
        <label className="text-sm font-medium">System Prompt</label>
        <textarea
          value={systemPrompt}
          onChange={(e) => setSystemPrompt(e.target.value)}
          className="w-full mt-1 px-3 py-1.5 border rounded-md resize-none"
          rows={4}
          placeholder="You are a helpful assistant..."
        />
      </div>

      <div>
        <label className="text-sm font-medium">API Key</label>
        <input
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          className="w-full mt-1 px-3 py-1.5 border rounded-md"
          placeholder={provider === 'openrouter' ? 'sk-or-v1-...' : 'sk-...'}
        />
      </div>

      <div>
        <label className="text-sm font-medium">Endpoint</label>
        <input
          type="text"
          value={endpoint}
          onChange={(e) => setEndpoint(e.target.value)}
          className="w-full mt-1 px-3 py-1.5 border rounded-md"
          placeholder={provider === 'openrouter' ? 'https://openrouter.ai/api/v1/chat/completions' : 'https://api.openai.com/v1/chat/completions'}
        />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-3 py-1.5 text-sm border rounded-md hover:bg-accent"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          Add Agent
        </button>
      </div>
    </form>
  )
}
