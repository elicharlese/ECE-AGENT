"use client"

import React from 'react'
import { Bot, Send, ArrowRight, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'

export type InteractiveChatPreviewProps = {
  className?: string
}

interface Message {
  id: string
  text: string
  sender: 'user' | 'ai'
  timestamp: string
}

export function InteractiveChatPreview({ className }: InteractiveChatPreviewProps) {
  const [messages, setMessages] = React.useState<Message[]>([])
  const [input, setInput] = React.useState('')
  const [isTyping, setIsTyping] = React.useState(false)
  const [messageCount, setMessageCount] = React.useState(0)
  const [showSignupPrompt, setShowSignupPrompt] = React.useState(false)

  const addMessage = (text: string, sender: 'user' | 'ai') => {
    const newMessage: Message = {
      id: Date.now().toString(),
      text,
      sender,
      timestamp: new Date().toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    }
    setMessages(prev => [...prev, newMessage])
  }

  const handleSendMessage = async () => {
    if (!input.trim() || showSignupPrompt) return

    const userMessage = input.trim()
    setInput('')
    addMessage(userMessage, 'user')
    setMessageCount(prev => prev + 1)

    // Check if user reached limit
    if (messageCount >= 1) {
      setTimeout(() => {
        setShowSignupPrompt(true)
      }, 1000)
      return
    }

    // Simulate AI response
    setIsTyping(true)
    setTimeout(() => {
      setIsTyping(false)
      
      if (userMessage.toLowerCase().startsWith('@ai')) {
        const query = userMessage.slice(3).trim()
        addMessage(`I'd be happy to help with ${query}! This is a preview of our AI assistant. Sign up to continue the conversation and access all features.`, 'ai')
      } else {
        addMessage(`I see you said ${userMessage}. Try starting your message with @ai to get an AI response! For example: @ai help me with coding`, 'ai')
      }
    }, 1500)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className={cn('relative w-full flex flex-col glass-3d rounded-3xl overflow-hidden pointer-events-auto', 'h-[500px] sm:h-[550px] lg:h-[600px]', className)}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/20 dark:border-slate-700/50 p-4 bg-white/5 dark:bg-slate-800/20">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-ai">
            <Bot className="h-4 w-4 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-200">
              AI Assistant
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Try it live • Type @ai for AI responses
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-xs text-slate-600 dark:text-slate-400">Live Preview</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 space-y-3 p-4 overflow-y-auto min-h-0 max-h-[calc(100%-140px)]">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-2">
            <Sparkles className="h-8 w-8 text-slate-400 dark:text-slate-500" />
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Start a conversation! Try typing @ai help me code
            </p>
          </div>
        )}
        
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              'flex animate-in slide-in-from-bottom-2 fade-in duration-500',
              message.sender === 'user' ? 'justify-end' : 'justify-start'
            )}
          >
            <div
              className={cn(
                'max-w-[80%] rounded-2xl px-3 py-2 text-sm',
                message.sender === 'user'
                  ? 'bg-human text-white'
                  : 'bg-ai text-white'
              )}
            >
              <p>{message.text}</p>
              <div
                className={cn(
                  'mt-1 flex items-center gap-1',
                  message.sender === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                <span className="text-xs opacity-70">{message.timestamp}</span>
              </div>
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex justify-start animate-in slide-in-from-bottom-2 fade-in duration-300">
            <div className="rounded-2xl bg-ai px-3 py-2">
              <div className="flex items-center gap-1">
                <span className="text-xs text-white/80 mr-2">
                  AI is typing
                </span>
                <div className="flex gap-1">
                  <div
                    className="h-1.5 w-1.5 rounded-full bg-white/60 animate-bounce"
                    style={{ animationDelay: '0ms' }}
                  />
                  <div
                    className="h-1.5 w-1.5 rounded-full bg-white/60 animate-bounce"
                    style={{ animationDelay: '150ms' }}
                  />
                  <div
                    className="h-1.5 w-1.5 rounded-full bg-white/60 animate-bounce"
                    style={{ animationDelay: '300ms' }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Signup prompt */}
        {showSignupPrompt && (
          <div className="animate-in slide-in-from-bottom-4 fade-in duration-700">
            <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 dark:from-purple-500/20 dark:to-blue-500/20 border border-purple-200 dark:border-purple-500/30 rounded-2xl p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Sparkles className="h-5 w-5 text-purple-500" />
                <h4 className="font-semibold text-slate-900 dark:text-slate-100">
                  Ready for more?
                </h4>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-300 mb-3">
                You&apos;ve reached the preview limit. Sign up for unlimited conversations and full AI features!
              </p>
              <Link
                href="/auth"
                className="inline-flex items-center gap-2 bg-brand-gradient text-white px-4 py-2 rounded-full text-sm font-medium hover:opacity-90 transition-opacity"
              >
                Get Full Access
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Input bar */}
      <div className="border-t border-white/20 dark:border-slate-700/50 bg-white/10 dark:bg-slate-800/30 backdrop-blur-sm">
        <div className="p-3 flex items-center gap-2">
          <div className="flex-1 relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={showSignupPrompt ? "Sign up to continue..." : "Type @ai for AI responses..."}
              className="w-full rounded-full border border-white/30 dark:border-slate-600 bg-white/80 dark:bg-slate-700/80 backdrop-blur-sm px-4 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50"
              disabled={showSignupPrompt}
            />
          </div>
          <button
            onClick={handleSendMessage}
            disabled={!input.trim() || showSignupPrompt}
            className="rounded-full bg-human hover:bg-blue-600 p-2 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Send message"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

// no default export
