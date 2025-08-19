import { supabase } from '@/lib/supabase/client'

// MCP Tool Types
export interface MCPTool {
  id: string
  name: string
  description: string
  category: 'database' | 'web' | 'git' | 'file' | 'terminal' | 'math' | 'github'
  enabled: boolean
  config?: Record<string, any>
}

// MCP Connection Gateway
export interface MCPGateway {
  id: string
  type: 'github' | 'gitlab' | 'database' | 'api'
  name: string
  status: 'connected' | 'disconnected' | 'error'
  config: Record<string, any>
}

class MCPService {
  private tools: MCPTool[] = [
    {
      id: 'db-query',
      name: 'Database Query',
      description: 'Execute SQL queries on connected databases',
      category: 'database',
      enabled: true,
    },
    {
      id: 'web-search',
      name: 'Web Search',
      description: 'Search the web for information',
      category: 'web',
      enabled: true,
    },
    {
      id: 'git-ops',
      name: 'Git Operations',
      description: 'Perform Git operations like clone, commit, push',
      category: 'git',
      enabled: true,
    },
    {
      id: 'file-search',
      name: 'File Search',
      description: 'Search and manipulate files in the workspace',
      category: 'file',
      enabled: true,
    },
    {
      id: 'terminal',
      name: 'Terminal',
      description: 'Execute terminal commands',
      category: 'terminal',
      enabled: true,
    },
    {
      id: 'calculator',
      name: 'Calculator',
      description: 'Perform mathematical calculations',
      category: 'math',
      enabled: true,
    },
    {
      id: 'github-api',
      name: 'GitHub API',
      description: 'Interact with GitHub repositories, issues, and PRs',
      category: 'github',
      enabled: false,
    },
  ]

  private gateways: MCPGateway[] = []
  private githubToken: string | null = null

  constructor() {
    // Load saved configuration
    if (typeof window !== 'undefined') {
      const savedTools = localStorage.getItem('mcp_tools')
      if (savedTools) {
        try {
          this.tools = JSON.parse(savedTools)
        } catch (e) {
          console.error('Failed to load MCP tools config:', e)
        }
      }

      const savedGateways = localStorage.getItem('mcp_gateways')
      if (savedGateways) {
        try {
          this.gateways = JSON.parse(savedGateways)
        } catch (e) {
          console.error('Failed to load MCP gateways:', e)
        }
      }

      this.githubToken = localStorage.getItem('github_token')
    }
  }

  // Get all available tools
  getTools(): MCPTool[] {
    return this.tools
  }

  // Enable/disable a tool
  toggleTool(toolId: string, enabled: boolean) {
    const tool = this.tools.find(t => t.id === toolId)
    if (tool) {
      tool.enabled = enabled
      this.saveTools()
    }
  }

  // Save tools configuration
  private saveTools() {
    if (typeof window !== 'undefined') {
      localStorage.setItem('mcp_tools', JSON.stringify(this.tools))
    }
  }

