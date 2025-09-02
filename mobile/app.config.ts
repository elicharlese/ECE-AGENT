/* Derive Expo config from app.json and process.env for Supabase */
try {
  // Load environment variables from .env.local if present
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  require('dotenv').config({ path: '.env.local' })
} catch {}

const appJson = require('./app.json')

const url = process.env.EXPO_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const anon = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export default () => ({
  ...appJson.expo,
  extra: {
    ...(appJson.expo?.extra ?? {}),
    EXPO_PUBLIC_SUPABASE_URL: url,
    EXPO_PUBLIC_SUPABASE_ANON_KEY: anon,
  },
})
