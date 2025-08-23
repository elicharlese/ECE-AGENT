'use client'

import React, { useState } from 'react'
import { Server, Cpu, Sliders, Database, Shield, Activity } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface MCPModelConfig {
  id: string
  name: string
  server: string
  model: string
  parameters: {
    temperature: number
    topP: number
    topK: number
    maxTokens: number
    presencePenalty: number
    frequencyPenalty: number
  }
  tools: string[]
  capabilities: string[]
  performance: {
    avgLatency: number
    successRate: number
    tokensPerSecond: number
  }
}

interface MCPModelConfigPanelProps {
  configs: MCPModelConfig[]
  onUpdateConfig: (id: string, updates: Partial<MCPModelConfig>) => void
  onCreateConfig: (config: Omit<MCPModelConfig, 'id'>) => void
  onDeleteConfig: (id: string) => void
  onTestConfig: (id: string) => Promise<boolean>
}

export function MCPModelConfigPanel({
  configs,
  onUpdateConfig,
  onCreateConfig,
  onDeleteConfig,
  onTestConfig,
}: MCPModelConfigPanelProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [testingId, setTestingId] = useState<string | null>(null)

  const selectedConfig = configs.find(c => c.id === selectedId)

  const handleTest = async (id: string) => {
    setTestingId(id)
    try {
      await onTestConfig(id)
    } finally {
      setTestingId(null)
    }
  }

  return (
    <div className="flex h-full">
      {/* Config List */}
      <div className="w-1/3 border-r p-4 overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold flex items-center gap-2">
            <Server className="h-4 w-4" />
            MCP Servers
          </h3>
          <button
            onClick={() => setIsCreating(true)}
            className="text-xs px-2 py-1 bg-primary text-primary-foreground rounded hover:bg-primary/90"
          >
            Add Server
          </button>
        </div>

        <div className="space-y-2">
          {configs.map(config => (
            <div
              key={config.id}
              className={cn(
                'p-3 border rounded-lg cursor-pointer transition-all',
                'hover:bg-accent',
                selectedId === config.id && 'border-primary bg-accent'
              )}
              onClick={() => setSelectedId(config.id)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">{config.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {config.server} • {config.model}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <div
                    className={cn(
                      'w-2 h-2 rounded-full',
                      config.performance.successRate > 0.95 ? 'bg-green-500' :
                      config.performance.successRate > 0.8 ? 'bg-yellow-500' :
                      'bg-red-500'
                    )}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Config Details */}
      <div className="flex-1 p-4 overflow-y-auto">
        {selectedConfig ? (
          <div className="space-y-6">
            {/* Header */}
            <div>
              <h3 className="text-lg font-semibold">{selectedConfig.name}</h3>
              <p className="text-sm text-muted-foreground">
                {selectedConfig.server} • {selectedConfig.model}
              </p>
            </div>

            {/* Parameters */}
            <div className="space-y-4">
              <h4 className="font-medium flex items-center gap-2">
                <Sliders className="h-4 w-4" />
                Parameters
              </h4>
              
              <div className="grid grid-cols-2 gap-4">
                <ParameterSlider
                  label="Temperature"
                  value={selectedConfig.parameters.temperature}
                  min={0}
                  max={2}
                  step={0.1}
                  onChange={(v) => onUpdateConfig(selectedConfig.id, {
                    parameters: { ...selectedConfig.parameters, temperature: v }
                  })}
                />
                
                <ParameterSlider
                  label="Top P"
                  value={selectedConfig.parameters.topP}
                  min={0}
                  max={1}
                  step={0.01}
                  onChange={(v) => onUpdateConfig(selectedConfig.id, {
                    parameters: { ...selectedConfig.parameters, topP: v }
                  })}
                />
                
                <ParameterSlider
                  label="Top K"
                  value={selectedConfig.parameters.topK}
                  min={1}
                  max={100}
                  step={1}
                  onChange={(v) => onUpdateConfig(selectedConfig.id, {
                    parameters: { ...selectedConfig.parameters, topK: v }
                  })}
                />
                
                <ParameterInput
                  label="Max Tokens"
                  value={selectedConfig.parameters.maxTokens}
                  onChange={(v) => onUpdateConfig(selectedConfig.id, {
                    parameters: { ...selectedConfig.parameters, maxTokens: v }
                  })}
                />
                
                <ParameterSlider
                  label="Presence Penalty"
                  value={selectedConfig.parameters.presencePenalty}
                  min={-2}
                  max={2}
                  step={0.1}
                  onChange={(v) => onUpdateConfig(selectedConfig.id, {
                    parameters: { ...selectedConfig.parameters, presencePenalty: v }
                  })}
                />
                
                <ParameterSlider
                  label="Frequency Penalty"
                  value={selectedConfig.parameters.frequencyPenalty}
                  min={-2}
                  max={2}
                  step={0.1}
                  onChange={(v) => onUpdateConfig(selectedConfig.id, {
                    parameters: { ...selectedConfig.parameters, frequencyPenalty: v }
                  })}
                />
              </div>
            </div>

            {/* Tools */}
            <div className="space-y-3">
              <h4 className="font-medium flex items-center gap-2">
                <Database className="h-4 w-4" />
                Available Tools
              </h4>
              <div className="flex flex-wrap gap-2">
                {selectedConfig.tools.map(tool => (
                  <span
                    key={tool}
                    className="px-2 py-1 bg-accent text-xs rounded-md"
                  >
                    {tool}
                  </span>
                ))}
              </div>
            </div>

            {/* Capabilities */}
            <div className="space-y-3">
              <h4 className="font-medium flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Capabilities
              </h4>
              <div className="flex flex-wrap gap-2">
                {selectedConfig.capabilities.map(cap => (
                  <span
                    key={cap}
                    className="px-2 py-1 bg-primary/10 text-xs rounded-md"
                  >
                    {cap}
                  </span>
                ))}
              </div>
            </div>

            {/* Performance */}
            <div className="space-y-3">
              <h4 className="font-medium flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Performance
              </h4>
              <div className="grid grid-cols-3 gap-4">
                <div className="p-3 bg-accent rounded-lg">
                  <p className="text-xs text-muted-foreground">Avg Latency</p>
                  <p className="text-lg font-semibold">
                    {selectedConfig.performance.avgLatency}ms
                  </p>
                </div>
                <div className="p-3 bg-accent rounded-lg">
                  <p className="text-xs text-muted-foreground">Success Rate</p>
                  <p className="text-lg font-semibold">
                    {(selectedConfig.performance.successRate * 100).toFixed(1)}%
                  </p>
                </div>
                <div className="p-3 bg-accent rounded-lg">
                  <p className="text-xs text-muted-foreground">Tokens/sec</p>
                  <p className="text-lg font-semibold">
                    {selectedConfig.performance.tokensPerSecond}
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={() => handleTest(selectedConfig.id)}
                disabled={testingId === selectedConfig.id}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50"
              >
                {testingId === selectedConfig.id ? 'Testing...' : 'Test Connection'}
              </button>
              <button
                onClick={() => {
                  onDeleteConfig(selectedConfig.id)
                  setSelectedId(null)
                }}
                className="px-4 py-2 border rounded-md hover:bg-accent"
              >
                Delete
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            Select a configuration to view details
          </div>
        )}
      </div>

      {/* Create Config Modal */}
      {isCreating && (
        <CreateConfigModal
          onClose={() => setIsCreating(false)}
          onCreate={(config) => {
            onCreateConfig(config)
            setIsCreating(false)
          }}
        />
      )}
    </div>
  )
}

function ParameterSlider({
  label,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string
  value: number
  min: number
  max: number
  step: number
  onChange: (value: number) => void
}) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">{value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full"
      />
    </div>
  )
}

function ParameterInput({
  label,
  value,
  onChange,
}: {
  label: string
  value: number
  onChange: (value: number) => void
}) {
  return (
    <div className="space-y-1">
      <label className="text-sm text-muted-foreground">{label}</label>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="w-full px-3 py-1.5 border rounded-md"
      />
    </div>
  )
}

function CreateConfigModal({
  onClose,
  onCreate,
}: {
  onClose: () => void
  onCreate: (config: Omit<MCPModelConfig, 'id'>) => void
}) {
  const [name, setName] = useState('')
  const [server, setServer] = useState('openai')
  const [model, setModel] = useState('gpt-4')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onCreate({
      name,
      server,
      model,
      parameters: {
        temperature: 0.7,
        topP: 1,
        topK: 40,
        maxTokens: 2048,
        presencePenalty: 0,
        frequencyPenalty: 0,
      },
      tools: ['search', 'code', 'memory'],
      capabilities: ['chat', 'completion', 'embedding'],
      performance: {
        avgLatency: 0,
        successRate: 1,
        tokensPerSecond: 0,
      },
    })
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-background border rounded-lg p-6 w-96">
        <h3 className="text-lg font-semibold mb-4">Add MCP Server</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
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
            <label className="text-sm font-medium">Server</label>
            <select
              value={server}
              onChange={(e) => setServer(e.target.value)}
              className="w-full mt-1 px-3 py-1.5 border rounded-md"
            >
              <option value="openai">OpenAI</option>
              <option value="anthropic">Anthropic</option>
              <option value="google">Google</option>
              <option value="local">Local</option>
            </select>
          </div>
          
          <div>
            <label className="text-sm font-medium">Model</label>
            <input
              type="text"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full mt-1 px-3 py-1.5 border rounded-md"
              required
            />
          </div>
          
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-md hover:bg-accent"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
