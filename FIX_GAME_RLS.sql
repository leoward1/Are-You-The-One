-- ============================================================
-- FIX GAME UPDATES - Run this in Supabase SQL Editor
-- This allows BOTH players in a match to update 'game' messages.
-- ============================================================

-- 1. Drop the restrictive update policy
DROP POLICY IF EXISTS "Users can update own messages" ON messages;

-- 2. Create a new policy that allows updates if:
--    a) You are the sender (for general message editing/deleting)
--    OR
--    b) You are part of the match AND the message type is 'game' (for game updates)
CREATE POLICY "Users can update messages in their matches"
  ON messages FOR UPDATE TO authenticated
  USING (
    auth.uid() = from_user_id 
    OR 
    (
      type = 'game' 
      AND EXISTS (
        SELECT 1 FROM matches 
        WHERE matches.id = messages.match_id 
        AND (matches.user_a_id = auth.uid() OR matches.user_b_id = auth.uid())
      )
    )
  )
  WITH CHECK (
    auth.uid() = from_user_id 
    OR 
    (
      type = 'game' 
      AND EXISTS (
        SELECT 1 FROM matches 
        WHERE matches.id = messages.match_id 
        AND (matches.user_a_id = auth.uid() OR matches.user_b_id = auth.uid())
      )
    )
  );
