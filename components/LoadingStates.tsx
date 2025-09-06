"use client"

import { Loader2, MessageSquare, Users, Settings } from "lucide-react"
import { Skeleton } from '@/libs/design-system'

export function PageLoadingSpinner({ message = "Loading..." }: { message?: string }) {
  return (
    <div className="min-h-[400px] flex items-center justify-center text-center">
      <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-indigo-600" />
      <p className="text-sm text-gray-600 dark:text-gray-300">{message}</p>
    </div>
  )
}

export function ChatLoadingSkeleton() {
  return (
    <div className="h-full flex flex-col">
      {/* Header skeleton */}
      <div className="border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-8 rounded-full" />
          <div className="flex-1">
            <Skeleton className="h-4 w-32 mb-1" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
      </div>

      {/* Messages skeleton */}
      <div className="flex-1 p-4 space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className={`flex gap-3 ${i % 2 === 0 ? '' : 'flex-row-reverse'}`}>
            <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
            <div className="flex-1 max-w-xs">
              <Skeleton className="h-16 w-full rounded-lg" />
            </div>
          </div>
        ))}
      </div>

      {/* Input skeleton */}
      <div className="border-t border-gray-200 dark:border-gray-700 p-4">
        <Skeleton className="h-10 w-full rounded-lg" />
      </div>
    </div>
  )
}

export function ConversationListSkeleton() {
  return (
    <div className="p-2 space-y-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="h-3 w-8" />
        </div>
      ))}
    </div>
  )
}

export function AgentListSkeleton() {
  return (
    <div className="p-4 space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-3 rounded-lg">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-32" />
          </div>
          <Skeleton className="h-6 w-12 rounded-full" />
        </div>
      ))}
    </div>
  )
}

export function InlineLoadingSpinner({ size = "sm" }: { size?: "sm" | "md" | "lg" }) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-5 w-5", 
    lg: "h-6 w-6"
  }

  return <Loader2 className={`animate-spin ${sizeClasses[size]}`} />
}

export function ButtonLoadingSpinner() {
  return <Loader2 className="h-4 w-4 animate-spin" />
}

// Loading states for specific features
export function AuthLoadingState() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background">
      <div className="text-center">
        <div>
          <div className="mx-auto mb-4 h-12 w-12 rounded-xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-300 flex items-center justify-center">
            <Users className="h-6 w-6" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Authenticating...
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
            Please wait while we verify your credentials.
          </p>
          <Loader2 className="h-6 w-6 animate-spin mx-auto text-indigo-600" />
        </div>
      </div>
    </div>
  )
}

export function AppInitializingState() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <div>
          <div className="mx-auto mb-4 h-16 w-16 rounded-xl bg-gradient-to-br from-indigo-500/15 to-purple-500/15 text-indigo-600 dark:text-indigo-300 flex items-center justify-center">
            <MessageSquare className="h-8 w-8" />
          </div>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Starting ECE Agent
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
            Initializing your intelligent assistant...
          </p>
          <div className="flex items-center justify-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin text-indigo-600" />
            <span className="text-sm text-gray-500">Loading</span>
          </div>
        </div>
      </div>
    </div>
  )
}
