-- ============================================================
-- ADD LAST SEEN COLUMN - Run this in Supabase SQL Editor
-- This allows the app to track and show real user presence.
-- ============================================================

-- 1. Add last_seen_at column to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_seen_at TIMESTAMPTZ DEFAULT NOW();

-- 2. Create index for performance
CREATE INDEX IF NOT EXISTS idx_profiles_last_seen_at ON profiles(last_seen_at);

-- 3. Update RLS (Policies should already allow viewing profiles, but let's be explicit)
DROP POLICY IF EXISTS "Users can view all profiles" ON profiles;
CREATE POLICY "Users can view all profiles"
  ON profiles FOR SELECT TO authenticated
  USING (true);
