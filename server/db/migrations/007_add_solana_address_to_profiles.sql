-- 007_add_solana_address_to_profiles.sql
-- Adds optional Solana address to profiles for wallet linking

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS solana_address TEXT UNIQUE;

-- Optional: basic index to speed up lookups by solana_address (unique already creates one)
-- CREATE INDEX IF NOT EXISTS idx_profiles_solana_address ON profiles(solana_address);
