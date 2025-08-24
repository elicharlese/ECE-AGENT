-- 004_profiles_participants_rls.sql
-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger to update updated_at on profiles (reuses update_updated_at_column if present)
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

DROP POLICY IF EXISTS "Users can delete their own profile" ON profiles;
CREATE POLICY "Users can delete their own profile" ON profiles
  FOR DELETE
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

-- Allow selecting membership rows if the user participates in that conversation
DROP POLICY IF EXISTS "Participants can read membership of their conversations" ON conversation_participants;
CREATE POLICY "Participants can read membership of their conversations" ON conversation_participants
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM conversation_participants cp2
      WHERE cp2.conversation_id = conversation_participants.conversation_id
        AND cp2.user_id = auth.uid()
    )
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

-- Allow updating/deleting membership by self or conversation creator
DROP POLICY IF EXISTS "Update membership by self or creator" ON conversation_participants;
CREATE POLICY "Update membership by self or creator" ON conversation_participants
  FOR UPDATE
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = conversation_id AND c.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Delete membership by creator" ON conversation_participants;
CREATE POLICY "Delete membership by creator" ON conversation_participants
  FOR DELETE
  USING (
    EXISTS (
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

-- Adjust messages policies to allow participants to read the entire conversation
-- Remove old policies if they exist
DROP POLICY IF EXISTS "Users can view their own messages" ON messages;
DROP POLICY IF EXISTS "Users can insert their own messages" ON messages;
DROP POLICY IF EXISTS "Users can update their own messages" ON messages;
DROP POLICY IF EXISTS "Users can delete their own messages" ON messages;

-- Messages: allow selecting if user participates in the conversation
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
CREATE POLICY "Authors can update own messages" ON messages
  FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Authors can delete own messages" ON messages
  FOR DELETE
  USING (user_id = auth.uid());
