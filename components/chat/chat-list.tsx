'use client'

import React from 'react'
import { formatDistanceToNow } from 'date-fns'
import { cn } from '@/lib/utils'

interface Chat {
  id: string
  name: string
  lastMessage: string
  timestamp: Date
  unread: number
  avatar?: string
  isGroup?: boolean
  isOnline?: boolean
}

interface ChatListProps {
  selectedChatId: string | null
  onSelectChat: (chatId: string) => void
}

const mockChats: Chat[] = [
  {
    id: '1',
    name: 'AI Assistant',
    lastMessage: 'How can I help you today?',
    timestamp: new Date(Date.now() - 1000 * 60 * 5),
    unread: 2,
    isOnline: true,
  },
  {
    id: '2',
    name: 'Development Team',
    lastMessage: 'Code review completed',
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
    unread: 0,
    isGroup: true,
  },
  {
    id: '3',
    name: 'Legal Assistant',
    lastMessage: 'Contract analysis ready',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
    unread: 1,
    isOnline: false,
  },
]

export function ChatList({ selectedChatId, onSelectChat }: ChatListProps) {
  return (
    <div className="flex-1 overflow-y-auto">
      {mockChats.map((chat) => (
        <button
          key={chat.id}
          onClick={() => onSelectChat(chat.id)}
          className={cn(
            'w-full p-4 flex items-start gap-3 hover:bg-gray-50 transition-colors',
            selectedChatId === chat.id && 'bg-blue-50'
          )}
        >
          <div className="relative">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
              {chat.isGroup ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              ) : (
                chat.name[0].toUpperCase()
              )}
            </div>
            {chat.isOnline && (
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
            )}
          </div>
          <div className="flex-1 text-left">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">{chat.name}</h3>
              <span className="text-xs text-gray-500">
                {formatDistanceToNow(chat.timestamp, { addSuffix: true })}
              </span>
            </div>
            <p className="text-sm text-gray-600 truncate mt-1">{chat.lastMessage}</p>
          </div>
          {chat.unread > 0 && (
            <div className="bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {chat.unread}
            </div>
          )}
        </button>
      ))}
    </div>
  )
}