  // Connect to GitHub gateway
  async connectGitHub(token: string): Promise<MCPGateway> {
    try {
      // Validate token by making a test API call
      const response = await fetch('https://api.github.com/user', {
        headers: {
          Authorization: `token ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error('Invalid GitHub token')
      }

      const userData = await response.json()

      const gateway: MCPGateway = {
        id: 'github-main',
        type: 'github',
        name: `GitHub (${userData.login})`,
        status: 'connected',
        config: {
          username: userData.login,
          email: userData.email,
          repos_url: userData.repos_url,
        },
      }

      // Save token and gateway
      this.githubToken = token
      if (typeof window !== 'undefined') {
        localStorage.setItem('github_token', token)
      }

      // Enable GitHub tool
      const githubTool = this.tools.find(t => t.id === 'github-api')
      if (githubTool) {
        githubTool.enabled = true
        githubTool.config = { connected: true, username: userData.login }
      }

      // Add or update gateway
      const existingIndex = this.gateways.findIndex(g => g.id === 'github-main')
      if (existingIndex >= 0) {
        this.gateways[existingIndex] = gateway
      } else {
        this.gateways.push(gateway)
      }

      this.saveGateways()
      this.saveTools()

      return gateway
    } catch (error) {
      console.error('Failed to connect GitHub:', error)
      throw error
    }
  }

  // Disconnect GitHub gateway
  disconnectGitHub() {
    this.githubToken = null
    if (typeof window !== 'undefined') {
      localStorage.removeItem('github_token')
    }

    // Update gateway status
    const gateway = this.gateways.find(g => g.id === 'github-main')
    if (gateway) {
      gateway.status = 'disconnected'
    }

    // Disable GitHub tool
    const githubTool = this.tools.find(t => t.id === 'github-api')
    if (githubTool) {
      githubTool.enabled = false
      githubTool.config = { connected: false }
    }

    this.saveGateways()
    this.saveTools()
  }

  // Get all gateways
  getGateways(): MCPGateway[] {
    return this.gateways
  }

  // Save gateways configuration
  private saveGateways() {
    if (typeof window !== 'undefined') {
      localStorage.setItem('mcp_gateways', JSON.stringify(this.gateways))
    }
  }

  // Execute a tool
  async executeTool(toolId: string, params: Record<string, any>): Promise<any> {
    const tool = this.tools.find(t => t.id === toolId)
    if (!tool || !tool.enabled) {
      throw new Error(`Tool ${toolId} not found or disabled`)
    }

    switch (toolId) {
      case 'calculator':
        return this.executeCalculator(params as { expression: string })
      case 'web-search':
        return this.executeWebSearch(params as { query: string })
      case 'github-api':
        return this.executeGitHubAPI(params as { endpoint: string; method?: string; data?: any })
      default:
        // Mock response for demo
        return {
          success: true,
          result: `Executed ${tool.name} with params: ${JSON.stringify(params)}`,
          timestamp: new Date().toISOString(),
        }
    }
  }

  private executeCalculator(params: { expression: string }): any {
    try {
      // Simple safe math evaluation (in production, use a proper math parser)
      const result = Function('"use strict"; return (' + params.expression + ')')()
      return {
        success: true,
        expression: params.expression,
        result,
      }
    } catch (error) {
      return {
        success: false,
        error: 'Invalid mathematical expression',
      }
    }
  }

  private async executeWebSearch(params: { query: string }): Promise<any> {
    // Mock web search results
    return {
      success: true,
      query: params.query,
      results: [
        {
          title: `Result 1 for "${params.query}"`,
          url: 'https://example.com/1',
          snippet: 'This is a mock search result...',
        },
        {
          title: `Result 2 for "${params.query}"`,
          url: 'https://example.com/2',
          snippet: 'Another mock search result...',
        },
      ],
    }
  }

  private async executeGitHubAPI(params: { endpoint: string; method?: string; data?: any }): Promise<any> {
    if (!this.githubToken) {
      throw new Error('GitHub not connected')
    }

    try {
      const response = await fetch(`https://api.github.com${params.endpoint}`, {
        method: params.method || 'GET',
        headers: {
          Authorization: `token ${this.githubToken}`,
          'Content-Type': 'application/json',
        },
        body: params.data ? JSON.stringify(params.data) : undefined,
      })

      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status}`)
      }

      const data = await response.json()
      return {
        success: true,
        data,
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  // Get status of all connections
  getStatus() {
    return {
      toolsEnabled: this.tools.filter(t => t.enabled).length,
      toolsTotal: this.tools.length,
      gatewaysConnected: this.gateways.filter(g => g.status === 'connected').length,
      gatewaysTotal: this.gateways.length,
      githubConnected: !!this.githubToken,
    }
  }
}

// Export singleton instance
export const mcpService = new MCPService()
