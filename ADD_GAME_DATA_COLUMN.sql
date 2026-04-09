-- ============================================================
-- ADD MISSING COLUMNS TO MESSAGES - Run this in Supabase SQL Editor
-- This fixes the "Could not find column game_data" error.
-- ============================================================

-- 1. Add game_data column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='messages' AND column_name='game_data') THEN
        ALTER TABLE public.messages ADD COLUMN game_data JSONB DEFAULT NULL;
    END IF;
END $$;

-- 2. Ensure media column exists (needed for images/voice)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='messages' AND column_name='media') THEN
        ALTER TABLE public.messages ADD COLUMN media TEXT DEFAULT NULL;
    END IF;
END $$;

-- 3. Notify PostgREST to reload the schema cache (Supabase usually does this automatically, but this helps)
NOTIFY pgrst, 'reload schema';
