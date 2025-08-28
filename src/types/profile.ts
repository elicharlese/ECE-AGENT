import { z } from 'zod'

// Reusable Zod schema for profile updates
export const ProfileUpdateSchema = z.object({
  username: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9_-]{3,20}$/i, {
      message: 'Username must be 3-20 characters and contain only letters, numbers, underscores, or hyphens',
    })
    .optional(),
  full_name: z
    .string()
    .min(1, { message: 'Display name is required' })
    .max(50, { message: 'Display name must be at most 50 characters' })
    .optional(),
  avatar_url: z
    .string()
    .url({ message: 'Avatar URL must be a valid URL' })
    .optional(),
  cover_url: z
    .string()
    .url({ message: 'Cover URL must be a valid URL' })
    .optional(),
  solana_address: z
    .string()
    .min(32, { message: 'Solana address looks too short' })
    .max(128, { message: 'Solana address looks too long' })
    .optional(),
})

export type ProfileUpdate = z.infer<typeof ProfileUpdateSchema>
