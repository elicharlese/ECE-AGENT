import { supabase } from '@/lib/supabase/client'
import { CREDITS_ENABLED, CREDITS_PER_AI_REQUEST } from '@/lib/pricing'
import { consumeCredits } from '@/services/credit-service'
import { sendMessage as sendDbMessage, DBMessage } from './message-service'

// AI Service Configuration
type AIProvider = 'openai' | 'openrouter'

interface AIConfig {
  apiKey?: string
  model?: string
  temperature?: number
  maxTokens?: number
  provider?: AIProvider
  endpoint?: string
  headers?: Record<string, string>
  systemPrompt?: string
}

interface AIMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

// Mock AI responses for demo purposes
const AI_RESPONSES = [
  "I understand your request. Let me help you with that.",
  "That's an interesting question! Here's what I think...",
  "Based on the context, I can suggest the following approach:",
  "I've analyzed your request and here's my recommendation:",
  "Let me break this down for you step by step.",
]

class AIService {
  private config: AIConfig = {
    model: 'gpt-4',
    temperature: 0.7,
    maxTokens: 1000,
    provider: 'openai',
    endpoint: 'https://api.openai.com/v1/chat/completions',
  }

  private static readonly DEFAULT_TIMEOUT_MS = 45000

  constructor() {
    // Check for API keys in environment
    if (typeof window !== 'undefined') {
      const storedOpenAI = localStorage.getItem('openai_api_key')
      if (storedOpenAI) this.config.apiKey = storedOpenAI

      // Optional: store a default OpenRouter key separately
      const storedOpenRouter = localStorage.getItem('openrouter_api_key')
      if (!this.config.apiKey && storedOpenRouter) {
        this.config.apiKey = storedOpenRouter
        this.config.provider = 'openrouter'
        this.config.endpoint = 'https://openrouter.ai/api/v1/chat/completions'
      }
    }
  }

  setApiKey(apiKey: string) {
    this.config.apiKey = apiKey
    if (typeof window !== 'undefined') {
      localStorage.setItem('openai_api_key', apiKey)
    }
  }

  setProvider(provider: AIProvider) {
    this.config.provider = provider
    if (provider === 'openrouter' && !this.config.endpoint) {
      this.config.endpoint = 'https://openrouter.ai/api/v1/chat/completions'
    }
    if (provider === 'openai' && !this.config.endpoint) {
      this.config.endpoint = 'https://api.openai.com/v1/chat/completions'
    }
  }

  private resolveRuntimeConfig(overrides?: Partial<AIConfig>): Required<Pick<AIConfig, 'provider' | 'endpoint' | 'model' | 'temperature' | 'maxTokens'>> & Pick<AIConfig, 'apiKey' | 'headers' | 'systemPrompt'> {
    const provider: AIProvider = (overrides?.provider || this.config.provider || 'openai')
    const endpoint = overrides?.endpoint
      || this.config.endpoint
      || (provider === 'openrouter' ? 'https://openrouter.ai/api/v1/chat/completions' : 'https://api.openai.com/v1/chat/completions')
    const model = overrides?.model || this.config.model || 'gpt-4'
    const temperature = overrides?.temperature ?? this.config.temperature ?? 0.7
    const maxTokens = overrides?.maxTokens ?? this.config.maxTokens ?? 1000
    const headers = { ...(this.config.headers || {}), ...(overrides?.headers || {}) }
    const systemPrompt = overrides?.systemPrompt || this.config.systemPrompt
    const apiKey = overrides?.apiKey || this.config.apiKey
    return { provider, endpoint, model, temperature, maxTokens, headers, systemPrompt, apiKey }
  }

