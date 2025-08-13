const WebSocket = require('ws');
const { supabase } = require('./config/db');
const { getConversationById } = require('./db/conversationModel');
const { saveMessage, getMessagesByConversationId } = require('./db/messageModel');

// Store active connections
const clients = new Map(); // Map of user IDs to WebSocket connections
const conversations = new Map(); // Map of conversation IDs to connected user IDs

// Utility function to verify JWT token
const verifyToken = async (token) => {
  try {
    // Extract token from 'Bearer <token>' format if needed
    const jwt = token.startsWith('Bearer ') ? token.slice(7) : token;
    
    // Verify the token with Supabase
    const { data, error } = await supabase.auth.getUser(jwt);
    
    if (error || !data.user) {
      console.error('Token verification error:', error?.message || 'Invalid token');
      return null;
    }
    
    return data.user;
  } catch (err) {
    console.error('Token verification error:', err);
    return null;
  }
};

// WebSocket server setup
const setupWebSocketServer = (server) => {
  const wss = new WebSocket.Server({ server });
  
  wss.on('connection', async (ws, req) => {
    console.log('New WebSocket connection');
    
    // Store connection info
    let userId = null;
    let currentConversationId = null;
    
    // Handle messages from client
    ws.on('message', async (message) => {
      try {
        const data = JSON.parse(message);
        
        switch (data.type) {
          case 'authenticate':
            // Authenticate user
            const user = await verifyToken(data.token);
            if (user) {
              userId = user.id;
              clients.set(userId, ws);
              ws.send(JSON.stringify({ type: 'authenticated', success: true }));
              console.log(`User ${userId} authenticated`);
            } else {
              ws.send(JSON.stringify({ type: 'error', message: 'Authentication failed' }));
            }
            break;
            
          case 'join_conversation':
            if (!userId) {
              ws.send(JSON.stringify({ type: 'error', message: 'Not authenticated' }));
              break;
            }
            
            // Validate user has access to conversation
            const conversation = await getConversationById(data.conversationId);
            if (!conversation || conversation.user_id !== userId) {
              ws.send(JSON.stringify({ type: 'error', message: 'Access denied' }));
              break;
            }
            
            // Leave previous conversation if any
            if (currentConversationId) {
              leaveConversation(userId, currentConversationId);
            }
            
            // Join new conversation
            currentConversationId = data.conversationId;
            joinConversation(userId, currentConversationId);
            
            ws.send(JSON.stringify({ type: 'conversation_joined', conversationId: currentConversationId }));
            
            // Send conversation history
            const messages = await getMessagesByConversationId(data.conversationId);
            ws.send(JSON.stringify({ type: 'conversation_history', messages }));
            
            console.log(`User ${userId} joined conversation ${currentConversationId}`);
            break;
            
          case 'leave_conversation':
            if (userId && currentConversationId) {
              leaveConversation(userId, currentConversationId);
              currentConversationId = null;
              ws.send(JSON.stringify({ type: 'conversation_left' }));
            }
            break;
            
          case 'send_message':
            if (!userId || !currentConversationId) {
              ws.send(JSON.stringify({ type: 'error', message: 'Not in a conversation' }));
              break;
            }
            
            // Create message object
            const messageData = {
              id: Date.now().toString(),
              conversation_id: currentConversationId,
              user_id: userId,
              content: data.content,
              role: 'user',
              timestamp: new Date().toISOString(),
              metadata: data.metadata || {}
            };
            
            // Save message to database
            await saveNewMessage(messageData);
            
            // Broadcast message to all users in conversation
            broadcastToConversation(currentConversationId, {
              type: 'message',
              message: messageData
            }, userId);
            
            console.log(`Message sent by user ${userId} in conversation ${currentConversationId}`);
            break;
            
          case 'typing':
            if (!userId || !currentConversationId) {
              break;
            }
            
            // Broadcast typing indicator
            broadcastToConversation(currentConversationId, {
              type: 'typing',
              userId: userId,
              isTyping: data.isTyping
            }, userId);
            break;
            
          default:
            ws.send(JSON.stringify({ type: 'error', message: 'Unknown message type' }));
        }
      } catch (error) {
        console.error('Error processing message:', error);
        ws.send(JSON.stringify({ type: 'error', message: 'Internal server error' }));
      }
    });
    
    // Handle connection close
    ws.on('close', () => {
      console.log('WebSocket connection closed');
      
      // Clean up
      if (userId) {
        clients.delete(userId);
        
        if (currentConversationId) {
          leaveConversation(userId, currentConversationId);
        }
      }
    });
    
    // Handle errors
    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
    });
  });
  
  return wss;
};

// Helper functions
const joinConversation = (userId, conversationId) => {
  if (!conversations.has(conversationId)) {
    conversations.set(conversationId, new Set());
  }
  
  conversations.get(conversationId).add(userId);
};

const leaveConversation = (userId, conversationId) => {
  if (conversations.has(conversationId)) {
    const users = conversations.get(conversationId);
    users.delete(userId);
    
    // Clean up empty conversations
    if (users.size === 0) {
      conversations.delete(conversationId);
    }
  }
};

const broadcastToConversation = (conversationId, message, excludeUserId = null) => {
  if (conversations.has(conversationId)) {
    const users = conversations.get(conversationId);
    
    for (const userId of users) {
      if (userId === excludeUserId) continue;
      
      const client = clients.get(userId);
      if (client && client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(message));
      }
    }
  }
};

const saveNewMessage = async (messageData) => {
  try {
    const { data, error } = await supabase
      .from('messages')
      .insert([messageData])
      .select()
      .single();
    
    if (error) {
      console.error('Error saving message:', error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Error saving message:', error);
    throw error;
  }
};

module.exports = { setupWebSocketServer };
