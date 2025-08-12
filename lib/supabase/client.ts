import { createClient } from '@supabase/supabase-js'

// Get Supabase URL and anon key from environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://hefxysjujswkiaaqqpbc.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhlZnh5c2p1anN3a2lhYXFxcGJjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUwMjU3MjMsImV4cCI6MjA3MDYwMTcyM30.5Dv6Jm5fJ5v6Jm5fJ5v6Jm5fJ5v6Jm5fJ5v6Jm5fJ5v6'

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
