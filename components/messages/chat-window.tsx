'use client'

import { useState, useEffect, useRef } from 'react'
import { 
  Phone, Video, Info, 
  Bot, User
} from 'lucide-react'
import { messageService } from '@/services/message-service'
import { conversationService, type Conversation } from '@/services/conversation-service'
import type { Message } from '@/types/message'
import { PhoneCallUI } from '@/components/calls/phone-call-ui'
import { VideoCallUI } from '@/components/calls/video-call-ui'
import { RichMessageInput } from '@/components/messages/rich-message-input'
import { useDensity } from '@/contexts/density-context'

interface ChatWindowProps {
  conversationId: string
  onOpenAiTools: () => void
  onOpenMcpTools: () => void
  isMobile: boolean
}

export function ChatWindow({
  conversationId,
  onOpenAiTools,
  onOpenMcpTools: _onOpenMcpTools,
  isMobile: _isMobile,
}: ChatWindowProps) {
  const { density } = useDensity()
  const [messages, setMessages] = useState<Message[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const [conversation, setConversation] = useState<Conversation | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [isPhoneOpen, setIsPhoneOpen] = useState(false)
  const [isVideoOpen, setIsVideoOpen] = useState(false)

  // Load conversation details
  useEffect(() => {
    const loadConversation = async () => {
      try {
        const convs = await conversationService.getConversations()
        const conv = convs.find(c => c.id === conversationId)
        setConversation(conv ?? null)
      } catch (error) {
        console.error('Failed to load conversation:', error)
      }
    }
    loadConversation()
  }, [conversationId])

  // Load messages
  useEffect(() => {
    const loadMessages = async () => {
      try {
        const data = await messageService.getMessages(conversationId)
        setMessages(data)
      } catch (error) {
        console.error('Failed to load messages:', error)
      }
    }
    loadMessages()
  }, [conversationId])

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const addReaction = (messageId: string, emoji: string) => {
    // Add reaction logic here
    console.log('Adding reaction:', emoji, 'to message:', messageId)
  }

  const isAiConversation = conversation?.agent_id === 'ai' || 
    conversation?.title?.includes('AI') || 
    conversation?.title?.includes('Assistant')

  const quickEmojis = ['👍', '❤️', '😂', '😮', '😢', '🎉']

  const contact = {
    id: conversation?.id || conversationId,
    name: conversation?.title || 'Conversation',
    avatar: undefined as string | undefined,
  }

  return (
    <>
      <div className="flex-1 flex flex-col bg-background">
      {/* Chat Header */}
      <div className="px-6 py-4 border-b backdrop-blur flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
            isAiConversation 
              ? 'bg-primary' 
              : 'bg-accent'
          }`}>
            {isAiConversation ? (
              <Bot className="w-5 h-5 text-primary-foreground" />
            ) : (
              <User className="w-5 h-5" />
            )}
          </div>
          <div>
            <h2 className="font-semibold text-foreground">
              {conversation?.title || 'Loading...'}
            </h2>
            <p className="text-sm text-muted-foreground">
              {isAiConversation ? 'AI Assistant • Active now' : 'Active 2m ago'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={onOpenAiTools}
            className="p-2 hover:bg-accent rounded-lg transition-colors"
            title="AI Tools"
          >
            <Bot className="w-5 h-5 text-muted-foreground" />
          </button>
          <button 
            onClick={() => setIsPhoneOpen(true)}
            className="p-2 hover:bg-accent rounded-lg transition-colors"
          >
            <Phone className="w-5 h-5 text-muted-foreground" />
          </button>
          <button 
            onClick={() => setIsVideoOpen(true)}
            className="p-2 hover:bg-accent rounded-lg transition-colors"
          >
            <Video className="w-5 h-5 text-muted-foreground" />
          </button>
          <button className="p-2 hover:bg-accent rounded-lg transition-colors">
            <Info className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-background">
        {messages.map((message) => {
          const isAi = message.is_ai
          const isOwn = !isAi && message.user_id === 'current-user'
          
          return (
            <div
              key={message.id}
              className={`flex gap-3 ${isOwn ? 'justify-end' : ''}`}
            >
              {!isOwn && (
                <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${
                  isAi ? 'bg-primary' : 'bg-accent'
                }`}>
                  {isAi ? (
                    <Bot className="w-4 h-4 text-primary-foreground" />
                  ) : (
                    <User className="w-4 h-4" />
                  )}
                </div>
              )}
              <div className={`group relative max-w-md ${isOwn ? 'items-end' : ''}`}>
                <div className={`px-4 py-2 rounded-2xl ${
                  isOwn 
                    ? 'bg-primary text-primary-foreground rounded-tr-sm' 
                    : 'bg-accent rounded-tl-sm'
                }`}>
                  <p className="whitespace-pre-wrap">{message.content}</p>
                  <div className={`text-xs mt-1 ${
                    isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'
                  }`}>
                    {new Date(message.created_at).toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                    {isOwn && ' · Read'}
                  </div>
                </div>
                
                {/* Quick reactions */}
                <div className="absolute -bottom-8 left-0 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 bg-card rounded-full shadow-lg px-2 py-1">
                  {quickEmojis.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => addReaction(message.id, emoji)}
                      className="hover:scale-110 transition-transform text-sm"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )
        })}
        
        {isTyping && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-primary flex-shrink-0 flex items-center justify-center">
              <Bot className="w-4 h-4 text-primary-foreground" />
            </div>
            <div className="bg-accent rounded-2xl rounded-tl-sm px-4 py-2">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <RichMessageInput
        className="px-6"
        placeholder={isAiConversation ? 'Ask AI anything...' : 'Type a message...'}
        density={density}
        onTyping={() => setIsTyping(true)}
        onStopTyping={() => setIsTyping(false)}
        onSendMessage={async (content) => {
          if (!content.trim()) return
          const tempMessage: Message = {
            id: Date.now().toString(),
            conversation_id: conversationId,
            user_id: 'current-user',
            content,
            created_at: new Date().toISOString(),
            is_ai: false
          }
          setMessages(prev => [...prev, tempMessage])
          setIsTyping(true)
          try {
            await messageService.sendMessage(conversationId, content)
            const updatedMessages = await messageService.getMessages(conversationId)
            setMessages(updatedMessages)
          } catch (error) {
            console.error('Failed to send message:', error)
          } finally {
            setIsTyping(false)
          }
        }}
      />
      </div>
      <PhoneCallUI 
      isOpen={isPhoneOpen} 
      onClose={() => setIsPhoneOpen(false)} 
      contact={contact}
      callType="outgoing"
    />
      <VideoCallUI 
      isOpen={isVideoOpen} 
      onClose={() => setIsVideoOpen(false)} 
      contact={contact}
      callType="outgoing"
    />
    </>
  )
}
