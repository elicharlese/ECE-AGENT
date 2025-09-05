import { z } from 'zod'

export const ConversationSchema = z.object({
  id: z.string(),
  title: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
  user_id: z.string(),
  agent_id: z.string().optional().nullable(),
  last_message: z.string().optional().nullable(),
  unread_count: z.number().optional().nullable(),
  // Per-user flags merged from membership (optional because service may not include them)
  is_archived: z.boolean().optional().nullable(),
})

export type ConversationType = z.infer<typeof ConversationSchema>

export const ConversationParticipantSchema = z.object({
  conversation_id: z.string(),
  user_id: z.string(),
  role: z.string(),
  last_read_at: z.string().optional().nullable(),
  is_archived: z.boolean().optional().nullable(),
})

export type ConversationParticipant = z.infer<typeof ConversationParticipantSchema>

export const NewConversationRequestSchema = z.object({
  title: z.string().min(1, 'title is required'),
  participantIds: z.array(z.string()).default([]),
  agentId: z.string().optional(),
})

export type NewConversationRequest = z.infer<typeof NewConversationRequestSchema>

export const NewConversationResponseSchema = z.object({
  conversation: ConversationSchema,
  participants: z.array(ConversationParticipantSchema).optional(),
})

export type NewConversationResponse = z.infer<typeof NewConversationResponseSchema>
