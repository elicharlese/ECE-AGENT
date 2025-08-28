import type { Metadata } from 'next'

interface SEOConfig {
  title?: string
  description?: string
  keywords?: string[]
  image?: string
  url?: string
  type?: 'website' | 'article'
  siteName?: string
}

const defaultConfig: Required<SEOConfig> = {
  title: 'ECE Agent - Your Intelligent AI Assistant',
  description: 'Advanced AI-powered assistant for seamless conversations, task automation, and intelligent collaboration. Experience the future of AI interaction.',
  keywords: ['AI assistant', 'artificial intelligence', 'chat bot', 'automation', 'productivity', 'ECE Agent'],
  image: '/og-image.png',
  url: 'https://ece-agent.vercel.app',
  type: 'website',
  siteName: 'ECE Agent'
}

export function generateMetadata(config: SEOConfig = {}): Metadata {
  const meta = { ...defaultConfig, ...config }
  
  return {
    title: meta.title,
    description: meta.description,
    keywords: meta.keywords,
    authors: [{ name: 'ECE Agent Team' }],
    creator: 'ECE Agent',
    publisher: 'ECE Agent',
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    metadataBase: new URL(meta.url),
    alternates: {
      canonical: meta.url,
    },
    openGraph: {
      title: meta.title,
      description: meta.description,
      url: meta.url,
      siteName: meta.siteName,
      images: [
        {
          url: meta.image,
          width: 1200,
          height: 630,
          alt: meta.title,
        }
      ],
      locale: 'en_US',
      type: meta.type,
    },
    twitter: {
      card: 'summary_large_image',
      title: meta.title,
      description: meta.description,
      images: [meta.image],
      creator: '@eceagent',
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    verification: {
      google: process.env.GOOGLE_SITE_VERIFICATION,
    },
  }
}

export const homePageMetadata = generateMetadata({
  title: 'ECE Agent - Your Intelligent AI Assistant',
  description: 'Experience advanced AI conversations, task automation, and intelligent collaboration. Start chatting with your AI assistant today.',
  keywords: ['AI assistant', 'artificial intelligence', 'chat bot', 'automation', 'productivity', 'conversations'],
})

export const messagesPageMetadata = generateMetadata({
  title: 'Messages - ECE Agent',
  description: 'Access your AI conversations and chat history. Continue your intelligent discussions with ECE Agent.',
  keywords: ['AI chat', 'messages', 'conversations', 'chat history'],
})

export const authPageMetadata = generateMetadata({
  title: 'Sign In - ECE Agent',
  description: 'Sign in to access your AI assistant and continue your intelligent conversations.',
  keywords: ['sign in', 'login', 'authentication', 'AI assistant access'],
})
