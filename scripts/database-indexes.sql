-- Batch 2 Performance Optimization: Database Indexes
-- Run this script in Supabase SQL Editor

-- Messages table indexes for faster queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_messages_conversation_created 
ON messages(conversation_id, created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_messages_user_id 
ON messages(user_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_messages_type 
ON messages(type) WHERE type != 'text';

-- Conversation participants for faster lookups
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_conversation_participants_user 
ON conversation_participants(user_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_conversation_participants_conversation 
ON conversation_participants(conversation_id);

-- Conversations table indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_conversations_created_at 
ON conversations(created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_conversations_updated_at 
ON conversations(updated_at DESC);

-- User presence tracking (for future use)
CREATE TABLE IF NOT EXISTS user_presence (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id),
  status TEXT DEFAULT 'offline',
  last_seen TIMESTAMPTZ DEFAULT NOW(),
  typing_in UUID REFERENCES conversations(id),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_presence_status 
ON user_presence(status);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_presence_last_seen 
ON user_presence(last_seen DESC);

-- Message reactions table
CREATE TABLE IF NOT EXISTS message_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  emoji TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(message_id, user_id, emoji)
);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_message_reactions_message 
ON message_reactions(message_id);

-- Message read receipts
CREATE TABLE IF NOT EXISTS message_read_receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  read_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(message_id, user_id)
);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_message_read_receipts_message 
ON message_read_receipts(message_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_message_read_receipts_user 
ON message_read_receipts(user_id);

-- Full text search on messages
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_messages_content_fts 
ON messages USING gin(to_tsvector('english', content));

-- Performance optimization for message pagination
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_messages_pagination 
ON messages(conversation_id, created_at DESC, id);

-- Composite index for conversation queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_conversations_composite 
ON conversations(id, updated_at DESC);

-- RLS policies for new tables
ALTER TABLE user_presence ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_read_receipts ENABLE ROW LEVEL SECURITY;

-- User presence policies
CREATE POLICY "Users can view all presence" ON user_presence
  FOR SELECT USING (true);

CREATE POLICY "Users can update own presence" ON user_presence
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own presence" ON user_presence
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Message reactions policies
CREATE POLICY "Users can view reactions" ON message_reactions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM messages m
      JOIN conversation_participants cp ON cp.conversation_id = m.conversation_id
      WHERE m.id = message_reactions.message_id
      AND cp.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can add own reactions" ON message_reactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove own reactions" ON message_reactions
  FOR DELETE USING (auth.uid() = user_id);

-- Read receipts policies
CREATE POLICY "Users can view read receipts" ON message_read_receipts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM messages m
      JOIN conversation_participants cp ON cp.conversation_id = m.conversation_id
      WHERE m.id = message_read_receipts.message_id
      AND cp.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can add own read receipts" ON message_read_receipts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Analyze tables for query optimization
ANALYZE messages;
ANALYZE conversations;
ANALYZE conversation_participants;
ANALYZE user_presence;
ANALYZE message_reactions;
ANALYZE message_read_receipts;
