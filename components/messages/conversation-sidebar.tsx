'use client'

import * as React from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { Bot, Users, MessageSquare } from 'lucide-react'
import { useConversations } from '@/hooks/use-conversations'

interface ConversationSidebarProps {
  selectedConversation: string | null
  onSelectConversation: (id: string) => void
  refreshToken?: number
}

export function ConversationSidebar({ 
  selectedConversation, 
  onSelectConversation,
  refreshToken,
}: ConversationSidebarProps) {
  const { conversations, loading, error, fetchConversations } = useConversations()
  React.useEffect(() => {
    // Refetch when the refresh token changes
    fetchConversations()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshToken])
  return (
    <ScrollArea className="flex-1">
      <div className="p-2">
        {loading && (
          <div className="text-center text-sm text-gray-500 py-4">Loading conversations...</div>
        )}
        {error && (
          <div className="text-center text-sm text-red-600 py-4">{error}</div>
        )}
        {!loading && !error && conversations.length === 0 && (
          <div className="text-center text-sm text-gray-500 py-4">No conversations yet</div>
        )}
        {!loading && !error && conversations.map((conversation) => (
          <button
            key={conversation.id}
            onClick={() => onSelectConversation(conversation.id)}
            className={cn(
              "w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition-colors",
              selectedConversation === conversation.id && "bg-blue-50 hover:bg-blue-50"
            )}
          >
            <Avatar className="h-12 w-12">
              <AvatarImage src={undefined} alt={conversation.title} />
              <AvatarFallback>
                <span>{conversation.title?.charAt(0)?.toUpperCase() || 'C'}</span>
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 text-left">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm">{conversation.title}</h3>
                <span className="text-xs text-gray-500">{new Date(conversation.updated_at).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center justify-between mt-1">
                <p className="text-sm text-gray-600 truncate">&nbsp;</p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </ScrollArea>
  )
}

