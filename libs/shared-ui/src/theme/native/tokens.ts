import { ThemeTokens } from '../types'

export const lightThemeTokens: ThemeTokens = {
  background: '#ffffff',
  foreground: '#000000',
  surface: '#f8f9fa',
  surfaceText: '#1a1a1a',
  subtleText: '#666666',
  card: '#ffffff'
}

export const darkThemeTokens: ThemeTokens = {
  background: '#0a0a0a',
  foreground: '#ffffff',
  surface: '#1a1a1a',
  surfaceText: '#f5f5f5',
  subtleText: '#a3a3a3',
  card: '#1a1a1a'
}

export const getThemeTokens = (isDark: boolean): ThemeTokens => {
  return isDark ? darkThemeTokens : lightThemeTokens
}