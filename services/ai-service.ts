import { supabase } from '@/lib/supabase/client'
import { sendMessage as sendDbMessage, DBMessage } from './message-service'

// AI Service Configuration
interface AIConfig {
  apiKey?: string
  model?: string
  temperature?: number
  maxTokens?: number
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
  }

  constructor() {
    // Check for API keys in environment
    if (typeof window !== 'undefined') {
      const storedKey = localStorage.getItem('openai_api_key')
      if (storedKey) {
        this.config.apiKey = storedKey
      }
    }
  }

  setApiKey(apiKey: string) {
    this.config.apiKey = apiKey
    if (typeof window !== 'undefined') {
      localStorage.setItem('openai_api_key', apiKey)
    }
  }

  async generateResponse(messages: AIMessage[]): Promise<string> {
    // If we have an API key, use real OpenAI API
    if (this.config.apiKey && this.config.apiKey !== 'demo') {
      try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.config.apiKey}`,
          },
          body: JSON.stringify({
            model: this.config.model,
            messages,
            temperature: this.config.temperature,
            max_tokens: this.config.maxTokens,
          }),
        })

        if (!response.ok) {
          throw new Error(`OpenAI API error: ${response.status}`)
        }

        const data = await response.json()
        return data.choices[0]?.message?.content || 'No response generated'
      } catch (error) {
        console.error('AI API error:', error)
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
    userMessage: string
  ): Promise<DBMessage> {
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
        content: 'You are a helpful AI assistant integrated into a messaging app. Be concise and friendly.',
      },
    ]

    if (messages) {
      messages.forEach(msg => {
        aiMessages.push({
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
        })
      })
    }

    aiMessages.push({ role: 'user', content: userMessage })

    // Generate AI response
    const aiResponse = await this.generateResponse(aiMessages)

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
}

// Export singleton instance
export const aiService = new AIService()
