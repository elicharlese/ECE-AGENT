import { z } from 'zod'

export interface MessageUser {
  id: string
  name?: string | null
  avatar_url?: string | null
}

export interface MessageReaction {
  emoji: string
  count: number
}

export interface Message {
  id: string
  conversation_id: string
  user_id: string
  content: string
  created_at: string
  edited_at?: string | null
  read_at?: string | null
  role?: 'user' | 'assistant' | 'system'
  is_ai?: boolean
  metadata?: Record<string, unknown> | null
  type?: string
  user?: MessageUser
  reactions?: MessageReaction[]
}

// Zod schemas for basic runtime validation (optional use)
export const messageUserSchema = z.object({
  id: z.string(),
  name: z.string().nullable().optional(),
  avatar_url: z.string().url().nullable().optional(),
})

export const messageReactionSchema = z.object({
  emoji: z.string(),
  count: z.number().int().nonnegative(),
})

export const messageSchema = z.object({
  id: z.string(),
  conversation_id: z.string(),
  user_id: z.string(),
  content: z.string(),
  created_at: z.string(),
  edited_at: z.string().nullable().optional(),
  read_at: z.string().nullable().optional(),
  role: z.enum(['user', 'assistant', 'system']).optional(),
  is_ai: z.boolean().optional(),
  metadata: z.record(z.unknown()).nullable().optional(),
  type: z.string().optional(),
  user: messageUserSchema.optional(),
  reactions: z.array(messageReactionSchema).optional(),
})

export type MessageDTO = z.infer<typeof messageSchema>
