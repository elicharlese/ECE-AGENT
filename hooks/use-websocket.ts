'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { supabase } from '@/lib/supabase/client';

interface Message {
  id: string
  text: string
  sender: 'user' | 'other' | 'ai'
  senderName?: string
  timestamp: Date
  conversationId: string
  type?: 'text' | 'image' | 'video' | 'audio' | 'document' | 'system' | 'gif' | 'app'
  mediaUrl?: string
  fileName?: string
  fileSize?: string
  isPinned?: boolean
  isLiked?: boolean
  likeCount?: number
  status?: 'sent' | 'delivered' | 'read'
  appData?: {
    appId: string
    appName: string
    data: any
  }
}

interface WebSocketMessage {
  type: string;
  [key: string]: any;
}

export function useWebSocket() {
  if (process.env.NODE_ENV !== 'production') {
    // lightweight trace in dev only
    // console.debug('useWebSocket init')
  }
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [typingUsers, setTypingUsers] = useState<Record<string, { name: string; timestamp: number }>>({});

  const wsRef = useRef<WebSocket | null>(null);
  const WS_URL = process.env.NEXT_PUBLIC_WEBSOCKET_URL; // Build-time public env
  const DEFER_UNTIL_INTERACTION =
    (process.env.NEXT_PUBLIC_WS_DEFER_UNTIL_INTERACTION || '').toLowerCase() === '1' ||
    (process.env.NEXT_PUBLIC_WS_DEFER_UNTIL_INTERACTION || '').toLowerCase() === 'true'

  const connect = async () => {
    console.log('connect function called');
    // Get the current session token from Supabase
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;
    
    if (!token) {
      console.error('No authentication token available');
      return;
    }

    if (!WS_URL) {
      console.warn('NEXT_PUBLIC_WEBSOCKET_URL is not set. Skipping real WS connect.');
      return;
    }

    console.log('Creating WebSocket connection');
    if (wsRef.current && (wsRef.current.readyState === WebSocket.OPEN || wsRef.current.readyState === WebSocket.CONNECTING)) {
      return;
    }
    
    wsRef.current = new WebSocket(WS_URL);
    
    wsRef.current.onopen = () => {
      console.log('WebSocket connected');
      setIsConnected(true);
      
      // Authenticate with the token
      wsRef.current?.send(JSON.stringify({
        type: 'authenticate',
        token
      }));
    };
    
    wsRef.current.onmessage = (event) => {
      const message = JSON.parse(event.data);
      setMessages(prev => [...prev, message]);
      
      // Handle different message types
      switch (message.type) {
        case 'new_message':
          // Add to messages state
          break;
        case 'typing':
          // Handle typing indicator
          break;
        case 'read_receipt':
          // Handle read receipt
          break;
      }
    };
    
    wsRef.current.onclose = () => {
      console.log('WebSocket disconnected');
      setIsConnected(false);
    };
    
    wsRef.current.onerror = (error: any) => {
      console.error('WebSocket error:', error);
    };
  };
  
  const disconnect = () => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setIsConnected(false);
  };
  
  const sendMessage = useCallback((text: string, conversationId: string) => {
    const newMessage: Message = {
      id: `${Date.now()}-${Math.random()}`,
      text,
      sender: 'user',
      timestamp: new Date(),
      conversationId,
      type: 'text',
      status: 'sent'
    }
    
    // Add message optimistically
    setMessages(prev => [...prev, newMessage])
    
    // Simulate status updates
    setTimeout(() => {
      setMessages(prev =>
        prev.map(msg =>
          msg.id === newMessage.id ? { ...msg, status: 'delivered' } : msg
        )
      )
    }, 500)
    
    setTimeout(() => {
      setMessages(prev =>
        prev.map(msg =>
          msg.id === newMessage.id ? { ...msg, status: 'read' } : msg
        )
      )
    }, 1500)
    
    // Simulate AI response if message contains "ai" or "help"
    if (text.toLowerCase().includes('ai') || text.toLowerCase().includes('help')) {
      // Show typing indicator
      const typingId = 'ai-assistant'
      setTypingUsers(prev => ({
        ...prev,
        [typingId]: { name: 'AI Assistant', timestamp: Date.now() }
      }))
      
      setTimeout(() => {
        // Remove typing indicator
        setTypingUsers(prev => {
          const newTyping = { ...prev }
          delete newTyping[typingId]
          return newTyping
        })
        
        // Add AI response
        const aiResponse: Message = {
          id: `${Date.now()}-ai-${Math.random()}`,
          text: 'I can help you with that! What specific assistance do you need?',
          sender: 'ai',
          senderName: 'AI Assistant',
          timestamp: new Date(),
          conversationId,
          type: 'text',
          status: 'read'
        }
        setMessages(prev => [...prev, aiResponse])
      }, 2000)
    }
  }, [])

  const sendTyping = useCallback((conversationId: string) => {
    console.log(`Sending typing indicator for: ${conversationId}`)
    // In a real implementation, this would emit to the WebSocket server
  }, [])

  const joinConversation = useCallback((conversationId: string) => {
    console.log(`Joining conversation: ${conversationId}`)
    setCurrentConversationId(conversationId)
    setMessages([]) // Clear messages when switching conversations
  }, [])

  const leaveConversation = useCallback((conversationId: string) => {
    console.log(`Leaving conversation: ${conversationId}`)
    if (currentConversationId === conversationId) {
      setCurrentConversationId(null)
      setMessages([])
    }
  }, [currentConversationId])

  // Mock connection only when no WS URL is configured
  useEffect(() => {
    if (WS_URL) return;
    const mockConnect = () => {
      console.log('Mock WebSocket connected')
      setIsConnected(true)
      
      // Simulate receiving some initial messages after joining
      if (currentConversationId) {
        setTimeout(() => {
          const mockHistoricalMessages: Message[] = [
            {
              id: 'mock1',
              text: 'Welcome to the conversation!',
              sender: 'other',
              senderName: 'System',
              timestamp: new Date(Date.now() - 3600000),
              conversationId: currentConversationId,
              status: 'read'
            },
            {
              id: 'mock2',
              text: 'This is a real-time messaging demo.',
              sender: 'ai',
              senderName: 'AI Assistant',
              timestamp: new Date(Date.now() - 1800000),
              conversationId: currentConversationId,
              status: 'read'
            }
          ]
          setMessages(mockHistoricalMessages)
        }, 500)
      }
    }

    mockConnect()

    return () => {
      console.log('Mock WebSocket cleanup')
      setIsConnected(false)
    }
  }, [WS_URL, currentConversationId])

  useEffect(() => {
    // Defer connect until the page is visible and the browser is idle.
    if (!WS_URL) return;
    let canceled = false

    const scheduleIdle = () => {
      if ('requestIdleCallback' in window) {
        ;(window as any).requestIdleCallback(() => {
          if (!canceled) connect()
        }, { timeout: 1500 })
      } else {
        setTimeout(() => { if (!canceled) connect() }, 200)
      }
    }

    const scheduleWhenVisible = () => {
      if (typeof document !== 'undefined' && document.visibilityState !== 'visible') {
        const onVisible = () => {
          if (document.visibilityState === 'visible') {
            document.removeEventListener('visibilitychange', onVisible)
            scheduleIdle()
          }
        }
        document.addEventListener('visibilitychange', onVisible)
      } else {
        scheduleIdle()
      }
    }

    if (typeof window !== 'undefined' && DEFER_UNTIL_INTERACTION) {
      const once = () => {
        cleanup()
        scheduleWhenVisible()
      }
      const cleanup = () => {
        window.removeEventListener('pointerdown', once)
        window.removeEventListener('keydown', once)
        window.removeEventListener('touchstart', once)
        window.removeEventListener('focus', once, true)
      }
      window.addEventListener('pointerdown', once, { passive: true })
      window.addEventListener('keydown', once)
      window.addEventListener('touchstart', once, { passive: true })
      window.addEventListener('focus', once, true)
      // Safety: also schedule after 5s in case no interaction occurs
      const safety = setTimeout(() => { cleanup(); scheduleWhenVisible() }, 5000)
      return () => { canceled = true; cleanup(); clearTimeout(safety); disconnect() }
    }

    scheduleWhenVisible()

    return () => {
      canceled = true
      disconnect()
    }
  }, [WS_URL, DEFER_UNTIL_INTERACTION])

  return {
    isConnected,
    messages,
    connect,
    disconnect,
    joinConversation,
    leaveConversation,
    sendMessage,
    sendChatMessage: sendMessage, // Alias for compatibility
    sendTyping,
    typingUsers
  };
}