  async generateResponse(messages: AIMessage[], overrides?: Partial<AIConfig>): Promise<string> {
    const cfg = this.resolveRuntimeConfig(overrides)

    // If we have an API key, use real API
    if (cfg.apiKey && cfg.apiKey !== 'demo') {
      try {
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${cfg.apiKey}`,
          ...cfg.headers,
        }
        // Recommended OpenRouter headers (non-fatal if missing)
        if (cfg.provider === 'openrouter' && typeof window !== 'undefined') {
          headers['HTTP-Referer'] = window.location.origin
          headers['X-Title'] = 'ECE Agent Chat'
        }

        const controller = typeof AbortController !== 'undefined' ? new AbortController() : undefined
        const timeout = setTimeout(() => controller?.abort(), AIService.DEFAULT_TIMEOUT_MS)
        const response = await fetch(cfg.endpoint, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            model: cfg.model,
            messages,
            temperature: cfg.temperature,
            max_tokens: cfg.maxTokens,
          }),
          signal: controller?.signal,
        }).finally(() => clearTimeout(timeout))

        if (!response.ok) {
          let body: any = null
          try { body = await response.text() } catch {}
          throw new Error(`AI API error: ${response.status} ${body ? `- ${body}` : ''}`)
        }

        const data = await response.json()
        return data.choices?.[0]?.message?.content || 'No response generated'
      } catch (error) {
        const isAbort = (error as any)?.name === 'AbortError'
        console.error('AI API error:', isAbort ? 'Request timed out' : error)
        // Fallback to mock response
        return this.getMockResponse(messages)
      }
    }

    // Use mock responses for demo
    return this.getMockResponse(messages)
  }

  private getMockResponse(messages: AIMessage[]): string {
    const lastUserMessage = messages.filter(m => m.role === 'user').pop()
    const content = lastUserMessage?.content || ''
    
    // Generate contextual mock response
    if (content.toLowerCase().includes('hello') || content.toLowerCase().includes('hi')) {
      return "Hello! I'm your AI assistant. How can I help you today?"
    }
    if (content.toLowerCase().includes('help')) {
      return "I'm here to help! I can assist with coding, answer questions, and help you use various tools. What would you like to know?"
    }
    if (content.toLowerCase().includes('code') || content.toLowerCase().includes('program')) {
      return "I'd be happy to help with coding! Please share more details about what you're trying to build or debug."
    }
    if (content.toLowerCase().includes('mcp') || content.toLowerCase().includes('tool')) {
      return "MCP (Model Context Protocol) tools are available! You can use database queries, web search, Git operations, and more. Which tool would you like to use?"
    }
    
    // Return random response
    return AI_RESPONSES[Math.floor(Math.random() * AI_RESPONSES.length)]
  }

  async processConversationMessage(
    conversationId: string,
    userMessage: string,
    overrides?: Partial<AIConfig>
  ): Promise<DBMessage> {
    // If credits system is enabled, attempt to consume credits before calling AI
    if (CREDITS_ENABLED) {
      try {
        await consumeCredits(CREDITS_PER_AI_REQUEST, {
          reason: 'ai_request',
          conversationId,
        })
      } catch (e: any) {
        const msg = e?.message || ''
        if (msg.includes('INSUFFICIENT_CREDITS')) {
          throw new Error('INSUFFICIENT_CREDITS')
        }
        // Re-throw other errors
        throw e
      }
    }
    // Get conversation history
    const { data: messages } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('timestamp', { ascending: true })
      .limit(20) // Last 20 messages for context

    // Convert to AI format
    const aiMessages: AIMessage[] = [
      {
        role: 'system',
        content: overrides?.systemPrompt
          || this.config.systemPrompt
          || 'You are a helpful AI assistant integrated into a messaging app. Be concise and friendly.',
      },
    ]

    if (messages) {
      messages.forEach(msg => {
        // Defensive role mapping to avoid null/invalid roles breaking the AI payload
        const role: 'user' | 'assistant' = (msg.role === 'assistant')
          ? 'assistant'
          : (msg.role === 'user' || msg.user_id ? 'user' : 'assistant')
        aiMessages.push({
          role,
          content: msg.content,
        })
      })
    }

    aiMessages.push({ role: 'user', content: userMessage })

    // Generate AI response
    const aiResponse = await this.generateResponse(aiMessages, overrides)

    // Save AI response to database
    const { data, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        user_id: null, // AI messages have null user_id
        content: aiResponse,
        role: 'assistant',
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to save AI response: ${error.message}`)
    }

    return data as DBMessage
  }

  // Check if AI is configured
  isConfigured(): boolean {
    return !!this.config.apiKey
  }

  // Get current configuration status
  getStatus() {
    return {
      configured: this.isConfigured(),
      model: this.config.model,
      hasApiKey: !!this.config.apiKey,
      apiKeyType: this.config.apiKey === 'demo' ? 'demo' : this.config.apiKey ? 'custom' : 'none',
    }
  }

  async testConnection(overrides: Partial<AIConfig> = {}): Promise<boolean> {
    try {
      const content = await this.generateResponse([
        { role: 'system', content: overrides.systemPrompt || 'You are a test probe answering minimally.' },
        { role: 'user', content: 'ping' },
      ], overrides)
      return typeof content === 'string' && content.length > 0
    } catch (e) {
      return false
    }
  }
}

// Export singleton instance
export const aiService = new AIService()
