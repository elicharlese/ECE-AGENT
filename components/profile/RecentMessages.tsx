"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from '@/libs/design-system'
import { Badge } from '@/libs/design-system'
import { Button } from '@/libs/design-system'
import { Input } from '@/libs/design-system'
import { Avatar, AvatarFallback, AvatarImage } from '@/libs/design-system'
import { 
  MessageSquare, 
  Search, 
  Filter, 
  MoreHorizontal,
  Reply,
  Star,
  Archive
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { UI_CONSTANTS } from "@/lib/ui-constants"

interface Message {
  id: string
  content: string
  sender: {
    name: string
    avatar?: string
    email: string
  }
  conversation: {
    id: string
    name: string
    type: 'direct' | 'group'
  }
  timestamp: Date
  isUnread: boolean
  isStarred: boolean
  hasAttachments: boolean
}

export function RecentMessages() {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [filter, setFilter] = useState<'all' | 'unread' | 'starred'>('all')

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        // Simulate API call - replace with actual data fetching
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        const mockMessages: Message[] = [
          {
            id: "1",
            content: "Hey, can you review the latest design mockups? I've updated the user flow based on our discussion.",
            sender: {
              name: "Sarah Chen",
              email: "sarah@company.com",
              avatar: "/placeholder-user.jpg"
            },
            conversation: {
              id: "conv-1",
              name: "Design Team",
              type: "group"
            },
            timestamp: new Date(Date.now() - 1000 * 60 * 15), // 15 minutes ago
            isUnread: true,
            isStarred: false,
            hasAttachments: true
          },
          {
            id: "2",
            content: "The client meeting went well! They approved the proposal. Let's schedule a kickoff meeting for next week.",
            sender: {
              name: "Mike Johnson",
              email: "mike@company.com"
            },
            conversation: {
              id: "conv-2",
              name: "Mike Johnson",
              type: "direct"
            },
            timestamp: new Date(Date.now() - 1000 * 60 * 45), // 45 minutes ago
            isUnread: true,
            isStarred: true,
            hasAttachments: false
          },
          {
            id: "3",
            content: "Don't forget about the team standup at 2 PM today. We'll be discussing the sprint retrospective.",
            sender: {
              name: "Alex Rivera",
              email: "alex@company.com"
            },
            conversation: {
              id: "conv-3",
              name: "Development Team",
              type: "group"
            },
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
            isUnread: false,
            isStarred: false,
            hasAttachments: false
          }
        ]
        
        setMessages(mockMessages)
      } catch (error) {
        console.error('Failed to fetch messages:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchMessages()
  }, [])

  const filteredMessages = messages.filter(message => {
    const matchesSearch = message.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         message.sender.name.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesFilter = filter === 'all' || 
                         (filter === 'unread' && message.isUnread) ||
                         (filter === 'starred' && message.isStarred)
    
    return matchesSearch && matchesFilter
  })

  const handleMarkAsRead = (messageId: string) => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId ? { ...msg, isUnread: false } : msg
    ))
  }

  const handleToggleStar = (messageId: string) => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId ? { ...msg, isStarred: !msg.isStarred } : msg
    ))
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Messages</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-start gap-3 p-3 animate-pulse">
              <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Recent Messages
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('all')}
            >
              All
            </Button>
            <Button
              variant={filter === 'unread' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('unread')}
            >
              Unread
            </Button>
            <Button
              variant={filter === 'starred' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('starred')}
            >
              Starred
            </Button>
          </div>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search messages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {filteredMessages.length === 0 ? (
          <div className={`flex items-start ${UI_CONSTANTS.spacing.xs} ${UI_CONSTANTS.text.xs} text-gray-500 dark:text-gray-400`}>
            No messages found
          </div>
        ) : (
          filteredMessages.map((message) => (
            <div
              key={message.id}
              className={`flex items-center justify-between ${UI_CONSTANTS.padding.listItem} border border-gray-200 dark:border-gray-700 ${UI_CONSTANTS.radius.md} hover:bg-gray-50 dark:hover:bg-gray-800 ${UI_CONSTANTS.transitions.default} cursor-pointer`}
            >
              <Avatar className="h-10 w-10">
                <AvatarImage src={message.sender.avatar} alt={message.sender.name} />
                <AvatarFallback>
                  {message.sender.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <div className={`flex items-center ${UI_CONSTANTS.spacing.sm}`}>
                  <span className="font-medium text-sm text-gray-900 dark:text-gray-100">
                    {message.sender.name}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    in {message.conversation.name}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {formatDistanceToNow(message.timestamp, { addSuffix: true })}
                  </span>
                  {message.isUnread && (
                    <Badge variant="secondary" className="text-xs">
                      New
                    </Badge>
                  )}
                </div>
                
                <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
                  {message.content}
                </p>
                
                {message.hasAttachments && (
                  <div className={`flex items-center ${UI_CONSTANTS.spacing.md}`}>
                    <div className="h-1.5 w-1.5 rounded-full bg-gray-400" />
                    <span className="text-xs text-gray-500">Has attachments</span>
                  </div>
                )}
              </div>
              
              <div className={`flex items-center ${UI_CONSTANTS.spacing.md}`}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleToggleStar(message.id)}
                  className={message.isStarred ? 'text-yellow-500' : 'text-gray-400'}
                >
                  <Star className="h-4 w-4" fill={message.isStarred ? 'currentColor' : 'none'} />
                </Button>
                
                {message.isUnread && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleMarkAsRead(message.id)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <Archive className="h-4 w-4" />
                  </Button>
                )}
                
                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-gray-600">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}
