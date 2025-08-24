-- 009_allow_participant_leave.sql
-- Allow participants to delete their own membership (leave conversation)

-- Replace the previous delete policy to permit either the conversation creator
-- or the participant themself to delete the membership row.
DROP POLICY IF EXISTS "Delete membership by self or creator" ON conversation_participants;
DROP POLICY IF EXISTS "Delete membership by creator" ON conversation_participants;

CREATE POLICY "Delete membership by self or creator" ON conversation_participants
  FOR DELETE
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = conversation_id AND c.user_id = auth.uid()
    )
  );
