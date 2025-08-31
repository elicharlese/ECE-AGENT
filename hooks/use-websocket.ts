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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [myUserId, setMyUserId] = useState<string | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const WS_URL = process.env.NEXT_PUBLIC_WEBSOCKET_URL; // Build-time public env
  const DEFER_UNTIL_INTERACTION =
    (process.env.NEXT_PUBLIC_WS_DEFER_UNTIL_INTERACTION || '').toLowerCase() === '1' ||
    (process.env.NEXT_PUBLIC_WS_DEFER_UNTIL_INTERACTION || '').toLowerCase() === 'true'

  // Refs to avoid stale closures inside socket handlers
  const currentConversationIdRef = useRef<string | null>(null)
  const myUserIdRef = useRef<string | null>(null)
  useEffect(() => { currentConversationIdRef.current = currentConversationId }, [currentConversationId])
  useEffect(() => { myUserIdRef.current = myUserId }, [myUserId])

  const connect = async () => {
    console.log('connect function called');
    // Get the current session token from Supabase
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;
    const uid = session?.user?.id || null
    setMyUserId(uid)
    
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
      try {
        const data: WebSocketMessage = JSON.parse(event.data);
        switch (data.type) {
          case 'authenticated': {
            setIsAuthenticated(true)
            // auto-join if a conversation is already selected
            const pending = currentConversationIdRef.current
            if (pending) {
              try {
                wsRef.current?.send(JSON.stringify({ type: 'join_conversation', conversationId: pending }))
              } catch {}
            }
            break
          }
          case 'conversation_joined': {
            // no-op; UI already tracks currentConversationId
            break
          }
          case 'conversation_history': {
            const arr = Array.isArray((data as any).messages) ? (data as any).messages : []
            if (arr.length) {
              const mapped: Message[] = arr.map((m: any) => ({
                id: m.id,
                text: m.content,
                sender: m.user_id === myUserIdRef.current ? 'user' : 'other',
                senderName: m.role === 'assistant' ? 'AI Assistant' : undefined,
                timestamp: new Date(m.timestamp || m.created_at || Date.now()),
                conversationId: m.conversation_id,
                type: (m.type || 'text') as Message['type'],
                status: 'read',
              }))
              setMessages(prev => {
                const byId = new Set(prev.map(p => p.id))
                const additions = mapped.filter(m => !byId.has(m.id))
                return [...prev, ...additions]
              })
            }
            break
          }
          case 'message': {
            const m = (data as any).message
            if (m) {
              const mapped: Message = {
                id: m.id,
                text: m.content,
                sender: m.user_id === myUserIdRef.current ? 'user' : 'other',
                senderName: m.role === 'assistant' ? 'AI Assistant' : undefined,
                timestamp: new Date(m.timestamp || Date.now()),
                conversationId: m.conversation_id,
                type: (m.type || 'text') as Message['type'],
                status: 'delivered',
              }
              setMessages(prev => [...prev, mapped])
            }
            break
          }
          case 'typing': {
            const { userId, isTyping } = data as any
            setTypingUsers(prev => {
              const next = { ...prev }
              if (userId === myUserIdRef.current) return next
              if (isTyping) {
                next[userId] = { name: 'Someone', timestamp: Date.now() }
              } else {
                delete next[userId]
              }
              return next
            })
            break
          }
          case 'error': {
            console.error('WebSocket server error:', (data as any).message)
            break
          }
          default: {
            // Unknown/unused event type
            break
          }
        }
      } catch (e) {
        console.warn('WebSocket onmessage parse error', e)
      }
    };
    
    wsRef.current.onclose = () => {
      console.log('WebSocket disconnected');
      setIsConnected(false);
      setIsAuthenticated(false);
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
    setIsAuthenticated(false);
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

    // Send to server if connected & authenticated
    try {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN && isAuthenticated) {
        wsRef.current.send(JSON.stringify({ type: 'send_message', content: text }))
      }
    } catch (e) {
      console.warn('sendMessage WS send failed', e)
    }
  }, [])

  const typingTimeoutRef = useRef<number | null>(null)
  const sendTyping = useCallback((conversationId: string) => {
    console.log(`Sending typing indicator for: ${conversationId}`)
    try {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN && isAuthenticated) {
        wsRef.current.send(JSON.stringify({ type: 'typing', isTyping: true }))
        if (typingTimeoutRef.current) window.clearTimeout(typingTimeoutRef.current)
        typingTimeoutRef.current = window.setTimeout(() => {
          try { wsRef.current?.send(JSON.stringify({ type: 'typing', isTyping: false })) } catch {}
        }, 1500)
      }
    } catch (e) {
      console.warn('sendTyping WS send failed', e)
    }
  }, [isAuthenticated])

  const sendEditMessage = useCallback((id: string, text: string, conversationId: string) => {
    // Try to send an edit event to the server if WS is live
    try {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        const payload: WebSocketMessage = { type: 'edit_message', id, text, conversationId }
        wsRef.current.send(JSON.stringify(payload))
      }
    } catch (e) {
      console.warn('sendEditMessage WS send failed', e)
    }
    // Always simulate a local event so other UI parts can react in mock mode
    setMessages(prev => [
      ...prev,
      { type: 'message_edited', id, text, conversationId, timestamp: new Date(), sender: 'user' } as any,
    ])
  }, [])

  const joinConversation = useCallback((conversationId: string) => {
    console.log(`Joining conversation: ${conversationId}`)
    setCurrentConversationId(conversationId)
    setMessages([]) // Clear messages when switching conversations
    try {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN && isAuthenticated) {
        wsRef.current.send(JSON.stringify({ type: 'join_conversation', conversationId }))
      }
    } catch (e) {
      console.warn('joinConversation WS send failed', e)
    }
  }, [isAuthenticated])

  const leaveConversation = useCallback((conversationId: string) => {
    console.log(`Leaving conversation: ${conversationId}`)
    if (currentConversationId === conversationId) {
      setCurrentConversationId(null)
      setMessages([])
    }
    try {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN && isAuthenticated) {
        wsRef.current.send(JSON.stringify({ type: 'leave_conversation' }))
      }
    } catch (e) {
      console.warn('leaveConversation WS send failed', e)
    }
  }, [currentConversationId, isAuthenticated])

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
    sendEditMessage,
    sendTyping,
    typingUsers
  };
}
