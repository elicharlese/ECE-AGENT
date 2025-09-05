export type Theme = 'light' | 'dark' | 'system'

export type ResolvedTheme = 'light' | 'dark'

export interface ThemeTokens {
  background: string      // Main background color
  foreground: string      // Primary text color
  surface: string         // Card/container backgrounds
  surfaceText: string     // Text on surface elements
  subtleText: string      // Secondary/muted text
  card: string           // Card component backgrounds
}

export interface ThemeContextValue {
  theme: Theme
  resolvedTheme: ResolvedTheme
  setTheme: (theme: Theme) => void
  isDark: boolean
  tokens: ThemeTokens
}