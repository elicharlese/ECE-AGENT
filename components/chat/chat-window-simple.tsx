'use client'

import * as React from 'react'
import { Bot, Wrench, Phone, Video, Info, Smile } from "lucide-react"
import { cn } from '@/lib/utils'
import { MessageReactions } from '@/components/chat/message-reactions'
import { listMessages, sendMessage as sendDbMessage, subscribeToMessages, DBMessage } from '@/services/message-service'
import { getConversationById } from '@/services/conversation-service'
import { supabase } from '@/lib/supabase/client'
import { aiService } from '@/services/ai-service'
import { VideoCallUI } from '@/components/calls/video-call-ui'
import { ConversationMenu } from '@/components/chat/ConversationMenu'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'

// Simple ReadReceipt component since it was removed
function ReadReceipt({ status }: { status?: 'sent' | 'delivered' | 'read' }) {
  if (!status) return null
  return (
    <div className="flex items-center gap-0.5 text-gray-400">
      {status === 'sent' && <span className="text-xs">✓</span>}
      {status === 'delivered' && <span className="text-xs">✓✓</span>}
      {status === 'read' && <span className="text-xs text-blue-500">✓✓</span>}
    </div>
  )
}

interface Reaction {
  emoji: string
  count: number
  users: string[]
  hasReacted: boolean
}

interface Message {
  id: string
  text: string
  sender: 'user' | 'other' | 'ai'
  senderName?: string
  timestamp: Date
  status?: 'sent' | 'delivered' | 'read'
  type?: 'text' | 'app' | 'agent'
  reactions?: Reaction[]
  appData?: any
}

interface ChatWindowProps {
  chatId: string
  onToggleAgent: () => void
  onToggleMCP: () => void
  onToggleContactInfo?: () => void
  onOpenMCPSettings?: () => void
}

