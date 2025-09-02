"use client"

import * as React from 'react'
import { ThemeProvider as NextThemesProvider } from 'next-themes'

export type ThemeProviderProps = React.PropsWithChildren<{
  attribute?: 'class' | 'data-theme'
  defaultTheme?: 'system' | 'light' | 'dark'
  enableSystem?: boolean
}>

export function ThemeProvider({
  children,
  attribute = 'class',
  defaultTheme = 'system',
  enableSystem = true,
}: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute={attribute}
      defaultTheme={defaultTheme}
      enableSystem={enableSystem}
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  )
}
