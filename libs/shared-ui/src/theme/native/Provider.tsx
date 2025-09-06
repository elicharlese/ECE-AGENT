import React, { createContext, useContext, useEffect, useState, useMemo, ReactNode } from 'react'
import { Platform } from 'react-native'
import { Theme, ResolvedTheme, ThemeContextValue } from '../types'
import { getThemeTokens } from './tokens'

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

interface RNThemeProviderProps {
  children: ReactNode
  defaultTheme?: Theme
}

export function RNThemeProvider({ children, defaultTheme = 'system' }: RNThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(defaultTheme)
  const [systemTheme, setSystemTheme] = useState<'light' | 'dark' | null>(() => {
    if (Platform.OS === 'web') {
      try {
        const isDark = globalThis?.matchMedia?.('(prefers-color-scheme: dark)')?.matches
        return isDark ? 'dark' : 'light'
      } catch {
        return 'light'
      }
    } else {
      try {
        // Require lazily to avoid bundler resolving Appearance on web
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const { Appearance } = require('react-native')
        return Appearance.getColorScheme()
      } catch {
        return 'light'
      }
    }
  })

  useEffect(() => {
    if (Platform.OS === 'web') {
      try {
        const mql = globalThis?.matchMedia?.('(prefers-color-scheme: dark)')
        if (mql && typeof mql.addEventListener === 'function') {
          const handler = (e: MediaQueryListEvent) => setSystemTheme(e.matches ? 'dark' : 'light')
          mql.addEventListener('change', handler)
          return () => mql.removeEventListener('change', handler)
        }
      } catch {}
      return
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { Appearance } = require('react-native')
      const subscription = Appearance.addChangeListener(({ colorScheme }: { colorScheme: 'light' | 'dark' | null }) => {
        setSystemTheme(colorScheme)
      })
      return () => subscription?.remove?.()
    } catch {
      return
    }
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