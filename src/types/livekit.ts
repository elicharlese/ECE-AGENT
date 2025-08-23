import { z } from 'zod'

export const LivekitGrantsSchema = z.object({
  canPublish: z.boolean().optional(),
  canSubscribe: z.boolean().optional(),
  canPublishData: z.boolean().optional(),
})

export const LivekitTokenRequestSchema = z.object({
  roomName: z.string().min(1, 'roomName is required'),
  identity: z.string().min(1, 'identity is required'),
  metadata: z.record(z.unknown()).optional(),
  grants: LivekitGrantsSchema.optional(),
})

export type LivekitTokenRequest = z.infer<typeof LivekitTokenRequestSchema>

export const LivekitTokenResponseSchema = z.object({
  token: z.string().min(1),
  wsUrl: z.string().min(1),
})

export type LivekitTokenResponse = z.infer<typeof LivekitTokenResponseSchema>

export const LivekitTokenErrorSchema = z.object({
  error: z.string(),
})

export type LivekitTokenError = z.infer<typeof LivekitTokenErrorSchema>
