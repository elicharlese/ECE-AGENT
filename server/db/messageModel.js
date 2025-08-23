const { supabase } = require('../config/db');

async function saveMessage(message) {
  try {
    const { data, error } = await supabase
      .from('messages')
      .insert([message])
      .select('*')
      .single();

    if (error) {
      console.error('[messageModel] saveMessage error:', error.message);
      throw error;
    }
    return data;
  } catch (err) {
    console.error('[messageModel] saveMessage unexpected error:', err);
    throw err;
  }
}

async function getMessagesByConversationId(conversationId) {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('timestamp', { ascending: true });

    if (error) {
      console.error('[messageModel] getMessagesByConversationId error:', error.message);
      return [];
    }
    return data || [];
  } catch (err) {
    console.error('[messageModel] getMessagesByConversationId unexpected error:', err);
    return [];
  }
}

module.exports = {
  saveMessage,
  getMessagesByConversationId,
};