export function ChatWindow({ chatId, onToggleAgent, onToggleMCP, onToggleContactInfo, onOpenMCPSettings }: ChatWindowProps) {
  const [messages, setMessages] = React.useState<Message[]>([])
  const [isTyping, setIsTyping] = React.useState(false)
  const messagesEndRef = React.useRef<HTMLDivElement>(null)
  const [reactionPickerFor, setReactionPickerFor] = React.useState<string | null>(null)
  const [currentUser, setCurrentUser] = React.useState<{ id: string, name: string }>({ id: '', name: 'You' })
  const [conversationTitle, setConversationTitle] = React.useState<string>('')
  const [isVideoOpen, setIsVideoOpen] = React.useState(false)
  const [creatorUserId, setCreatorUserId] = React.useState<string | undefined>(undefined)
  const [input, setInput] = React.useState<string>('')

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  React.useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Load current user
  React.useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setCurrentUser({ id: data.user.id, name: data.user.user_metadata?.full_name || 'You' })
    })
  }, [])

  // Load conversation title
  React.useEffect(() => {
    if (!chatId) {
      setConversationTitle('')
      setCreatorUserId(undefined)
      return
    }
    getConversationById(chatId)
      .then((conv) => {
        setConversationTitle(conv?.title || '')
        setCreatorUserId(conv?.user_id)
      })
      .catch(() => {
        setConversationTitle('')
        setCreatorUserId(undefined)
      })
  }, [chatId])

  // Map DB message to UI message
  const mapDB = React.useCallback((m: DBMessage): Message => {
    const isOwn = m.user_id && m.user_id === currentUser.id
    return {
      id: m.id,
      text: m.content,
      sender: isOwn ? 'user' : 'other',
      timestamp: new Date(m.timestamp),
      status: isOwn ? 'read' : undefined,
    }
  }, [currentUser.id])

  // Fetch messages and subscribe
  React.useEffect(() => {
    if (!chatId) return
    let unsub: (() => void) | null = null
    ;(async () => {
      try {
        const data = await listMessages(chatId)
        setMessages(data.map(mapDB))
        unsub = subscribeToMessages(chatId, (msg) => {
          setMessages(prev => [...prev, mapDB(msg)])
        })
      } catch (e) {
        console.error('Failed to load messages', e)
      }
    })()
    return () => {
      if (unsub) unsub()
    }
  }, [chatId, mapDB])

  const sendMessage = async (content: string) => {
    if (!content.trim()) return
    try {
      const sent = await sendDbMessage(chatId, content)
      // Optimistically add (subscription will also add; guard duplicate)
      setMessages(prev => prev.some(m => m.id === sent.id) ? prev : [...prev, mapDB(sent)])

      // If message starts with @ai or in AI conversation, trigger AI response
      if (content.toLowerCase().startsWith('@ai') || chatId === 'ai') {
        setIsTyping(true)
        try {
          const aiResponse = await aiService.processConversationMessage(chatId, content)
          setMessages(prev => prev.some(m => m.id === aiResponse.id) ? prev : [...prev, mapDB(aiResponse)])
        } catch (error) {
          console.error('AI response error:', error)
        } finally {
          setIsTyping(false)
        }
      }
    } catch (e) {
      console.error('Failed to send message', e)
    }
  }

  

  const handleAddReaction = (messageId: string, emoji: string) => {
    setMessages(prev => prev.map(m => {
      if (m.id !== messageId) return m
      const reactions = m.reactions ?? []
      const existing = reactions.find(r => r.emoji === emoji)
      if (existing) {
        return {
          ...m,
          reactions: reactions.map(r => 
            r.emoji === emoji 
              ? { ...r, count: r.count + 1, users: [...r.users, currentUser.name], hasReacted: true }
              : r
          )
        }
      }
      return {
        ...m,
        reactions: [...reactions, { emoji, count: 1, users: [currentUser.name], hasReacted: true }]
      }
    }))
  }

  const handleRemoveReaction = (messageId: string, emoji: string) => {
    setMessages(prev => prev.map(m => {
      if (m.id !== messageId) return m
      const reactions = m.reactions ?? []
      return {
        ...m,
        reactions: reactions.map(r => 
          r.emoji === emoji 
            ? { ...r, count: Math.max(0, r.count - 1), users: r.users.filter(u => u !== currentUser.name), hasReacted: false }
            : r
        ).filter(r => r.count > 0)
      }
    }))
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
            {chatId === 'ai' ? 'AI' : (conversationTitle?.charAt(0)?.toUpperCase() || 'C')}
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">
              {chatId === 'ai' ? 'AI Assistant' : (conversationTitle || 'Conversation')}
            </h2>
            <p className="text-xs text-gray-500">
              {chatId === 'ai' ? 'Always ready to help' : 'Active now'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button 
            className="p-2 rounded-md hover:bg-gray-100"
            title="Voice Call"
          >
            <Phone className="w-5 h-5 text-gray-600" />
          </button>
          <button 
            className="p-2 rounded-md hover:bg-gray-100"
            title="Video Call"
            onClick={() => setIsVideoOpen(true)}
          >
            <Video className="w-5 h-5 text-gray-600" />
          </button>
          <button 
            onClick={onToggleAgent}
            className="p-2 rounded-md hover:bg-gray-100"
            title="Toggle AI Agent"
          >
            <Bot className="w-5 h-5 text-gray-600" />
          </button>
          <button 
            onClick={onToggleMCP}
            className="p-2 rounded-md hover:bg-gray-100"
            title="Toggle MCP Tools"
          >
            <Wrench className="w-5 h-5 text-gray-600" />
          </button>
          <button 
            onClick={onToggleContactInfo}
            className="p-2 rounded-md hover:bg-gray-100"
            title="Contact Info"
          >
            <Info className="w-5 h-5 text-gray-600" />
          </button>
          <ConversationMenu
            chatId={chatId}
            currentUserId={currentUser.id}
            creatorUserId={creatorUserId}
            onOpenMCPSettings={onOpenMCPSettings}
            className="p-2 rounded-md hover:bg-gray-100"
          />
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                'flex',
                message.sender === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
              <div
                className={cn(
                  'max-w-[70%] px-4 py-2 rounded-2xl',
                  message.sender === 'user'
                    ? 'bg-blue-500 text-white'
                    : message.sender === 'ai'
                    ? 'bg-purple-500 text-white'
                    : 'bg-gray-100 text-gray-900'
                )}
              >
                {message.senderName && message.sender !== 'user' && (
                  <p className="text-xs font-medium mb-1 opacity-80">
                    {message.senderName}
                  </p>
                )}
                <p className="text-sm">{message.text}</p>
                <div
                  className={cn(
                    'flex items-center gap-1 mt-1',
                    message.sender === 'user' ? 'justify-end' : 'justify-start'
                  )}
                >
                  <span className="text-xs opacity-70">
                    {message.timestamp.toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                  {message.sender === 'user' && (
                    <ReadReceipt status={message.status} />
                  )}
                </div>
              </div>
              {/* Reactions row */}
              <div
                className={cn(
                  'mt-1 flex items-center gap-1',
                  message.sender === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                <MessageReactions
                  messageId={message.id}
                  reactions={message.reactions || []}
                  onAddReaction={handleAddReaction}
                  onRemoveReaction={handleRemoveReaction}
                  showPicker={reactionPickerFor === message.id}
                  onTogglePicker={() =>
                    setReactionPickerFor(reactionPickerFor === message.id ? null : message.id)
                  }
                />
                <button
                  onClick={() =>
                    setReactionPickerFor(reactionPickerFor === message.id ? null : message.id)
                  }
                  className="p-1 rounded-md hover:bg-gray-100"
                  title="Add reaction"
                  aria-label="Add reaction"
                >
                  <Smile className="w-4 h-4 text-gray-500" />
                </button>
              </div>
            </div>
          ))}
          
          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-gray-100 px-4 py-2 rounded-2xl">
                <div className="flex gap-1 items-center">
                  <span className="text-xs text-gray-500 mr-2">AI is typing</span>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="border-t border-gray-200">
        <div className="px-4 py-3 flex items-end gap-3">
          <div className="flex-1 relative">
            <Textarea
              value={input}
              onChange={(e) => {
                if (!isTyping) setIsTyping(true)
                setInput(e.target.value)
              }}
              onBlur={() => setIsTyping(false)}
              placeholder={chatId === 'ai' ? 'Ask AI anything...' : 'Type a message...'}
              rows={1}
              className="resize-none bg-gray-50 rounded-2xl min-h-[44px] max-h-[120px]"
            />
          </div>
          <Button
            onClick={async () => {
              const content = input.trim()
              if (!content) return
              await sendMessage(content)
              setInput('')
              setIsTyping(false)
            }}
            disabled={!input.trim()}
            className="rounded-full min-w-[44px] h-[44px]"
          >
            Send
          </Button>
        </div>
      </div>
      {/* Video Call Popout */}
      <VideoCallUI
        isOpen={isVideoOpen}
        onClose={() => setIsVideoOpen(false)}
        contact={{ id: chatId, name: conversationTitle || 'Conversation' }}
        callType="outgoing"
      />
    </div>
  )
}
