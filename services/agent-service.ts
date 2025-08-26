import { supabase } from '@/lib/supabase/client'
import type { AgentRow, AgentCreateInput } from '@/src/types/agent'

// Service-facing Agent shape used by legacy components
export interface Agent {
  id: string
  name: string
  description: string
  avatar?: string | null
  capabilities: string[]
  mcpTools: string[]
  status: 'online' | 'offline' | 'busy'
  lastActive?: Date
}

export interface AgentMessage {
  id: string
  agentId: string
  conversationId: string
  content: string
  timestamp: Date
  metadata?: {
    toolsUsed?: string[]
    executionTime?: number
    confidence?: number
  }
}

class AgentService {
  private cache: Map<string, Agent> = new Map()
  private cachedList: Agent[] | null = null

  private mapRowToAgent(row: AgentRow): Agent {
    return {
      id: row.id,
      name: row.name,
      description: row.description ?? '',
      avatar: row.avatar_url ?? null,
      capabilities: row.capabilities ?? [],
      mcpTools: row.mcp_tools ?? [],
      status: row.status,
    }
  }

  private setCacheList(list: Agent[]) {
    this.cachedList = list
    this.cache.clear()
    for (const a of list) {
      this.cache.set(a.id, a)
    }
  }

  invalidateCache() {
    this.cachedList = null
    this.cache.clear()
  }

  async listAgents(force = false): Promise<Agent[]> {
    if (!force && this.cachedList) return this.cachedList
    const res = await fetch('/api/agents', { method: 'GET' })
    if (!res.ok) throw new Error(`Failed to load agents: ${res.status}`)
    const json: { agents: AgentRow[] } = await res.json()
    const mapped = (json.agents ?? []).map((r) => this.mapRowToAgent(r))
    this.setCacheList(mapped)
    return mapped
  }

  async getAgents(): Promise<Agent[]> {
    return this.listAgents(false)
  }

  async getAgent(agentId: string): Promise<Agent | null> {
    const cached = this.cache.get(agentId)
    if (cached) return cached
    // Try API detail endpoint
    const res = await fetch(`/api/agents/${agentId}`, { method: 'GET' })
    if (res.ok) {
      const json: { agent: AgentRow | null } = await res.json()
      if (json.agent) {
        const mapped = this.mapRowToAgent(json.agent)
        this.cache.set(mapped.id, mapped)
        return mapped
      }
    }
    // Fallback: refresh list
    const list = await this.listAgents(true)
    return list.find((a) => a.id === agentId) ?? null
  }

  async createAgent(input: AgentCreateInput): Promise<Agent> {
    const res = await fetch('/api/agents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    })
    const json = await res.json()
    if (!res.ok) throw new Error(json?.error ?? 'Failed to create agent')
    const mapped = this.mapRowToAgent(json.agent as AgentRow)
    // Update caches
    if (this.cachedList) this.cachedList = [mapped, ...this.cachedList]
    this.cache.set(mapped.id, mapped)
    return mapped
  }

  async sendMessage(
    agentId: string, 
    message: string, 
    conversationId: string
  ): Promise<AgentMessage> {
    const agent = await this.getAgent(agentId)
    if (!agent) {
      throw new Error('Agent not found')
    }

    // Simulate AI processing
    const response = await this.processWithMCP(agent, message)
    
    const agentMessage: AgentMessage = {
      id: `${Date.now()}-${Math.random()}`,
      agentId,
      conversationId,
      content: response.content,
      timestamp: new Date(),
      metadata: {
        toolsUsed: response.toolsUsed,
        executionTime: response.executionTime,
        confidence: response.confidence
      }
    }

    // Store in Supabase if needed
    try {
      await this.saveMessage(agentMessage)
    } catch (error) {
      console.error('Failed to save agent message:', error)
    }

    return agentMessage
  }

  private async processWithMCP(
    agent: Agent, 
    message: string
  ): Promise<{
    content: string
    toolsUsed: string[]
    executionTime: number
    confidence: number
  }> {
    const startTime = Date.now()
    const toolsUsed: string[] = []
    
    // Simulate different agent responses based on capabilities
    let content = ''
    
    if (agent.id === 'ai-assistant') {
      if (message.toLowerCase().includes('search')) {
        toolsUsed.push('brave-search')
        content = "I've searched the web for relevant information. Here's what I found..."
      } else if (message.toLowerCase().includes('help')) {
        toolsUsed.push('sequential-thinking', 'memory')
        content = "I'll analyze your request step by step to provide the best assistance..."
      } else {
        content = "I'm here to help! Let me process your request..."
      }
    } else if (agent.id === 'dev-agent') {
      if (message.toLowerCase().includes('debug')) {
        toolsUsed.push('sequential-thinking')
        content = "Let me analyze the code issue systematically..."
      } else if (message.toLowerCase().includes('git')) {
        toolsUsed.push('git')
        content = "I'll help you with Git operations..."
      } else {
        content = "I'll assist with your development task..."
      }
    } else if (agent.id === 'project-manager') {
      toolsUsed.push('linear', 'memory')
      content = "I'll help manage your project tasks and track progress..."
    } else if (agent.id === 'legal-assistant') {
      toolsUsed.push('memory', 'sequential-thinking')
      content = "I'll review the legal aspects of your request..."
    } else if (agent.id === 'finance-agent') {
      toolsUsed.push('stripe')
      content = "I can help with financial operations and payment processing..."
    } else if (agent.id === 'research-agent') {
      toolsUsed.push('brave-search', 'sequential-thinking')
      const lower = message.toLowerCase()
      if (lower.includes('sources') || lower.includes('cite') || lower.includes('remember')) {
        toolsUsed.push('memory')
      }
      if (lower.includes('summarize') || lower.includes('summary')) {
        content = "I'll research this topic and provide a concise summary with cited sources..."
      } else if (lower.includes('search') || lower.includes('research')) {
        content = "I'll search the web and compile key findings with references..."
      } else {
        content = "Initiating research. I'll gather information and return a summary with sources..."
      }
    } else {
      content = "Processing your request..."
    }

    const executionTime = Date.now() - startTime
    const confidence = 0.85 + Math.random() * 0.15 // 85-100% confidence

    return {
      content,
      toolsUsed,
      executionTime,
      confidence
    }
  }

  private async saveMessage(message: AgentMessage): Promise<void> {
    // Save to Supabase
    const { error } = await supabase
      .from('agent_messages')
      .insert({
        agent_id: message.agentId,
        conversation_id: message.conversationId,
        content: message.content,
        metadata: message.metadata,
        created_at: message.timestamp
      })
    
    if (error) {
      console.error('Failed to save agent message to Supabase:', error)
    }
  }

  async executeMCPTool(
    toolId: string, 
    params: any
  ): Promise<any> {
    // Simulate MCP tool execution
    console.log(`Executing MCP tool: ${toolId}`, params)
    
    switch (toolId) {
      case 'brave-search':
        return { results: ['Search result 1', 'Search result 2'] }
      case 'git':
        return { status: 'clean', branch: 'main' }
      case 'linear':
        return { issues: [], projects: [] }
      case 'stripe':
        return { payments: [], customers: [] }
      case 'sequential-thinking':
        return { analysis: 'Step-by-step analysis complete' }
      case 'memory':
        return { memories: [], knowledge: {} }
      default:
        throw new Error(`Unknown tool: ${toolId}`)
    }
  }
}

export const agentService = new AgentService()
