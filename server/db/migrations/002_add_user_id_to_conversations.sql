-- Add user_id column to conversations table
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- Create index for user_id
CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id);

-- Update existing conversations to have a default user_id (optional, for testing)
-- UPDATE conversations SET user_id = '00000000-0000-0000-0000-000000000000' WHERE user_id IS NULL;
