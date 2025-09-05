"use client"

import { useState, useEffect } from "react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Textarea
} from '@/libs/design-system';
import { Button } from '@/libs/design-system'
import { Input } from '@/libs/design-system'

// TODO: Replace deprecated components: Textarea
// 
// TODO: Replace deprecated components: Textarea
// import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/libs/design-system'
import { Avatar, AvatarFallback } from '@/libs/design-system'
import { 
  MessageSquare, 
  Send, 
  Phone, 
  Settings,
  Clock,
  Check,
  CheckCheck,
  AlertCircle
} from "lucide-react"
import { useUser } from "@/hooks/use-user"

interface Message {
  id: string
  text: string
  timestamp: Date
  sender: 'user' | 'contact'
  status: 'sending' | 'sent' | 'delivered' | 'read' | 'failed'
}

interface Contact {
  phone: string
  name?: string
  lastSeen?: Date
}

export function TextMessageTest() {
  const { user } = useUser()
  const [messages, setMessages] = useState<Message[]>([])
  const [currentMessage, setCurrentMessage] = useState('')
  const [contact, setContact] = useState<Contact | null>(null)
  const [phoneInput, setPhoneInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    // Simulate message status updates
    const interval = setInterval(() => {
      setMessages(prev => prev.map(msg => {
        if (msg.sender === 'user' && msg.status === 'sending') {
          return { ...msg, status: 'sent' }
        }
        if (msg.sender === 'user' && msg.status === 'sent' && Math.random() > 0.7) {
          return { ...msg, status: 'delivered' }
        }
        if (msg.sender === 'user' && msg.status === 'delivered' && Math.random() > 0.8) {
          return { ...msg, status: 'read' }
        }
        return msg
      }))
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    // Simulate incoming messages
    if (isConnected && messages.length > 0) {
      const timeout = setTimeout(() => {
        if (Math.random() > 0.6) {
          const responses = [
            "Hey! Got your message 👍",
            "Thanks for reaching out",
            "Sure, let me check on that",
            "Sounds good to me!",
            "I'll get back to you soon"
          ]
          
          const newMessage: Message = {
            id: Date.now().toString(),
            text: responses[Math.floor(Math.random() * responses.length)],
            timestamp: new Date(),
            sender: 'contact',
            status: 'delivered'
          }
          
          setMessages(prev => [...prev, newMessage])
        }
      }, 3000 + Math.random() * 5000)

      return () => clearTimeout(timeout)
    }
  }, [messages.length, isConnected])

  const formatPhoneNumber = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '')
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`
    }
    return phone
  }

  const handleStartConversation = async () => {
    if (!phoneInput.trim()) {
      setError('Please enter a phone number')
      return
    }

    const cleanedPhone = phoneInput.replace(/\D/g, '')
    if (cleanedPhone.length < 10) {
      setError('Please enter a valid phone number')
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Simulate API call to start conversation
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      setContact({
        phone: phoneInput,
        name: `Contact ${cleanedPhone.slice(-4)}`,
        lastSeen: new Date()
      })
      setIsConnected(true)
      setMessages([])
    } catch (err) {
      setError('Failed to start conversation. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleSendMessage = async () => {
    if (!currentMessage.trim() || !contact) return

    const newMessage: Message = {
      id: Date.now().toString(),
      text: currentMessage.trim(),
      timestamp: new Date(),
      sender: 'user',
      status: 'sending'
    }

    setMessages(prev => [...prev, newMessage])
    setCurrentMessage('')

    // Simulate message sending
    setTimeout(() => {
      setMessages(prev => prev.map(msg => 
        msg.id === newMessage.id ? { ...msg, status: 'sent' } : msg
      ))
    }, 1000)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const getStatusIcon = (status: Message['status']) => {
    switch (status) {
      case 'sending':
        return <Clock className="h-3 w-3 text-gray-400 animate-spin" />
      case 'sent':
        return <Check className="h-3 w-3 text-gray-400" />
      case 'delivered':
        return <CheckCheck className="h-3 w-3 text-gray-400" />
      case 'read':
        return <CheckCheck className="h-3 w-3 text-blue-500" />
      case 'failed':
        return <AlertCircle className="h-3 w-3 text-red-500" />
      default:
        return null
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="space-y-6">
      {/* Connection Setup */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Text Message Conversation
            {isConnected && (
              <Badge variant="default" className="ml-2">
                Connected
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isConnected ? (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                  Phone Number
                </label>
                <Input
                  placeholder="Enter phone number (e.g., +1 555-123-4567)"
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value)}
                  className="max-w-md"
                />
              </div>
              
              {error && (
                <div className="text-sm text-red-600 dark:text-red-400">
                  {error}
                </div>
              )}
              
              <Button 
                onClick={handleStartConversation} 
                disabled={loading}
                className="gap-2"
              >
                <MessageSquare className="h-4 w-4" />
                {loading ? 'Connecting...' : 'Start Conversation'}
              </Button>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarFallback>
                    {contact?.name?.charAt(0) || 'C'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-gray-100">
                    {contact?.name || 'Unknown Contact'}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {formatPhoneNumber(contact?.phone || '')}
                  </p>
                </div>
              </div>
              <Button 
                onClick={() => {
                  setIsConnected(false)
                  setContact(null)
                  setMessages([])
                }} 
                variant="outline"
                size="sm"
              >
                End Chat
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Message Thread */}
      {isConnected && (
        <Card>
          <CardHeader>
            <CardTitle>Messages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Messages Container */}
              <div className="h-96 overflow-y-auto border rounded-lg p-4 space-y-3 bg-gray-50 dark:bg-gray-800">
                {messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    <div className="text-center">
                      <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No messages yet. Start the conversation!</p>
                    </div>
                  </div>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          message.sender === 'user'
                            ? 'bg-blue-500 text-white'
                            : 'bg-white dark:bg-gray-700 border'
                        }`}
                      >
                        <p className="text-sm">{message.text}</p>
                        <div className={`flex items-center gap-1 mt-1 ${
                          message.sender === 'user' ? 'justify-end' : 'justify-start'
                        }`}>
                          <span className={`text-xs ${
                            message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'
                          }`}>
                            {formatTime(message.timestamp)}
                          </span>
                          {message.sender === 'user' && getStatusIcon(message.status)}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Message Input */}
              <div className="flex gap-2">
                <Textarea
                  placeholder="Type your message..."
                  value={currentMessage}
                  onChange={(e) => setCurrentMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1 min-h-[40px] max-h-32 resize-none"
                  rows={1}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!currentMessage.trim()}
                  className="gap-2"
                >
                  <Send className="h-4 w-4" />
                  Send
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Message Statistics */}
      {isConnected && (
        <Card>
          <CardHeader>
            <CardTitle>Conversation Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 border rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {messages.filter(m => m.sender === 'user').length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Sent</div>
              </div>
              <div className="text-center p-3 border rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {messages.filter(m => m.sender === 'contact').length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Received</div>
              </div>
              <div className="text-center p-3 border rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {messages.filter(m => m.status === 'read').length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Read</div>
              </div>
              <div className="text-center p-3 border rounded-lg">
                <div className="text-2xl font-bold text-gray-600">
                  {messages.length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Total</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Environment Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Environment Info
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700 dark:text-gray-300">User:</span>
              <p className="text-gray-600 dark:text-gray-400">
                {user?.email || 'Not authenticated'}
              </p>
            </div>
            <div>
              <span className="font-medium text-gray-700 dark:text-gray-300">SMS Provider:</span>
              <p className="text-gray-600 dark:text-gray-400">
                Twilio (Simulated)
              </p>
            </div>
            <div>
              <span className="font-medium text-gray-700 dark:text-gray-300">Connection:</span>
              <Badge variant={isConnected ? 'default' : 'secondary'}>
                {isConnected ? 'Active Chat' : 'No Conversation'}
              </Badge>
            </div>
            <div>
              <span className="font-medium text-gray-700 dark:text-gray-300">Message Count:</span>
              <p className="text-gray-600 dark:text-gray-400">
                {messages.length} messages
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
