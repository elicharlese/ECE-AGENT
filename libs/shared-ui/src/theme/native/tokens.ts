import type { ThemeTokens } from '../types'

export const lightTokens: ThemeTokens = {
  background: '#ffffff',
  foreground: '#0f172a', // slate-900
  surface: '#ffffff',
  surfaceText: '#0f172a',
  subtleText: '#6b7280', // gray-500
  card: '#ffffff',
}

export const darkTokens: ThemeTokens = {
  background: '#0b0c10', // approx hsl(240 10% 3.9%)
  foreground: '#f8fafc', // slate-50
  surface: '#0f172a',
  surfaceText: '#e5e7eb', // gray-200
  subtleText: '#9ca3af', // gray-400
  card: '#111827', // gray-900
}
