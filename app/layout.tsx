import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import './globals.css'
import '@livekit/components-styles'
import { UserProvider } from '@/contexts/user-context'
import { SolanaWalletProvider } from '@/components/solana-wallet-provider'
import { Toaster } from '@/components/ui/toaster'
import { Providers } from './providers'

export const metadata: Metadata = {
  title: 'AGENT - Advanced Generative ENgineering Toolkit',
  description: 'AGENT - Advanced Generative ENgineering Toolkit',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
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
        <Providers>
          <SolanaWalletProvider>
            <UserProvider>
              {children}
              <Toaster />
            </UserProvider>
          </SolanaWalletProvider>
        </Providers>
      </body>
    </html>
  )
}
