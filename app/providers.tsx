'use client'

import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { queryClient } from '@/lib/query-client'
import { ThemeProvider } from 'next-themes'
import { Toaster } from '@/components/ui/toaster'
import { DensityProvider } from '@/contexts/density-context'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <DensityProvider>
          {children}
          <Toaster />
          <ReactQueryDevtools initialIsOpen={false} />
        </DensityProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}
