import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/lib/supabase/client';

interface WebSocketMessage {
  type: string;
  [key: string]: any;
}

export function useWebSocket() {
  console.log('useWebSocket hook called');
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<WebSocketMessage[]>([]);
  const wsRef = useRef<WebSocket | null>(null);
  
  const connect = async () => {
    console.log('connect function called');
    // Get the current session token from Supabase
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;
    
    if (!token) {
      console.error('No authentication token available');
      return;
    }
    
    console.log('Creating WebSocket connection');
    if (wsRef.current?.readyState === WebSocket.OPEN) return;
    
    wsRef.current = new WebSocket('ws://localhost:3001');
    
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
  
  const sendMessage = (message: WebSocketMessage) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    } else {
      console.error('WebSocket is not connected');
    }
  };
  
  const joinConversation = (conversationId: string) => {
    sendMessage({
      type: 'join_conversation',
      conversationId
    });
  };
  
  const leaveConversation = (conversationId: string) => {
    sendMessage({
      type: 'leave_conversation',
      conversationId
    });
  };
  
  const sendChatMessage = (conversationId: string, content: string) => {
    sendMessage({
      type: 'send_message',
      conversationId,
      content
    });
  };
  
  const sendTyping = (conversationId: string) => {
    sendMessage({
      type: 'typing',
      conversationId
    });
  };
  
  useEffect(() => {
    // Connect when the hook is initialized
    connect();
    
    return () => {
      disconnect();
    };
  }, []);
  
  return {
    isConnected,
    messages,
    connect,
    disconnect,
    joinConversation,
    leaveConversation,
    sendChatMessage,
    sendTyping
  };
}
