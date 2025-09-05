"use client"

import * as React from "react"
import {
  Tabs,
  TabsList,
  TabsTrigger
} from '@/libs/design-system';
// TODO: Replace deprecated components: Tabs
// 
// TODO: Replace deprecated components: Tabs
// import { Tabs } from '@/components/ui/tabs'
import type { Conversation } from "@/services/conversation-service"

export type ChatTabsBarProps = {
  conversations: Conversation[]
  value?: string | null
  onValueChange: (id: string) => void
  className?: string
}

// Renders a horizontally scrollable tabs bar for open conversations.
// Keyboard navigation: Radix Tabs supports ArrowLeft/ArrowRight.
// Higher-level global shortcuts are wired in ChatApp via useHotkeys.
export function ChatTabsBar({ conversations, value, onValueChange, className }: ChatTabsBarProps) {
  const tabValue = value ?? undefined

  return (
    <div className={className} data-testid="chat-tabs-bar">
      <Tabs value={tabValue} onValueChange={onValueChange}>
        <TabsList
          aria-label="Open chats"
          className="w-full max-w-full overflow-x-auto whitespace-nowrap hide-scrollbar p-1 rounded-xl bg-gray-50 dark:bg-gray-800/50 ring-1 ring-gray-200 dark:ring-gray-700"
        >
          {conversations.map((c) => (
            <TabsTrigger
              key={c.id}
              value={c.id}
              aria-label={`Open conversation ${c.title}`}
              title={c.title}
              className="flex-none text-xs truncate min-h-11 rounded-lg px-2 sm:px-3 transition-colors motion-reduce:transition-none hover:bg-white/60 dark:hover:bg-gray-900/60 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 data-[state=active]:shadow-sm"
              data-testid={`chat-tab-${c.id}`}
            >
              <span className="truncate max-w-[12rem]">{c.title || "Untitled"}</span>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  )
}
