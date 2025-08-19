-- 005_update_conversation_updated_at_on_new_message.sql
-- Update conversations.updated_at when a new message is inserted

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
