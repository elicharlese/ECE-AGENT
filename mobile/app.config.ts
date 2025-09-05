/* Derive Expo config from app.json and process.env for Supabase and EAS Update */
try {
  // Load environment variables from .env.local next to this file (works regardless of CWD)
  const path = require('path')
  require('dotenv').config({ path: path.join(__dirname, '.env.local') })
} catch {}

const appJson = require('./app.json')

const url = process.env.EXPO_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const anon = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const expoConfig = () => {
  const base = appJson.expo || {}
  const existingPlugins: any[] = Array.isArray(base.plugins) ? [...base.plugins] : []

  // Ensure expo-updates plugin is present
  if (!existingPlugins.some((p) => (Array.isArray(p) ? p[0] : p) === 'expo-updates')) {
    existingPlugins.push('expo-updates')
  }

  // Resolve EAS project id from env or app.json
  const projectId =
    process.env.EXPO_PUBLIC_EAS_PROJECT_ID ||
    process.env.EAS_PROJECT_ID ||
    base?.extra?.eas?.projectId

  const updates = projectId
    ? { url: `https://u.expo.dev/${projectId}` }
    : undefined

  return {
    ...base,
    plugins: existingPlugins,
    runtimeVersion: { policy: 'appVersion' },
    ...(updates ? { updates } : {}),
    extra: {
      ...(base.extra ?? {}),
      eas: {
        ...(base.extra?.eas ?? {}),
        ...(projectId ? { projectId } : {}),
      },
      EXPO_PUBLIC_SUPABASE_URL: url,
      EXPO_PUBLIC_SUPABASE_ANON_KEY: anon,
    },
  }
}

export default expoConfig
