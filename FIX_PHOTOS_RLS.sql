-- ============================================================
-- FIX PHOTOS RLS - Run this in Supabase SQL Editor
-- This ensures that users can view photos of everyone.
-- ============================================================

-- First, ensure RLS is enabled on the photos table
ALTER TABLE public.photos ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies that might be conflicting or incorrect
DROP POLICY IF EXISTS "Photos viewable by everyone" ON photos;
DROP POLICY IF EXISTS "Users can view verified user photos"  ON photos;
DROP POLICY IF EXISTS "Users can insert own photos" ON photos;
DROP POLICY IF EXISTS "Users can update own photos" ON photos;
DROP POLICY IF EXISTS "Users can delete own photos" ON photos;

-- Policy: Anyone authenticated can view all photos
CREATE POLICY "Users can view verified user photos"
  ON photos FOR SELECT TO authenticated
  USING (true);

-- Policy: Users can only upload photos for their own user_id
CREATE POLICY "Users can insert own photos"
  ON photos FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can only update their own photos
CREATE POLICY "Users can update own photos"
  ON photos FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can only delete their own photos
CREATE POLICY "Users can delete own photos"
  ON photos FOR DELETE TO authenticated
  USING (auth.uid() = user_id);
