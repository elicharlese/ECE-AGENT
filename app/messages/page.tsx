"use client"

import React from 'react'
import { useConversations } from '@/hooks/use-conversations'
import { Button } from '@/components/ui/button'

export default function MessagesPage() {
  const { conversations, loading, error, createConversation } = useConversations()

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-3xl mx-auto py-6 px-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Messages</h1>
          <Button
            onClick={() => createConversation('New Conversation')}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            New Conversation
          </Button>
        </div>

        {loading && (
          <div className="text-gray-600 dark:text-gray-300">Loading…</div>
        )}
        {error && (
          <div className="text-red-600 dark:text-red-400 text-sm">{error}</div>
        )}

        {!loading && conversations.length === 0 && (
          <div className="text-gray-600 dark:text-gray-300">No conversations yet.</div>
        )}

        <ul className="space-y-3">
          {conversations.map((c) => (
            <li key={c.id} className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900 dark:text-gray-100">{c.title || 'Untitled conversation'}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    Updated {new Date(c.updated_at).toLocaleString()}
                  </div>
                </div>
                {/* Optional: Add navigation to main chat when wiring deep-linking */}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
