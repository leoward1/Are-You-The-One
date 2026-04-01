-- ==========================================
-- SECURE PRODUCTION DEPLOYMENT RLS POLICIES
-- ==========================================
-- This script locks down all tables to prevent public unauthenticated access
-- and enforces strict row-ownership verification for all data operations.

DO $$ 
DECLARE
  table_name record;
BEGIN
  -- 1. Enable RLS forcefully on ALL tables in the public schema
  FOR table_name IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') 
  LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', table_name.tablename);
  END LOOP;
END $$;

-- ==========================================
-- PROFILES 
-- ==========================================
-- DROP existing broad policies
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can delete own profile" ON profiles;

-- CREATE strict policies
CREATE POLICY "Authenticated users can view verified profiles" 
  ON profiles FOR SELECT TO authenticated 
  USING (is_verified = true OR id = auth.uid());

CREATE POLICY "Users can insert own profile" 
  ON profiles FOR INSERT TO authenticated 
  WITH CHECK (id = auth.uid());

CREATE POLICY "Users can update own profile" 
  ON profiles FOR UPDATE TO authenticated 
  USING (id = auth.uid()) 
  WITH CHECK (id = auth.uid());

CREATE POLICY "Users can delete own profile" 
  ON profiles FOR DELETE TO authenticated 
  USING (id = auth.uid());

-- ==========================================
-- USER_CREDITS 
-- ==========================================
DROP POLICY IF EXISTS "Users can view their own credits" ON user_credits;

CREATE POLICY "Users can view own credits" 
  ON user_credits FOR SELECT TO authenticated 
  USING (user_id = auth.uid());

-- Only the server/service role or strict app logic can insert/update credits.
-- (Removed UPDATE/INSERT policies for standard authenticated roles to prevent balance spoofing)
CREATE POLICY "Users cannot mutate credits directly"
  ON user_credits FOR UPDATE TO authenticated USING (false);
CREATE POLICY "Users cannot insert credits directly"
  ON user_credits FOR INSERT TO authenticated USING (false);

-- ==========================================
-- MATCHES & CALL SESSIONS
-- ==========================================
-- Ensure users can only query matches and calls they are explicitly involved in
CREATE POLICY "Users can view their matches"
  ON matches FOR SELECT TO authenticated
  USING (user_a_id = auth.uid() OR user_b_id = auth.uid());

CREATE POLICY "Users can manage their matches"
  ON matches FOR UPDATE TO authenticated
  USING (user_a_id = auth.uid() OR user_b_id = auth.uid())
  WITH CHECK (user_a_id = auth.uid() OR user_b_id = auth.uid());

CREATE POLICY "Users can view their call sessions"
  ON call_sessions FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM matches 
      WHERE matches.id = call_sessions.match_id 
      AND (matches.user_a_id = auth.uid() OR matches.user_b_id = auth.uid())
    )
  );

-- ==========================================
-- PROTECT STORAGE (PHOTOS)
-- ==========================================
-- Enforce that unauthenticated users cannot access bucket files
-- and authenticated users can only upload/delete in their designated folder
CREATE POLICY "Users can manage bucket photos in their folder"
  ON storage.objects FOR ALL TO authenticated
  USING (bucket_id = 'photos' AND auth.uid()::text = (storage.foldername(name))[1])
  WITH CHECK (bucket_id = 'photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Anyone can view bucket photos"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'photos');
