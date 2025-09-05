import type { Metadata } from 'next'
import '../styles/globals.css'
import { UserProvider } from '@/contexts/user-context'
import ErrorBoundary from '@/components/ui/error-boundary'
import { ThemeProvider } from '@/components/providers/ThemeProvider'
import { WebVitalsInit } from '@/components/analytics/WebVitalsInit'
import { ConditionalFooter } from '@/components/layout/ConditionalFooter'
import { QuickChatMount } from '@/components/chat/QuickChatMount'

export const metadata: Metadata = {
  title: 'AGENT',
  description: 'Advanced AI Agent Platform for Enhanced Communication & Engagement',
  icons: {
    icon: '/agent-bot.svg',
    shortcut: '/agent-bot.svg',
    apple: '/agent-bot.svg',
  },
}

// Web Vitals are initialized via a separate client component

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="h-[100svh] flex flex-col antialiased">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem enableColorScheme>
          <ErrorBoundary>
            <WebVitalsInit />
            <UserProvider>
              <main className="flex-1">
                {children}
              </main>
              {/* Global Apple‑style quick chat */}
              <QuickChatMount />
              <ConditionalFooter />
            </UserProvider>
          </ErrorBoundary>
        </ThemeProvider>
      </body>
    </html>
  )
}
