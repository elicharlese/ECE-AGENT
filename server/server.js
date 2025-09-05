const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// Load environment variables
// 1) server/.env
dotenv.config();
// 2) root .env.local (to access NEXT_PUBLIC_* for local dev)
const rootEnvLocal = path.resolve(__dirname, '..', '.env.local');
if (fs.existsSync(rootEnvLocal)) {
  dotenv.config({ path: rootEnvLocal, override: false });
}

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Supabase setup
const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Authentication middleware
const authenticateUser = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  try {
    // Extract token from 'Bearer <token>' format
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;
    
    // Verify the token with Supabase
    const { data, error } = await supabase.auth.getUser(token);
    
    if (error || !data.user) {
      console.error('Token verification error:', error?.message || 'Invalid token');
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
    
    // Add user info to request object
    req.user = data.user;
    next();
  } catch (err) {
    console.error('Authentication error:', err);
    return res.status(500).json({ error: 'Authentication failed' });
  }
};

// Import conversation model
const conversationModel = require('./db/conversationModel');

// Import agent configurations
const agentConfigs = require('./config/agents');

// Utility function to get current timestamp
const getCurrentTimestamp = () => new Date().toISOString();

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: getCurrentTimestamp() });
});

// Solana authentication endpoint
app.post('/api/auth/solana', async (req, res) => {
  try {
    const { publicKey, signature, message, timestamp } = req.body;
    
    if (!publicKey || !signature || !message || !timestamp) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Verify timestamp is recent (within 5 minutes)
    const now = Date.now();
    if (now - timestamp > 5 * 60 * 1000) {
      return res.status(400).json({ error: 'Request expired' });
    }
    
    // In a production environment, you would verify the signature here
    // For now, we'll create a mock user based on the public key
    
    // Check if user exists or create new one
    // First, try to find user by email (Solana wallet address)
    const { data: existingUser, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('email', `${publicKey}@solana.wallet`)
      .single();
    
    let user;
    if (fetchError || !existingUser) {
      // Create new user with Solana public key as identifier
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email: `${publicKey}@solana.wallet`,
        password: 'solana-wallet-user', // Placeholder password for Supabase auth
        email_confirm: true,
        user_metadata: {
          wallet_type: 'solana',
          public_key: publicKey,
          display_name: `Solana User ${publicKey.slice(0, 8)}...`
        }
      });
      
      if (createError) {
        console.error('Error creating Solana user:', createError);
        return res.status(500).json({ error: 'Failed to create user' });
      }
      
      user = newUser.user;
    } else {
      // Get full user object from Supabase auth
      const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(existingUser.id);
      if (authError) {
        console.error('Error fetching user:', authError);
        return res.status(500).json({ error: 'Failed to fetch user' });
      }
      user = authUser.user;
    }
    
    // Generate access token for the user
    const { data: sessionData, error: sessionError } = await supabase.auth.admin.signInWithPassword({
      email: user.email,
      password: 'solana-wallet-user'
    });
    
    if (sessionError) {
      console.error('Error generating session:', sessionError);
      return res.status(500).json({ error: 'Failed to generate session' });
    }
    
    res.json({
      user: user,
      access_token: sessionData.session.access_token,
      refresh_token: sessionData.session.refresh_token
    });
    
  } catch (error) {
    console.error('Solana auth error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create test user endpoint (for development)
app.post('/api/auth/create-test-user', async (req, res) => {
  try {
    const { data: user, error } = await supabase.auth.admin.createUser({
      email: 'test@example.com',
      password: 'password123',
      email_confirm: true,
      user_metadata: {
        display_name: 'Test User'
      }
    });
    
    if (error) {
      // User might already exist
      if (error.message.includes('already registered')) {
        return res.json({ message: 'Test user already exists' });
      }
      throw error;
    }
    
    res.json({ message: 'Test user created successfully', user: user.user });
  } catch (error) {
    console.error('Error creating test user:', error);
    res.status(500).json({ error: 'Failed to create test user' });
  }
});

// Simple login endpoint for testing (in a real app, use Supabase Auth)
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // In a real implementation, you would verify credentials with Supabase Auth
    // For testing purposes, we'll just return a mock token
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    
    // Mock user data
    const user = {
      id: '00000000-0000-0000-0000-000000000000',
      email: email,
      created_at: getCurrentTimestamp()
    };
    
    // Mock JWT token
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwMDAwMDAwMC0wMDAwLTAwMDAtMDAwMC0wMDAwMDAwMDAwMDAiLCJlbWFpbCI6InRlc3RAZXhhbXBsZS5jb20iLCJpYXQiOjE3NTUwMjU3MjMsImV4cCI6MjA3MDYwMTcyM30.5Dv6Jm5fJ5v6Jm5fJ5v6Jm5fJ5v6Jm5fJ5v6Jm5fJ5v6';
    
    res.status(200).json({ user, token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all agent configurations
app.get('/api/agents', (req, res) => {
  res.status(200).json(agentConfigs);
});

// Get specific agent configuration
app.get('/api/agents/:agentId', (req, res) => {
  const { agentId } = req.params;
  const agent = agentConfigs.find(a => a.id === agentId);
  
  if (!agent) {
    return res.status(404).json({ error: 'Agent not found' });
  }
  
  res.status(200).json(agent);
});

// Chat endpoint (authenticated)
app.post('/api/chat', authenticateUser, async (req, res) => {
  try {
    const { message, conversationId, agentId } = req.body;
    
    // Validate input
    if (!message || !agentId) {
      return res.status(400).json({ error: 'Message and agentId are required' });
    }
    
    // Get agent configuration
    const agent = agentConfigs.find(a => a.id === agentId);
    if (!agent) {
      return res.status(404).json({ error: 'Agent not found' });
    }
    
    // Load conversation history
    let conversation;
    if (conversationId) {
      conversation = await conversationModel.getConversationById(conversationId);
      if (!conversation) {
        return res.status(404).json({ error: 'Conversation not found' });
      }
    } else {
      // Create new conversation
      conversation = {
        id: null,
        title: message.substring(0, 50) + (message.length > 50 ? '...' : ''),
        agent_id: agentId,
        user_id: req.user.id,
        created_at: getCurrentTimestamp(),
        updated_at: getCurrentTimestamp(),
        messages: []
      };
    }
    
    // Add user message to conversation
    const userMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: message,
      timestamp: getCurrentTimestamp()
    };
    conversation.messages.push(userMessage);
    
    // Save conversation
    const savedConversation = await conversationModel.saveConversation(conversation);
    
    // Simulate agent response (in a real implementation, this would call the LLM API)
    const agentResponseContent = `This is a simulated response from ${agent.name}. In a real implementation, this would be generated by calling the ${agent.model} API.`;
    
    const agentMessage = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: agentResponseContent,
      timestamp: getCurrentTimestamp()
    };
    
    // Add agent response to conversation
    savedConversation.messages.push(agentMessage);
    
    // Save updated conversation
    const updatedConversation = await conversationModel.saveConversation(savedConversation);
    
    // Return the agent's response
    res.status(200).json({
      conversationId: updatedConversation.id,
      message: agentMessage
    });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get conversation history (authenticated)
app.get('/api/conversations/:conversationId', authenticateUser, async (req, res) => {
  try {
    const { conversationId } = req.params;
    
    const conversation = await conversationModel.getConversationById(conversationId);
    
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }
    
    // Check if user has access to this conversation
    if (conversation.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    res.status(200).json(conversation);
  } catch (error) {
    console.error('Get conversation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all conversations for an agent (authenticated)
app.get('/api/conversations/agent/:agentId', authenticateUser, async (req, res) => {
  try {
    const { agentId } = req.params;
    const userId = req.user.id;
    
    const conversations = await conversationModel.getConversationsByAgentId(agentId, userId);
    
    res.status(200).json(conversations);
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// --- Remote GitHub MCP Proxy (HTTP/SSE) ---
// Proxies MCP Streamable HTTP transport to GitHub's hosted MCP server without persisting any data locally
// Reference: https://github.com/github/github-mcp-server
app.post('/api/mcp/github', async (req, res) => {
  try {
    const remoteUrl = 'https://api.githubcopilot.com/mcp/';
    const pat = req.headers['x-github-pat'] || req.headers['authorization'];
    const sessionId = req.headers['mcp-session-id'];

    if (!pat) {
      return res.status(400).json({ error: 'Missing GitHub PAT or Authorization header' });
    }

    const upstream = await fetch(remoteUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Always send Bearer form to remote MCP
        'Authorization': String(pat).startsWith('Bearer ') ? String(pat) : `Bearer ${pat}`,
        ...(sessionId ? { 'Mcp-Session-Id': String(sessionId) } : {}),
      },
      body: JSON.stringify(req.body ?? {}),
    });

    // Expose session header for browser access
    const upstreamSessionId = upstream.headers.get('Mcp-Session-Id');
    if (upstreamSessionId) {
      res.setHeader('Mcp-Session-Id', upstreamSessionId);
    }
    res.setHeader('Access-Control-Expose-Headers', 'Mcp-Session-Id');

    const text = await upstream.text();
    res.status(upstream.status).type(upstream.headers.get('content-type') || 'application/json').send(text);
  } catch (err) {
    console.error('MCP proxy POST error:', err);
    res.status(500).json({ error: 'MCP proxy POST failed' });
  }
});

// GET – stream SSE notifications
app.get('/api/mcp/github', async (req, res) => {
  try {
    const remoteUrl = 'https://api.githubcopilot.com/mcp/';
    const pat = req.headers['x-github-pat'] || req.headers['authorization'];
    const sessionId = req.headers['mcp-session-id'];

    if (!pat) {
      return res.status(400).json({ error: 'Missing GitHub PAT or Authorization header' });
    }
    if (!sessionId) {
      return res.status(400).json({ error: 'Missing Mcp-Session-Id header' });
    }

    const upstream = await fetch(remoteUrl, {
      method: 'GET',
      headers: {
        'Authorization': String(pat).startsWith('Bearer ') ? String(pat) : `Bearer ${pat}`,
        'Mcp-Session-Id': String(sessionId),
      },
    });

    // Propagate headers suitable for SSE
    res.setHeader('Content-Type', upstream.headers.get('content-type') || 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Expose-Headers', 'Mcp-Session-Id');
    const upstreamSessionId = upstream.headers.get('Mcp-Session-Id');
    if (upstreamSessionId) {
      res.setHeader('Mcp-Session-Id', upstreamSessionId);
    }

    if (!upstream.body) {
      res.status(502).end('Upstream returned no body');
      return;
    }

    // Stream body to client
    const { Readable } = require('stream');
    Readable.fromWeb(upstream.body).pipe(res);
  } catch (err) {
    console.error('MCP proxy GET error:', err);
    if (!res.headersSent) res.status(500).end('MCP proxy GET failed');
  }
});

// DELETE – terminate session upstream
app.delete('/api/mcp/github', async (req, res) => {
  try {
    const remoteUrl = 'https://api.githubcopilot.com/mcp/';
    const pat = req.headers['x-github-pat'] || req.headers['authorization'];
    const sessionId = req.headers['mcp-session-id'];

    if (!pat || !sessionId) {
      return res.status(400).json({ error: 'Missing credentials or session id' });
    }

    const upstream = await fetch(remoteUrl, {
      method: 'DELETE',
      headers: {
        'Authorization': String(pat).startsWith('Bearer ') ? String(pat) : `Bearer ${pat}`,
        'Mcp-Session-Id': String(sessionId),
      },
    });

    const text = await upstream.text();
    res.setHeader('Access-Control-Expose-Headers', 'Mcp-Session-Id');
    res.status(upstream.status).type(upstream.headers.get('content-type') || 'application/json').send(text);
  } catch (err) {
    console.error('MCP proxy DELETE error:', err);
    res.status(500).json({ error: 'MCP proxy DELETE failed' });
  }
});

// Import WebSocket server
const http = require('http');
const { setupWebSocketServer } = require('./websocket');

// Create HTTP server
const server = http.createServer(app);

// Setup WebSocket server
const wss = setupWebSocketServer(server);

// Start server
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
  console.log(`WebSocket server ready`);
});
