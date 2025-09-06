'use client'

import * as React from 'react'
import { cn } from '../utils'
import { Button } from '../primitives/Button'
import { ShinyButton } from './ShinyButton'

interface HeroCopyProps {
  className?: string
}

export function HeroCopy({
  className,
  ...props
}: HeroCopyProps) {
  return (
    <div
      className={cn(
        'space-y-6 text-left',
        className
      )}
      {...props}
    >
      <div className="space-y-4">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl md:text-6xl">
          <span className="block">AI Agent</span>
          <span className="block text-blue-600 dark:text-blue-400">
            Ecosystem
          </span>
        </h1>
        
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl">
          Build, deploy, and manage intelligent AI agents with our comprehensive platform. 
          From conversational AI to autonomous workflows, create the future of intelligent automation.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <ShinyButton size="lg" variant="primary" className="w-full sm:w-auto px-6">
          Get Started
        </ShinyButton>
        <ShinyButton size="lg" variant="glass" className="w-full sm:w-auto px-6">
          View Documentation
        </ShinyButton>
      </div>

      <div className="flex items-center space-x-6 text-sm text-gray-500 dark:text-gray-400">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span>Real-time Processing</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
          <span>Multi-Modal AI</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
          <span>Enterprise Ready</span>
        </div>
      </div>
    </div>
  )
}
