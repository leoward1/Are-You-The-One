-- ============================================================
-- ADD MISSING COLUMNS TO MESSAGES - Run this in Supabase SQL Editor
-- This fixes the "Could not find column game_data" error.
-- ============================================================

-- 1. Add game_data column (for Tic-Tac-Toe)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='messages' AND column_name='game_data') THEN
        ALTER TABLE public.messages ADD COLUMN game_data JSONB DEFAULT NULL;
    END IF;
END $$;

-- 2. Add media column (for Images, Voice, etc.)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='messages' AND column_name='media') THEN
        ALTER TABLE public.messages ADD COLUMN media TEXT DEFAULT NULL;
    END IF;
END $$;

-- 3. Add from_user_id column if it somehow was named incorrectly
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='messages' AND column_name='from_user_id') THEN
        -- If it exists as 'sender_id', rename it to match the app code
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='messages' AND column_name='sender_id') THEN
            ALTER TABLE public.messages RENAME COLUMN sender_id TO from_user_id;
        ELSE
            ALTER TABLE public.messages ADD COLUMN from_user_id UUID REFERENCES auth.users(id);
        END IF;
    END IF;
END $$;

-- 4. Reload schema cache
NOTIFY pgrst, 'reload schema';
