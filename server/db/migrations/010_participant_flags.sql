-- 010_participant_flags.sql
-- Adds per-user flags for pinned and archived conversations.

ALTER TABLE conversation_participants
  ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS is_archived BOOLEAN NOT NULL DEFAULT FALSE;

-- Helpful indexes for common queries
CREATE INDEX IF NOT EXISTS idx_cp_user_pinned
  ON conversation_participants(user_id, is_pinned);

CREATE INDEX IF NOT EXISTS idx_cp_user_archived
  ON conversation_participants(user_id, is_archived);
