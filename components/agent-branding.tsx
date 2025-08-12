"use client"

import { cn } from '@/lib/utils'

interface AgentBrandingProps {
  variant?: 'default' | 'logo-only' | 'text-only' | 'compact'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function AgentBranding({ 
  variant = 'default', 
  size = 'md', 
  className 
}: AgentBrandingProps) {
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  }
  
  const getBrandingContent = () => {
    switch (variant) {
      case 'logo-only':
        return (
          <div className="flex items-center justify-center">
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 w-8 h-8 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">A</span>
            </div>
          </div>
        )
      case 'text-only':
        return (
          <span className={cn("font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent", sizeClasses[size])}>
            AGENT
          </span>
        )
      case 'compact':
        return (
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 w-6 h-6 rounded-md flex items-center justify-center">
              <span className="text-white font-bold text-xs">A</span>
            </div>
            <span className={cn("font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent", sizeClasses[size])}>
              AGENT
            </span>
          </div>
        )
      default: // default variant
        return (
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 w-10 h-10 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-2xl">A</span>
            </div>
            <span className={cn("font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent", sizeClasses[size])}>
              AGENT
            </span>
          </div>
        )
    }
  }
  
  return (
    <div className={cn("flex items-center", className)}>
      {getBrandingContent()}
    </div>
  )
}
