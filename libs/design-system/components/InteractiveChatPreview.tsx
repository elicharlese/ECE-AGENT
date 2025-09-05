'use client'

import * as React from 'react'
import { cn } from '../utils'
import { Card } from '../primitives/Card'
import { Avatar } from '../primitives/Avatar'
import { Badge } from '../primitives/Badge'

interface InteractiveChatPreviewProps {
  className?: string
}

export function InteractiveChatPreview({
  className,
  ...props
}: InteractiveChatPreviewProps) {
  return (
    <Card
      className={cn(
        'p-6 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950 dark:to-indigo-900 border-0 shadow-2xl',
        className
      )}
      {...props}
    >
      <div className="space-y-4">
        {/* Chat Header */}
        <div className="flex items-center justify-between pb-3 border-b border-blue-200 dark:border-blue-800">
          <div className="flex items-center space-x-3">
            <Avatar className="h-8 w-8">
              <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-semibold">AI</span>
              </div>
            </Avatar>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">AI Assistant</h3>
              <Badge variant="secondary" className="text-xs">
                Online
              </Badge>
            </div>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="space-y-3">
          <div className="flex justify-end">
            <div className="max-w-xs bg-blue-600 text-white rounded-lg px-3 py-2 text-sm">
              How can I automate my workflow?
            </div>
          </div>
          
          <div className="flex justify-start">
            <div className="max-w-xs bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg px-3 py-2 text-sm shadow-sm">
              I can help you create intelligent agents that automate tasks, analyze data, and integrate with your existing tools.
            </div>
          </div>

          <div className="flex justify-end">
            <div className="max-w-xs bg-blue-600 text-white rounded-lg px-3 py-2 text-sm">
              Show me what's possible
            </div>
          </div>

          <div className="flex justify-start">
            <div className="max-w-xs bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg px-3 py-2 text-sm shadow-sm">
              <div className="space-y-2">
                <p>Here are some capabilities:</p>
                <ul className="text-xs space-y-1 text-gray-600 dark:text-gray-400">
                  <li>• Document processing</li>
                  <li>• API integrations</li>
                  <li>• Real-time analytics</li>
                  <li>• Multi-modal AI</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Chat Input */}
        <div className="flex items-center space-x-2 pt-3 border-t border-blue-200 dark:border-blue-800">
          <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
            Type your message...
          </div>
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </div>
        </div>
      </div>
    </Card>
  )
}
