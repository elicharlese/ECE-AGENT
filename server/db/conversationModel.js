const { supabase } = require('../config/db');

// Utility function to get current timestamp
const getCurrentTimestamp = () => new Date().toISOString();

// Get conversation by ID
const getConversationById = async (conversationId) => {
  try {
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('id', conversationId)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') { // No rows returned
        return null;
      }
      throw new Error(`Database error: ${error.message}`);
    }
    
    return data;
  } catch (error) {
    console.error('Error getting conversation:', error.message);
    throw error;
  }
};

// Get conversations by agent ID and user ID
const getConversationsByAgentId = async (agentId, userId) => {
  try {
    const { data, error } = await supabase
      .from('conversations')
      .select('id, title, agent_id, created_at, updated_at')
      .eq('agent_id', agentId)
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });
    
    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }
    
    return data;
  } catch (error) {
    console.error('Error getting conversations:', error.message);
    throw error;
  }
};

// Save conversation (create or update)
const saveConversation = async (conversation) => {
  try {
    let result;
    
    if (conversation.id) {
      // Update existing conversation
      const { data, error } = await supabase
        .from('conversations')
        .update({
          title: conversation.title,
          messages: conversation.messages,
          updated_at: getCurrentTimestamp()
        })
        .eq('id', conversation.id)
        .select()
        .single();
      
      if (error) {
        throw new Error(`Database error: ${error.message}`);
      }
      
      result = data;
    } else {
      // Create new conversation
      const { data, error } = await supabase
        .from('conversations')
        .insert({
          title: conversation.title,
          agent_id: conversation.agent_id,
          user_id: conversation.user_id,
          messages: conversation.messages,
          created_at: getCurrentTimestamp(),
          updated_at: getCurrentTimestamp()
        })
        .select()
        .single();
      
      if (error) {
        throw new Error(`Database error: ${error.message}`);
      }
      
      result = data;
    }
    
    return result;
  } catch (error) {
    console.error('Error saving conversation:', error.message);
    throw error;
  }
};

// Delete conversation
const deleteConversation = async (conversationId) => {
  try {
    const { data, error } = await supabase
      .from('conversations')
      .delete()
      .eq('id', conversationId);
    
    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }
    
    return true;
  } catch (error) {
    console.error('Error deleting conversation:', error.message);
    throw error;
  }
};

module.exports = {
  getConversationById,
  getConversationsByAgentId,
  saveConversation,
  deleteConversation
};
