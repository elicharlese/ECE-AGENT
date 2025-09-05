"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from '@/libs/design-system'
import { Badge } from '@/libs/design-system'
import { Button } from '@/libs/design-system'
import { Input } from '@/libs/design-system'
import { Avatar, AvatarFallback, AvatarImage } from '@/libs/design-system'
import { 
  AtSign, 
  Search, 
  MessageSquare, 
  Reply, 
  ExternalLink,
  Clock,
  CheckCircle
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface Mention {
  id: string
  content: string
  context: string
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
  isRead: boolean
  messageId: string
}

export function MentionsSection() {
  const [mentions, setMentions] = useState<Mention[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [filter, setFilter] = useState<'all' | 'unread' | 'today'>('all')

  useEffect(() => {
    const fetchMentions = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        const mockMentions: Mention[] = [
          {
            id: "1",
            content: "@john can you review the API documentation before the client meeting?",
            context: "We need to make sure all endpoints are properly documented and the examples are working correctly.",
            sender: {
              name: "Sarah Chen",
              email: "sarah@company.com",
              avatar: "/placeholder-user.jpg"
            },
            conversation: {
              id: "conv-1",
              name: "API Development",
              type: "group"
            },
            timestamp: new Date(Date.now() - 1000 * 60 * 30),
            isRead: false,
            messageId: "msg-1"
          },
          {
            id: "2",
            content: "Great work on the dashboard @john! The new charts look fantastic.",
            context: "The performance improvements are really noticeable, especially on mobile devices.",
            sender: {
              name: "Mike Johnson",
              email: "mike@company.com"
            },
            conversation: {
              id: "conv-2",
              name: "Mike Johnson",
              type: "direct"
            },
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
            isRead: false,
            messageId: "msg-2"
          },
          {
            id: "3",
            content: "@john @sarah Let's sync up on the deployment strategy tomorrow.",
            context: "I want to make sure we're all aligned on the rollout plan and have contingencies in place.",
            sender: {
              name: "Alex Rivera",
              email: "alex@company.com"
            },
            conversation: {
              id: "conv-3",
              name: "DevOps Team",
              type: "group"
            },
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4),
            isRead: true,
            messageId: "msg-3"
          },
          {
            id: "4",
            content: "Thanks @john for the quick fix on the login issue!",
            context: "Users can now authenticate properly and the error rate has dropped to zero.",
            sender: {
              name: "Emma Davis",
              email: "emma@company.com"
            },
            conversation: {
              id: "conv-4",
              name: "Support Team",
              type: "group"
            },
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
            isRead: true,
            messageId: "msg-4"
          }
        ]
        
        setMentions(mockMentions)
      } catch (error) {
        console.error('Failed to fetch mentions:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchMentions()
  }, [])

  const filteredMentions = mentions.filter(mention => {
    const matchesSearch = mention.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         mention.sender.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         mention.conversation.name.toLowerCase().includes(searchQuery.toLowerCase())
    
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const matchesFilter = filter === 'all' || 
                         (filter === 'unread' && !mention.isRead) ||
                         (filter === 'today' && mention.timestamp >= today)
    
    return matchesSearch && matchesFilter
  })

  const handleMarkAsRead = (mentionId: string) => {
    setMentions(prev => prev.map(mention => 
      mention.id === mentionId ? { ...mention, isRead: true } : mention
    ))
  }

  const handleMarkAllAsRead = () => {
    setMentions(prev => prev.map(mention => ({ ...mention, isRead: true })))
  }

  const unreadCount = mentions.filter(m => !m.isRead).length

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Mentions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-start gap-3 p-3 animate-pulse">
              <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
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
            <AtSign className="h-5 w-5" />
            Mentions
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {unreadCount}
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleMarkAllAsRead}
              >
                Mark all read
              </Button>
            )}
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
              variant={filter === 'today' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('today')}
            >
              Today
            </Button>
          </div>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search mentions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {filteredMentions.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            {filter === 'unread' ? 'No unread mentions' : 'No mentions found'}
          </div>
        ) : (
          filteredMentions.map((mention) => (
            <div
              key={mention.id}
              className={`flex items-start gap-3 p-4 rounded-lg border transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 ${
                !mention.isRead 
                  ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' 
                  : 'border-gray-200 dark:border-gray-700'
              }`}
            >
              <Avatar className="h-10 w-10">
                <AvatarImage src={mention.sender.avatar} alt={mention.sender.name} />
                <AvatarFallback>
                  {mention.sender.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-medium text-sm text-gray-900 dark:text-gray-100">
                    {mention.sender.name}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    mentioned you in {mention.conversation.name}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {formatDistanceToNow(mention.timestamp, { addSuffix: true })}
                  </span>
                  {!mention.isRead && (
                    <Badge variant="secondary" className="text-xs">
                      New
                    </Badge>
                  )}
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 mb-2">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {mention.content}
                  </p>
                  {mention.context && (
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                      {mention.context}
                    </p>
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs"
                  >
                    <Reply className="h-3 w-3 mr-1" />
                    Reply
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs"
                  >
                    <ExternalLink className="h-3 w-3 mr-1" />
                    View in chat
                  </Button>
                  {!mention.isRead && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleMarkAsRead(mention.id)}
                      className="h-8 text-xs text-gray-500 hover:text-gray-700"
                    >
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Mark read
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}
