import React, { createContext, useContext, useEffect, useState, useMemo, ReactNode } from 'react'
import { Appearance, ColorSchemeName } from 'react-native'
import { Theme, ResolvedTheme, ThemeContextValue } from '../types'
import { getThemeTokens } from './tokens'

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

interface RNThemeProviderProps {
  children: ReactNode
  defaultTheme?: Theme
}

export function RNThemeProvider({ children, defaultTheme = 'system' }: RNThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(defaultTheme)
  const [systemTheme, setSystemTheme] = useState<ColorSchemeName>(Appearance.getColorScheme())

  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setSystemTheme(colorScheme)
    })

    return () => subscription?.remove()
  }, [])

  const resolvedTheme: ResolvedTheme = useMemo(() => {
    if (theme === 'system') {
      return systemTheme === 'dark' ? 'dark' : 'light'
    }
    return theme
  }, [theme, systemTheme])

  const isDark = resolvedTheme === 'dark'
  const tokens = useMemo(() => getThemeTokens(isDark), [isDark])

  const value: ThemeContextValue = useMemo(() => ({
    theme,
    resolvedTheme,
    setTheme,
    isDark,
    tokens
  }), [theme, resolvedTheme, isDark, tokens])

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useRNTheme(): ThemeContextValue {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useRNTheme must be used within an RNThemeProvider')
  }
  return context
}