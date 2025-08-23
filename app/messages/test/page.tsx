'use client'

import { useState, useEffect, useRef } from 'react'
import { Bot, User } from 'lucide-react'
import { RichMessageInput } from '@/components/messages/rich-message-input'

interface Message {
  id: string
  content: string
  timestamp: string
  senderId: string
  senderName: string
  type: 'text' | 'system'
  isOwn: boolean
  isAI?: boolean
}

export default function TestMessagesPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: 'Welcome to the test messaging interface!',
      timestamp: new Date().toISOString(),
      senderId: 'system',
      senderName: 'System',
      type: 'system',
      isOwn: false
    }
  ])
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [density, setDensity] = useState<'compact' | 'comfortable' | 'airy'>('comfortable')

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async (messageText: string) => {
    if (!messageText.trim()) return

    const newMessage: Message = {
      id: Date.now().toString(),
      content: messageText,
      timestamp: new Date().toISOString(),
      senderId: 'dev-admin',
      senderName: 'Dev Admin',
      type: 'text',
      isOwn: true
    }

    setMessages(prev => [...prev, newMessage])

    // Check if message is for AI (starts with @ai)
    if (messageText.toLowerCase().startsWith('@ai ')) {
      setIsTyping(true)
      
      // Simulate AI response
      setTimeout(() => {
        const aiResponse: Message = {
          id: Date.now().toString(),
          content: `AI Response: I received your message "${messageText.slice(4)}". This is a mock response demonstrating the AI chat functionality.`,
          timestamp: new Date().toISOString(),
          senderId: 'ai-assistant',
          senderName: 'AI Assistant',
          type: 'text',
          isOwn: false,
          isAI: true
        }
        setMessages(prev => [...prev, aiResponse])
        setIsTyping(false)
      }, 1500)
    }

    // Simulate realtime echo from another user
    if (!messageText.toLowerCase().startsWith('@ai')) {
      setTimeout(() => {
        const echoMessage: Message = {
          id: Date.now().toString(),
          content: `Echo from test-user: "${messageText}"`,
          timestamp: new Date().toISOString(),
          senderId: 'test-user',
          senderName: 'Test User',
          type: 'text',
          isOwn: false
        }
        setMessages(prev => [...prev, echoMessage])
      }, 1000)
    }
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4">
        <h1 className="text-2xl font-bold">Test Messaging Interface</h1>
        <p className="text-sm text-gray-600 mt-1">
          Test realtime messaging and AI chat (@ai prefix)
        </p>
        <div className="mt-3">
          <label className="text-xs text-gray-500 mr-2">Density:</label>
          <select
            value={density}
            onChange={(e) => setDensity(e.target.value as 'compact' | 'comfortable' | 'airy')}
            className="border border-gray-300 rounded px-2 py-1 text-sm"
          >
            <option value="compact">Compact</option>
            <option value="comfortable">Comfortable</option>
            <option value="airy">Airy</option>
          </select>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        <div className="max-w-4xl mx-auto space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.type === 'system'
                    ? 'bg-gray-200 text-gray-700'
                    : message.isOwn
                    ? 'bg-blue-500 text-white'
                    : message.isAI
                    ? 'bg-purple-500 text-white'
                    : 'bg-white border border-gray-300'
                }`}
              >
                {!message.isOwn && (
                  <div className="flex items-center gap-2 mb-1">
                    {message.isAI ? (
                      <Bot className="w-4 h-4" />
                    ) : (
                      <User className="w-4 h-4" />
                    )}
                    <span className="text-xs font-semibold">
                      {message.senderName}
                    </span>
                  </div>
                )}
                <p className="break-words">{message.content}</p>
                <p className={`text-xs mt-1 ${
                  message.isOwn ? 'text-blue-100' : 'text-gray-500'
                }`}>
                  {new Date(message.timestamp).toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-gray-200 px-4 py-2 rounded-lg">
                <div className="flex items-center gap-2">
                  <Bot className="w-4 h-4" />
                  <span className="text-sm">AI is typing...</span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-white border-t">
        <RichMessageInput
          className="px-6"
          placeholder="Type a message... (use @ai prefix for AI chat)"
          density={density}
          onTyping={() => setIsTyping(true)}
          onStopTyping={() => setIsTyping(false)}
          onSendMessage={(content) => handleSendMessage(content)}
        />
        <div className="max-w-4xl mx-auto px-6 pb-4">
          <div className="mt-2 text-xs text-gray-500">
            • Regular messages will be echoed by a test user (simulating realtime)
            <br />
            • Messages starting with "@ai" will get an AI response
          </div>
        </div>
      </div>
    </div>
  )
}
