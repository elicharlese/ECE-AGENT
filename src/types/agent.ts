import { z } from "zod"

// Zod schemas for runtime validation
export const AgentStatusSchema = z.enum(["online", "offline", "busy"]) // align with services/agent-service.ts

export const AgentInsertSchema = z.object({
  name: z.string().min(2).max(60),
  description: z.string().max(500).optional().default(""),
  model: z.string().max(120).optional().default("gpt-4o-mini"),
  avatar_url: z.string().url().optional().nullable(),
  capabilities: z.array(z.string()).optional().default([]),
  mcp_tools: z.array(z.string()).optional().default([]),
  status: AgentStatusSchema.optional().default("online"),
  system_prompt: z.string().max(4000).optional().default(""),
})

export const AgentUpdateSchema = AgentInsertSchema.partial()

// DB row type (Supabase table: agents)
export type AgentRow = {
  id: string
  user_id: string
  name: string
  description: string | null
  model: string | null
  avatar_url: string | null
  capabilities: string[] | null
  mcp_tools: string[] | null
  status: z.infer<typeof AgentStatusSchema>
  system_prompt: string | null
  created_at: string
}

// Convenience type for client
export type AgentCreateInput = z.infer<typeof AgentInsertSchema>
export type AgentUpdateInput = z.infer<typeof AgentUpdateSchema>
