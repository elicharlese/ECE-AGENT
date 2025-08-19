import { supabase } from '@/lib/supabase/client'

export interface Agent {
  id: string
  name: string
  description: string
  avatar?: string
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
  private agents: Agent[] = [
    {
      id: 'ai-assistant',
      name: 'AI Assistant',
      description: 'General purpose AI assistant with web search and analysis capabilities',
      capabilities: ['search', 'analysis', 'coding', 'writing'],
      mcpTools: ['brave-search', 'sequential-thinking', 'memory'],
      status: 'online'
    },
    {
      id: 'dev-agent',
      name: 'Development Agent',
      description: 'Specialized in coding, debugging, and technical documentation',
      capabilities: ['coding', 'debugging', 'git', 'documentation'],
      mcpTools: ['git', 'puppeteer', 'sequential-thinking'],
      status: 'online'
    },
    {
      id: 'project-manager',
      name: 'Project Manager',
      description: 'Handles project tracking, issue management, and team coordination',
      capabilities: ['planning', 'tracking', 'reporting'],
      mcpTools: ['linear', 'memory', 'sequential-thinking'],
      status: 'online'
    },
    {
      id: 'legal-assistant',
      name: 'Legal Assistant',
      description: 'Reviews contracts, compliance, and legal documentation',
      capabilities: ['contracts', 'compliance', 'research'],
      mcpTools: ['brave-search', 'memory', 'sequential-thinking'],
      status: 'online'
    },
    {
      id: 'finance-agent',
      name: 'Finance Agent',
      description: 'Manages payments, invoicing, and financial operations',
      capabilities: ['payments', 'invoicing', 'reporting'],
      mcpTools: ['stripe', 'supabase', 'memory'],
      status: 'offline'
    }
  ]

  async getAgents(): Promise<Agent[]> {
    return this.agents
  }

  async getAgent(agentId: string): Promise<Agent | null> {
    return this.agents.find(a => a.id === agentId) || null
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
