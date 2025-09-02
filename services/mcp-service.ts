// Note: supabase client not needed here; removing unused import to satisfy lint

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
    {
      id: 'github-mcp',
      name: 'GitHub MCP (Remote)',
      description: 'Use the remote GitHub-hosted MCP server over HTTP/SSE',
      category: 'github',
      enabled: false,
    },
  ]

  private gateways: MCPGateway[] = []
  private githubToken: string | null = null
  private mcpSessionId: string | null = null
  private mcpStreamAbort?: AbortController
  private mcpListeners: Array<(eventText: string) => void> = []
  private lastMcpEventAt: number | null = null

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
      this.mcpSessionId = localStorage.getItem('github_mcp_session')
      if (this.githubToken && this.mcpSessionId) {
        void this.startMcpStream()
      }
    }
  }

  // --- Remote GitHub MCP over backend proxy ---
  private async initRemoteGitHubMCP(): Promise<void> {
    if (!this.githubToken) throw new Error('GitHub not connected')
    // Initialize session by POSTing to proxy; session id returned as header
    const res = await fetch('/api/mcp/github', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-GitHub-PAT': this.githubToken,
      },
      body: JSON.stringify({}),
    })
    if (!res.ok) throw new Error(`MCP init failed: ${res.status}`)
    const sid = res.headers.get('mcp-session-id') || res.headers.get('Mcp-Session-Id')
    if (!sid) throw new Error('Missing MCP session id')
    this.mcpSessionId = sid
    if (typeof window !== 'undefined') {
      localStorage.setItem('github_mcp_session', sid)
    }
    // Start streaming in background
    void this.startMcpStream()
  }

  private async startMcpStream() {
    if (!this.githubToken || !this.mcpSessionId) return
    // Abort previous stream if any
    if (this.mcpStreamAbort) this.mcpStreamAbort.abort()
    const ctrl = new AbortController()
    this.mcpStreamAbort = ctrl

    try {
      const res = await fetch('/api/mcp/github', {
        method: 'GET',
        headers: {
          'X-GitHub-PAT': this.githubToken,
          'Mcp-Session-Id': this.mcpSessionId,
        },
        signal: ctrl.signal,
      })
      if (!res.ok || !res.body) {
        throw new Error(`MCP stream failed: ${res.status}`)
      }
      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      while (true) {
        const { value, done } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        // rudimentary SSE split by double newline
        let idx
        while ((idx = buffer.indexOf('\n\n')) >= 0) {
          const chunk = buffer.slice(0, idx)
          buffer = buffer.slice(idx + 2)
          this.emitMcpEvent(chunk)
        }
      }
    } catch (e) {
      if ((e as any)?.name === 'AbortError') return
      console.warn('MCP stream error:', e)
    } finally {
      // When stream finishes or is aborted, clear the controller so UI reflects non-streaming state
      if (this.mcpStreamAbort === ctrl) {
        this.mcpStreamAbort = undefined
      }
    }
  }

  private async stopRemoteGitHubMCP(): Promise<void> {
    try {
      if (this.mcpStreamAbort) this.mcpStreamAbort.abort()
      if (this.githubToken && this.mcpSessionId) {
        await fetch('/api/mcp/github', {
          method: 'DELETE',
          headers: {
            'X-GitHub-PAT': this.githubToken,
            'Mcp-Session-Id': this.mcpSessionId,
          },
        })
      }
    } catch (_) {
      // ignore
    } finally {
      this.mcpSessionId = null
      if (typeof window !== 'undefined') {
        localStorage.removeItem('github_mcp_session')
      }
    }
  }

  // Public: start or resume SSE streaming. If there's no session, initialize it.
  public async startMcpStreaming(): Promise<void> {
    if (!this.githubToken) throw new Error('GitHub not connected')
    if (!this.mcpSessionId) {
      await this.initRemoteGitHubMCP()
      return
    }
    // Resume streaming with existing session
    void this.startMcpStream()
  }

  // Public: stop/pause SSE streaming without terminating upstream session
  public stopMcpStreaming(): void {
    if (this.mcpStreamAbort) {
      try {
        this.mcpStreamAbort.abort()
      } catch (_) {
        // noop
      } finally {
        this.mcpStreamAbort = undefined
      }
    }
  }

  private async executeGitHubMCP(params: { request?: any }): Promise<any> {
    if (!this.githubToken) {
      throw new Error('GitHub not connected')
    }
    // If there is no session yet, try to init
    if (!this.mcpSessionId) {
      try {
        await this.initRemoteGitHubMCP()
      } catch (e) {
        return { success: false, error: (e as Error).message }
      }
    }
    // Basic ping without specific request payload; users of MCP can wire richer requests later
    const res = await fetch('/api/mcp/github', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-GitHub-PAT': this.githubToken,
        'Mcp-Session-Id': this.mcpSessionId as string,
      },
      body: JSON.stringify(params.request ?? {}),
    })
    const text = await res.text()
    return {
      success: res.ok,
      sessionId: this.mcpSessionId,
      raw: text,
    }
  }

  private async executeWebSearch(params: { query: string }): Promise<any> {
    // For now, return an error indicating the service needs to be configured
    return {
      success: false,
      query: params.query,
      error: 'Web search service not configured. Please integrate with a search API provider.',
      results: []
    }
  }
    }
-e 
// Export singleton instance
export const mcpService = new MCPService()
