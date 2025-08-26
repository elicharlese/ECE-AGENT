import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import './globals.css'
import { UserProvider } from '@/contexts/user-context'
import { ThemeProvider } from '@/components/theme-provider'
import { ThemeToggle } from '@/components/theme-toggle'

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
html {
  font-family: ${GeistSans.style.fontFamily};
  --font-sans: ${GeistSans.variable};
  --font-mono: ${GeistMono.variable};
}
        `}</style>
      </head>
      <body className="antialiased">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <UserProvider>
            {/* Global theme toggle */}
            <div className="fixed top-4 right-4 z-50">
              <ThemeToggle />
            </div>
            {children}
          </UserProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
