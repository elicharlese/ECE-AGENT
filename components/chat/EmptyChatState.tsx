"use client"

import { MessageSquarePlus } from "lucide-react"
import { Button } from '@/libs/design-system'

export type EmptyChatStateProps = {
  onStartNewChat?: () => void
}

export function EmptyChatState({ onStartNewChat }: EmptyChatStateProps) {
  return (
    <div className="h-full w-full flex items-center justify-center">
      <div className="text-center p-6 md:p-8 max-w-md">
        <div className="mx-auto mb-4 h-12 w-12 rounded-xl bg-gradient-to-br from-indigo-500/15 to-purple-500/15 text-indigo-600 dark:text-indigo-300 flex items-center justify-center">
          <MessageSquarePlus className="h-6 w-6" />
        </div>
        <h2 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-gray-100">No conversation selected</h2>
        <p className="mt-2 text-sm md:text-base text-gray-600 dark:text-gray-300">
          Select a conversation from the left, or start a new one to begin chatting.
        </p>
        <div className="mt-4">
          <Button onClick={onStartNewChat} className="gap-2" aria-label="Start new chat">
            <MessageSquarePlus className="h-4 w-4" />
            Start new chat
          </Button>
        </div>
      </div>
    </div>
  )
}
