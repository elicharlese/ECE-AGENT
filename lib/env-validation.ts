import { z } from "zod"

const envSchema = z.object({
  // Supabase (Required)
  NEXT_PUBLIC_SUPABASE_URL: z.string().url("Invalid Supabase URL"),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, "Supabase anon key is required"),
  
  // Database (Optional - only if using Prisma)
  DATABASE_URL: z.string().optional(),
  DIRECT_URL: z.string().optional(),
  
  // LiveKit (Required for calls)
  LIVEKIT_API_KEY: z.string().min(1, "LiveKit API key is required"),
  LIVEKIT_API_SECRET: z.string().min(1, "LiveKit API secret is required"),
  NEXT_PUBLIC_LIVEKIT_WS_URL: z.string().url("Invalid LiveKit WebSocket URL"),

  // WebSocket (Optional - mock fallback used when absent)
  NEXT_PUBLIC_WEBSOCKET_URL: z.string().url("Invalid WebSocket URL").optional(),

  // Stripe (Optional)
  STRIPE_SECRET_KEY: z.string().optional(),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),

  // Supabase service role for webhooks (Optional)
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),

  // Credits (Optional)
  NEXT_PUBLIC_CREDITS_ENABLED: z.enum(["true", "false"]).optional(),
  NEXT_PUBLIC_CREDITS_PER_AI_REQUEST: z.string().optional(),
  NEXT_PUBLIC_CREDITS_PURCHASE_URL: z.string().url("Invalid Credits Purchase URL").optional(),
  // Pricing helpers (Optional)
  CREDITS_CURRENCY: z.string().optional(),
  CENTS_PER_CREDIT: z.string().optional(),
  
  // Optional
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
})

export type Env = z.infer<typeof envSchema>

let validatedEnv: Env | null = null

export function validateEnv(): Env {
  if (validatedEnv) {
    return validatedEnv
  }

  try {
    validatedEnv = envSchema.parse(process.env)
    return validatedEnv
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join('\n')
      throw new Error(`Environment validation failed:\n${missingVars}`)
    }
    throw error
  }
}

export function getEnv(): Env {
  if (!validatedEnv) {
    throw new Error("Environment not validated. Call validateEnv() first.")
  }
  return validatedEnv
}

// Client-side safe environment variables
export const clientEnv = {
  SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  LIVEKIT_WS_URL: process.env.NEXT_PUBLIC_LIVEKIT_WS_URL,
  WEBSOCKET_URL: process.env.NEXT_PUBLIC_WEBSOCKET_URL,
  STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  CREDITS_ENABLED: process.env.NEXT_PUBLIC_CREDITS_ENABLED,
  CREDITS_PER_AI_REQUEST: process.env.NEXT_PUBLIC_CREDITS_PER_AI_REQUEST,
  CREDITS_PURCHASE_URL: process.env.NEXT_PUBLIC_CREDITS_PURCHASE_URL,
  NODE_ENV: process.env.NODE_ENV,
} as const
