-- Complete Database Setup - Run all migrations in order
-- Migration 001: Create conversations table
CREATE TABLE IF NOT EXISTS conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  agent_id VARCHAR(100) NOT NULL,
  messages JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_conversations_agent_id ON conversations(agent_id);
CREATE INDEX IF NOT EXISTS idx_conversations_created_at ON conversations(created_at);
CREATE INDEX IF NOT EXISTS idx_conversations_updated_at ON conversations(updated_at);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at timestamp
DROP TRIGGER IF EXISTS update_conversations_updated_at ON conversations;
CREATE TRIGGER update_conversations_updated_at
    BEFORE UPDATE ON conversations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Migration 002: Add user_id to conversations
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);
CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id);

-- Migration 003: Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  content TEXT NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  edited_at TIMESTAMPTZ,
  is_deleted BOOLEAN DEFAULT FALSE,
  metadata JSONB
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_user_id ON messages(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_timestamp ON messages(timestamp);
CREATE INDEX IF NOT EXISTS idx_messages_role ON messages(role);

-- Enable Row Level Security
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Migration 004: Create profiles and conversation_participants tables
CREATE TABLE IF NOT EXISTS profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger to update updated_at on profiles
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS for profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
DROP POLICY IF EXISTS "Anyone authenticated can read profiles" ON profiles;
CREATE POLICY "Anyone authenticated can read profiles" ON profiles
  FOR SELECT
  USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE
  USING (user_id = auth.uid());

-- Create conversation_participants table
CREATE TABLE IF NOT EXISTS conversation_participants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner','member')),
  last_read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Unique constraint to prevent duplicate membership
CREATE UNIQUE INDEX IF NOT EXISTS uq_conversation_participant
  ON conversation_participants(conversation_id, user_id);

-- Enable RLS for conversation_participants
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Participants can read membership of their conversations" ON conversation_participants;
-- Non-recursive variant: users can read only their own membership rows
CREATE POLICY "Participants can read own membership only" ON conversation_participants
  FOR SELECT
  USING (
    user_id = auth.uid()
  );

-- Allow inserting membership if adding self OR if creator of the conversation
DROP POLICY IF EXISTS "Insert membership for self or as creator" ON conversation_participants;
CREATE POLICY "Insert membership for self or as creator" ON conversation_participants
  FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = conversation_id AND c.user_id = auth.uid()
    )
  );

-- Enable RLS for conversations and add policies
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

-- Allow selecting conversations only if the user participates or is the creator
DROP POLICY IF EXISTS "Select conversations by participants" ON conversations;
CREATE POLICY "Select conversations by participants" ON conversations
  FOR SELECT
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM conversation_participants cp
      WHERE cp.conversation_id = conversations.id
        AND cp.user_id = auth.uid()
    )
  );

-- Allow inserting conversations only if user_id is the auth user
DROP POLICY IF EXISTS "Insert conversations by creator" ON conversations;
CREATE POLICY "Insert conversations by creator" ON conversations
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Allow updating/deleting conversations only by creator
DROP POLICY IF EXISTS "Update conversations by creator" ON conversations;
CREATE POLICY "Update conversations by creator" ON conversations
  FOR UPDATE
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Delete conversations by creator" ON conversations;
CREATE POLICY "Delete conversations by creator" ON conversations
  FOR DELETE
  USING (user_id = auth.uid());

-- Messages: allow selecting if user participates in the conversation
DROP POLICY IF EXISTS "Participants can read conversation messages" ON messages;
CREATE POLICY "Participants can read conversation messages" ON messages
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM conversation_participants cp
      WHERE cp.conversation_id = messages.conversation_id
        AND cp.user_id = auth.uid()
    )
  );

-- Messages: allow inserting only for self and only into conversations where the user participates
DROP POLICY IF EXISTS "Participants can insert own messages" ON messages;
CREATE POLICY "Participants can insert own messages" ON messages
  FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM conversation_participants cp
      WHERE cp.conversation_id = messages.conversation_id
        AND cp.user_id = auth.uid()
    )
  );

-- Messages: allow updating/deleting only by message author
DROP POLICY IF EXISTS "Authors can update own messages" ON messages;
CREATE POLICY "Authors can update own messages" ON messages
  FOR UPDATE
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Authors can delete own messages" ON messages;
CREATE POLICY "Authors can delete own messages" ON messages
  FOR DELETE
  USING (user_id = auth.uid());

-- Migration 005: Create trigger to update conversation timestamp on new message
CREATE OR REPLACE FUNCTION update_conversation_timestamp_on_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE conversations SET updated_at = NOW() WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_messages_after_insert_update_conversation ON messages;
CREATE TRIGGER trg_messages_after_insert_update_conversation
AFTER INSERT ON messages
FOR EACH ROW
EXECUTE FUNCTION update_conversation_timestamp_on_message();
