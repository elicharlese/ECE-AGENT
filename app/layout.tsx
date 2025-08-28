import type { Metadata } from 'next'
import { GeistMono } from 'geist/font/mono'
import './globals.css'
import { UserProvider } from '@/contexts/user-context'
import { ThemeProvider } from '@/components/theme-provider'
import { ThemeToggle } from '@/components/theme-toggle'
import { QueryProvider } from '@/components/providers/QueryProvider'
import { Toaster } from '@/components/ui/sonner'
import { HotkeysProvider } from '@/components/hotkeys/HotkeysProvider'
import { Quicksand } from 'next/font/google'

const quicksand = Quicksand({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'AGENT - Advanced Generative ENgineering Toolkit',
  description: 'AGENT - Advanced Generative ENgineering Toolkit',
  generator: 'AGENT',
  applicationName: 'AGENT',
  keywords: ['AGENT', 'AI', 'Generative', 'Engineering', 'Toolkit'],
  icons: {
    icon: '/agent-bot.svg',
    shortcut: '/agent-bot.svg',
    apple: '/agent-bot.svg',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Favicon fallbacks */}
        <link rel="icon" href="/agent-bot.svg" type="image/svg+xml" />
        <link rel="alternate icon" href="/agent-bot.svg" sizes="any" />
        <link rel="apple-touch-icon" href="/agent-bot.svg" />
        <style>{`
html { font-family: var(--font-sans); }
        `}</style>
      </head>
      <body className={`${quicksand.variable} ${GeistMono.variable} antialiased`} suppressHydrationWarning>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <UserProvider>
            <QueryProvider>
              <HotkeysProvider>
                {/* Skip link for keyboard users */}
                <a
                  href="#main-content"
                  className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] rounded-md bg-white dark:bg-gray-900 px-3 py-2 text-sm shadow border border-transparent"
                >
                  Skip to main content
                </a>
                {/* Global theme toggle */}
                <div className="fixed top-4 right-4 z-50">
                  <ThemeToggle />
                </div>
                {children}
                <Toaster richColors position="top-right" />
              </HotkeysProvider>
            </QueryProvider>
          </UserProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
