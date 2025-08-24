import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import './globals.css'
import { UserProvider } from '@/contexts/user-context'

export const metadata: Metadata = {
  title: 'AGENT - Advanced Generative ENgineering Toolkit',
  description: 'AGENT - Advanced Generative ENgineering Toolkit',
  generator: 'AGENT',
  applicationName: 'AGENT',
  keywords: ['AGENT', 'AI', 'Generative', 'Engineering', 'Toolkit'],
  icons: {
    icon: '/placeholder-logo.png',
    shortcut: '/placeholder-logo.png',
    apple: '/placeholder-logo.png',
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
        <link rel="icon" href="/placeholder-logo.png" sizes="any" />
        <link rel="apple-touch-icon" href="/placeholder-logo.png" />
        <style>{`
html {
  font-family: ${GeistSans.style.fontFamily};
  --font-sans: ${GeistSans.variable};
  --font-mono: ${GeistMono.variable};
}
        `}</style>
      </head>
      <body>
        <UserProvider>
          {children}
        </UserProvider>
      </body>
    </html>
  )
}
