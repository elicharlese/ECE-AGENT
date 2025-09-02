import React, { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { useColorScheme } from 'react-native'
import type { ThemeName, ResolvedThemeName, ThemeTokens } from '../types'
import { lightTokens, darkTokens } from './tokens'

export type RNThemeContextValue = {
  theme: ThemeName
  resolvedTheme: ResolvedThemeName
  setTheme: (t: ThemeName) => void
  isDark: boolean
  tokens: ThemeTokens
}

const RNThemeContext = createContext<RNThemeContextValue | undefined>(undefined)

export type RNThemeProviderProps = React.PropsWithChildren<{
  defaultTheme?: ThemeName
}>

export function RNThemeProvider({ children, defaultTheme = 'system' }: RNThemeProviderProps) {
  const systemScheme = useColorScheme() // 'light' | 'dark' | null
  const [theme, setThemeState] = useState<ThemeName>(defaultTheme)

  const setTheme = useCallback((t: ThemeName) => {
    setThemeState(t)
  }, [])

  const resolvedTheme: ResolvedThemeName = useMemo(() => {
    if (theme === 'system') {
      return systemScheme === 'dark' ? 'dark' : 'light'
    }
    return theme
  }, [theme, systemScheme])

  const tokens: ThemeTokens = useMemo(() => (resolvedTheme === 'dark' ? darkTokens : lightTokens), [resolvedTheme])

  const value = useMemo<RNThemeContextValue>(() => ({
    theme,
    resolvedTheme,
    setTheme,
    isDark: resolvedTheme === 'dark',
    tokens,
  }), [theme, resolvedTheme, setTheme, tokens])

  return <RNThemeContext.Provider value={value}>{children}</RNThemeContext.Provider>
}

export function useRNTheme(): RNThemeContextValue {
  const ctx = useContext(RNThemeContext)
  if (!ctx) throw new Error('useRNTheme must be used within RNThemeProvider')
  return ctx
}
