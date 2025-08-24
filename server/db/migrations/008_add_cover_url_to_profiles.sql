-- 008_add_cover_url_to_profiles.sql
-- Adds a nullable cover_url column to profiles for profile banner images

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS cover_url TEXT;

-- Ensure a public storage bucket named 'profiles' exists for avatar/cover uploads
DO $$
BEGIN
  PERFORM storage.create_bucket('profiles', public => true);
EXCEPTION WHEN OTHERS THEN
  -- ignore if it already exists
  NULL;
END $$;
