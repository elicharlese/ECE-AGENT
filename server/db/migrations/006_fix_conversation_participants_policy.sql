-- 006_fix_conversation_participants_policy.sql
-- Fix infinite recursion in conversation_participants policy

-- Drop the problematic policy
DROP POLICY IF EXISTS "Participants can read membership of their conversations" ON conversation_participants;

-- Re-create a non-recursive SELECT policy: users can read only their own rows
CREATE POLICY "Participants can read own membership only" ON conversation_participants
  FOR SELECT
  USING (
    user_id = auth.uid()
  );
