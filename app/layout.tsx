import type { Metadata } from 'next'
import '../styles/globals.css'
import { UserProvider } from '@/contexts/user-context'
import { ThemeProvider } from '@/components/providers/ThemeProvider'

export const metadata: Metadata = {
  title: 'ECE Agent',
  description: 'Advanced AI Agent Platform for Enhanced Communication & Engagement',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <UserProvider>{children}</UserProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
