"use client"

import React from 'react'
import { Bot, MessageCircle, Sparkles, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

export type LiveAgentPreviewProps = {
  className?: string
}

// Mock conversation data for the preview
const mockMessages = [
  {
    id: '1',
    text: 'Hey! Can you help me build a React component?',
    sender: 'user' as const,
    timestamp: '2:34 PM',
  },
  {
    id: '2',
    text: 'Absolutely! I can help you create any React component. What kind of component are you looking to build?',
    sender: 'ai' as const,
    timestamp: '2:34 PM',
  },
  {
    id: '3',
    text: 'I need a responsive navigation bar with dark mode support',
    sender: 'user' as const,
    timestamp: '2:35 PM',
  },
]

export function LiveAgentPreview({ className }: LiveAgentPreviewProps) {
  const [currentMessageIndex, setCurrentMessageIndex] = React.useState(0)
  const [isTyping, setIsTyping] = React.useState(false)

  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessageIndex((prev) => {
        if (prev < mockMessages.length - 1) {
          setIsTyping(true)
          setTimeout(() => {
            setIsTyping(false)
          }, 800)
          return prev + 1
        }
        // Reset after showing all messages
        setTimeout(() => {
          setCurrentMessageIndex(0)
        }, 3000)
        return prev
      })
    }, 2500)

    return () => clearInterval(interval)
  }, [])

  const visibleMessages = mockMessages.slice(0, currentMessageIndex + 1)

  return (
    <div className={cn('relative h-full w-full flex flex-col bg-[#FAFAFA] dark:bg-slate-900', className)}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700/50 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-ai">
            <Bot className="h-4 w-4 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-200">
              AI Assistant
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Always ready to help
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-xs text-slate-600 dark:text-slate-400">Live</span>
        </div>
      </div>

      {/* Messages - scrollable area */}
      <div className="flex-1 space-y-3 p-4 overflow-y-auto">
        {visibleMessages.map((message, index) => (
          <div
            key={message.id}
            className={cn(
              'flex animate-in slide-in-from-bottom-2 fade-in duration-500',
              message.sender === 'user' ? 'justify-end' : 'justify-start'
            )}
            style={{ animationDelay: `${index * 100}ms` }}
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
            <div className="rounded-2xl bg-white px-3 py-2 border border-slate-200 dark:bg-slate-800 dark:border-slate-700">
              <div className="flex items-center gap-1">
                <span className="text-xs text-slate-600 dark:text-slate-400 mr-2">
                  AI is typing
                </span>
                <div className="flex gap-1">
                  <div
                    className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce dark:bg-slate-400"
                    style={{ animationDelay: '0ms' }}
                  />
                  <div
                    className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce dark:bg-slate-400"
                    style={{ animationDelay: '150ms' }}
                  />
                  <div
                    className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce dark:bg-slate-400"
                    style={{ animationDelay: '300ms' }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input bar - pinned at bottom */}
      <div className="border-t border-slate-200 dark:border-slate-700/50 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
        <div className="p-3 flex items-center gap-2">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Try it yourself..."
              className="w-full rounded-full border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-4 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled
            />
          </div>
          <button
            className="rounded-full bg-human hover:bg-blue-600 p-2 text-white transition-colors disabled:opacity-50"
            disabled
            title="Start chatting"
          >
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

// no default export
