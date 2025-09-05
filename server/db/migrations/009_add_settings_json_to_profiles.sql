-- Migration: add settings JSONB to profiles for user preferences
-- Safe to re-run
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS settings jsonb NOT NULL DEFAULT '{}'::jsonb;

COMMENT ON COLUMN profiles.settings IS 'Arbitrary user preferences, e.g. {"workspaces": {"<chatId>": {...}} }';
