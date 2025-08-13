import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import './globals.css'
import { UserProvider } from '@/contexts/user-context'
import { SolanaWalletProvider } from '@/components/solana-wallet-provider'

export const metadata: Metadata = {
  title: 'AGENT - Advanced Generative ENgineering Toolkit',
  description: 'AGENT - Advanced Generative ENgineering Toolkit',
  generator: 'AGENT',
  applicationName: 'AGENT',
  keywords: ['AGENT', 'AI', 'Generative', 'Engineering', 'Toolkit'],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
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
