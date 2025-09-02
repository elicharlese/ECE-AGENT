import { z } from 'zod'

// Environment variable validation schema
const envSchema = z.object({
  // Supabase Configuration
  NEXT_PUBLIC_SUPABASE_URL: z.string().url('Invalid Supabase URL'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, 'Supabase anon key is required'),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, 'Supabase service role key is required'),
  
  // LiveKit Configuration
  LIVEKIT_URL: z.string().url('Invalid LiveKit URL'),
  NEXT_PUBLIC_LIVEKIT_WS_URL: z.string().url('Invalid LiveKit WebSocket URL'),
  LIVEKIT_API_KEY: z.string().min(1, 'LiveKit API key is required'),
  LIVEKIT_API_SECRET: z.string().min(1, 'LiveKit API secret is required'),
  
  // OpenRouter API
  OPENROUTER_API_KEY: z.string().min(1, 'OpenRouter API key is required'),
  NEXT_PUBLIC_OPENROUTER_API_KEY: z.string().min(1, 'OpenRouter public API key is required'),
  
  // Stripe Configuration
  STRIPE_SECRET_KEY: z.string().min(1, 'Stripe secret key is required'),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().min(1, 'Stripe publishable key is required'),
  
  // Optional environment variables
  NEXT_PUBLIC_CREDITS_ENABLED: z.string().optional(),
  NEXT_PUBLIC_CREDITS_PER_AI_REQUEST: z.string().optional(),
  NEXT_PUBLIC_WEBSOCKET_URL: z.string().optional(),
  
  // Node environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
})

// Validate environment variables
let validatedEnv: z.infer<typeof envSchema>

try {
  validatedEnv = envSchema.parse(process.env)
} catch (error) {
  if (error instanceof z.ZodError) {
    console.error('❌ Environment variable validation failed:')
    error.errors.forEach((err) => {
      console.error(`  - ${err.path.join('.')}: ${err.message}`)
    })
    
    // In production, throw the error to prevent startup
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Invalid environment configuration')
    }
    
    // In development, use default values or throw
    throw new Error('Environment validation failed. Please check your .env.local file.')
  }
  throw error
}

// Export validated environment variables
export const env = validatedEnv

// Helper function to check if we're in production
export const isProduction = env.NODE_ENV === 'production'
export const isDevelopment = env.NODE_ENV === 'development'
export const isTest = env.NODE_ENV === 'test'

// Helper function to get environment-specific values
export const getEnvValue = (key: keyof typeof validatedEnv, defaultValue?: string): string => {
  const value = validatedEnv[key]
  if (value === undefined || value === null) {
    if (defaultValue !== undefined) {
      return defaultValue
    }
    throw new Error(`Environment variable ${key} is not set`)
  }
  return String(value)
}
