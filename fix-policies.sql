-- Fix infinite recursion in conversation_participants policy
-- Run this script in Supabase SQL Editor

-- 1) Drop the recursive policy on conversation_participants
DROP POLICY IF EXISTS "Participants can read membership of their conversations" ON conversation_participants;

-- 2) Recreate a non-recursive SELECT policy: users can read only their own rows
CREATE POLICY "Participants can read own membership only" ON conversation_participants
  FOR SELECT
  USING (
    user_id = auth.uid()
  );

-- Note:
-- We intentionally leave the existing policies on `conversations` and `messages`
-- as defined in migrations (004_*). They already allow access via membership:
--   conversations: user_id = auth.uid() OR EXISTS (SELECT 1 FROM conversation_participants ...)
--   messages: EXISTS (SELECT 1 FROM conversation_participants ...)
-- With the non-recursive policy above, these no longer trigger infinite recursion.
