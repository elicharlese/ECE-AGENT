// Service for AGENT LLM API integration
export interface AgentLLMRequest {
  message: string
  conversationId: string
  userId?: string
  agentMode?: string
  context?: any
  enableReasoning?: boolean
  collectFeedback?: boolean
}

export interface AgentLLMResponse {
  content: string
  agentMode: string
  confidence: number
  reasoningTrace: any[]
  examplesRetrieved: number
  toolsUsed: string[]
  suggestions: string[]
  metadata: {
    processingTime: number
    timestamp: string
    agentVersion: string
    modelUsed: string
  }
  interactionId?: string
}

export interface AgentModesResponse {
  modes: Record<string, {
    name: string
    description: string
  }>
}

export interface AgentHealthResponse {
  status: string
  timestamp: string
  components: Record<string, string>
}

class AgentLLMService {
  private baseUrl = '/api/agents'

  async sendMessage(request: AgentLLMRequest): Promise<AgentLLMResponse> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to send message to AGENT LLM')
    }

    return response.json()
  }

  async getModes(): Promise<AgentModesResponse> {
    const response = await fetch(`${this.baseUrl}?action=modes`)

    if (!response.ok) {
      throw new Error('Failed to fetch agent modes')
    }

    return response.json()
  }

  async getHealth(): Promise<AgentHealthResponse> {
    const response = await fetch(`${this.baseUrl}?action=health`)

    if (!response.ok) {
      throw new Error('Failed to fetch agent health')
    }

    return response.json()
  }

  async getAnalytics(): Promise<any> {
    const response = await fetch(`${this.baseUrl}?action=analytics`)

    if (!response.ok) {
      throw new Error('Failed to fetch analytics')
    }

    return response.json()
  }

  // Helper to detect @ai messages
  isAIMessage(message: string): boolean {
    return message.trim().startsWith('@ai') || message.trim().startsWith('@AI')
  }

  // Extract message content without @ai prefix
  extractAIMessage(message: string): string {
    if (this.isAIMessage(message)) {
      return message.trim().substring(3).trim()
    }
    return message
  }
}

export const agentLLMService = new AgentLLMService()