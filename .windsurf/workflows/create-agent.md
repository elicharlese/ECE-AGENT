---
description: Create and configure a new AI agent
---

# Create New AI Agent Workflow

Follow these steps to create and configure a new AI agent in the ECE-AGENT platform:

## 1. Define Agent Configuration
Create a new agent configuration in `services/agent-service.ts`:

```typescript
{
  id: 'unique-agent-id',
  name: 'Agent Name',
  description: 'Detailed description of agent capabilities',
  capabilities: ['capability1', 'capability2'],
  mcpTools: ['tool1', 'tool2'],
  status: 'online'
}
```

## 2. Set Up MCP Tool Integration
Configure the MCP tools the agent will use:
- brave-search: Web and local search
- linear: Project management
- git: Version control operations
- stripe: Payment processing
- sequential-thinking: Problem solving
- memory: Knowledge graph

## 3. Create Agent Response Logic
Implement custom response logic in `processWithMCP()` method:
- Define trigger phrases
- Map tools to capabilities
- Set confidence levels

## 4. Configure Supabase Tables
// turbo
Create agent tables in Supabase:

```sql
CREATE TABLE agents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  capabilities JSONB,
  mcp_tools JSONB,
  status TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE agent_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id TEXT REFERENCES agents(agent_id),
  conversation_id TEXT,
  content TEXT,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## 5. Test Agent Integration
- Start development server: `npm run dev`
- Navigate to `/messages`
- Select the new agent from sidebar
- Test conversation and MCP tool execution
- Verify Supabase data persistence

## 6. Deploy Agent
- Commit changes: `git add . && git commit -m "feat: add new AI agent"`
- Push to repository: `git push`
- Deploy via Vercel/Netlify
