const { supabase } = require('../config/db');

// Utility function to get current timestamp
const getCurrentTimestamp = () => new Date().toISOString();

// Get messages by conversation ID
const getMessagesByConversationId = async (conversationId) => {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('timestamp', { ascending: true });
    
    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }
    
    return data;
  } catch (error) {
    console.error('Error getting messages:', error.message);
    throw error;
  }
};

// Save message
const saveMessage = async (message) => {
  try {
    const { data, error } = await supabase
      .from('messages')
      .insert([{
        conversation_id: message.conversation_id,
        user_id: message.user_id,
        content: message.content,
        role: message.role,
        timestamp: message.timestamp || getCurrentTimestamp(),
        edited_at: message.edited_at,
        is_deleted: message.is_deleted || false,
        metadata: message.metadata || {}
      }])
      .select()
      .single();
    
    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }
    
    return data;
  } catch (error) {
    console.error('Error saving message:', error.message);
    throw error;
  }
};

// Update message
const updateMessage = async (messageId, updates) => {
  try {
    const { data, error } = await supabase
      .from('messages')
      .update({
        ...updates,
        edited_at: getCurrentTimestamp()
      })
      .eq('id', messageId)
      .select()
      .single();
    
    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }
    
    return data;
  } catch (error) {
    console.error('Error updating message:', error.message);
    throw error;
  }
};

// Delete message (soft delete)
const deleteMessage = async (messageId) => {
  try {
    const { data, error } = await supabase
      .from('messages')
      .update({
        is_deleted: true,
        edited_at: getCurrentTimestamp()
      })
      .eq('id', messageId)
      .select()
      .single();
    
    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }
    
    return data;
  } catch (error) {
    console.error('Error deleting message:', error.message);
    throw error;
  }
};

module.exports = {
  getMessagesByConversationId,
  saveMessage,
  updateMessage,
  deleteMessage
};
