const { supabase } = require('../config/db');

async function getConversationById(id) {
  try {
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('[conversationModel] getConversationById error:', error.message);
      return null;
    }
    return data;
  } catch (err) {
    console.error('[conversationModel] getConversationById unexpected error:', err);
    return null;
  }
}

async function saveConversation(conversation) {
  try {
    const payload = {
      title: conversation.title,
      agent_id: conversation.agent_id,
      user_id: conversation.user_id || null,
      messages: Array.isArray(conversation.messages) ? conversation.messages : [],
    };

    if (conversation.id) {
      const { data, error } = await supabase
        .from('conversations')
        .update(payload)
        .eq('id', conversation.id)
        .select('*')
        .single();

      if (error) {
        console.error('[conversationModel] saveConversation (update) error:', error.message);
        throw error;
      }
      return data;
    }

    const { data, error } = await supabase
      .from('conversations')
      .insert([payload])
      .select('*')
      .single();

    if (error) {
      console.error('[conversationModel] saveConversation (insert) error:', error.message);
      throw error;
    }
    return data;
  } catch (err) {
    console.error('[conversationModel] saveConversation unexpected error:', err);
    throw err;
  }
}

async function getConversationsByAgentId(agentId, userId) {
  try {
    let query = supabase
      .from('conversations')
      .select('*')
      .eq('agent_id', agentId)
      .order('updated_at', { ascending: false });

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query;
    if (error) {
      console.error('[conversationModel] getConversationsByAgentId error:', error.message);
      return [];
    }
    return data || [];
  } catch (err) {
    console.error('[conversationModel] getConversationsByAgentId unexpected error:', err);
    return [];
  }
}

module.exports = {
  getConversationById,
  saveConversation,
  getConversationsByAgentId,
};
