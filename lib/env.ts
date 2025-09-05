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

// In development, provide safe defaults to avoid blocking the app with missing envs
const defaultDevEnv: Partial<Record<keyof z.infer<typeof envSchema>, string>> = {
  NEXT_PUBLIC_SUPABASE_URL: 'http://localhost:54321',
  NEXT_PUBLIC_SUPABASE_ANON_KEY: 'dev-anon-key',
  SUPABASE_SERVICE_ROLE_KEY: 'dev-service-role-key',
  LIVEKIT_URL: 'http://localhost:7880',
  NEXT_PUBLIC_LIVEKIT_WS_URL: 'ws://localhost:7880',
  LIVEKIT_API_KEY: 'dev-livekit-key',
  LIVEKIT_API_SECRET: 'dev-livekit-secret',
  OPENROUTER_API_KEY: 'dev-openrouter-key',
  NEXT_PUBLIC_OPENROUTER_API_KEY: 'dev-openrouter-public-key',
  STRIPE_SECRET_KEY: 'sk_test_dev',
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: 'pk_test_dev',
  NODE_ENV: 'development',
}

try {
  const rawEnv = (process.env.NODE_ENV === 'development')
    ? { ...defaultDevEnv, ...process.env }
    : process.env
  validatedEnv = envSchema.parse(rawEnv)
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
    
    // In development, fall back to safe defaults merged with any provided envs
    console.warn('⚠️  Using development fallback environment values.')
    const fallback = { ...defaultDevEnv, ...process.env, NODE_ENV: 'development' }
    try {
      validatedEnv = envSchema.parse(fallback)
    } catch {
      // As a last resort, coerce to the expected shape without re-throwing in dev
      validatedEnv = fallback as unknown as z.infer<typeof envSchema>
    }
  } else {
    // Unknown error: rethrow
    throw error
  }
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
