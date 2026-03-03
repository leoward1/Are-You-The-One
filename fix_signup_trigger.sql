-- ============================================================
-- FIX SIGNUP TRIGGER - Run this in Supabase SQL Editor
-- ============================================================

-- This trigger correctly handles new user signup by mapping 
-- metadata from auth.users to the profiles table.

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    meta_first_name TEXT;
    meta_last_name TEXT;
    meta_gender TEXT;
    meta_birthdate DATE;
    meta_city TEXT;
BEGIN
    -- Extract metadata from raw_user_meta_data
    meta_first_name := COALESCE(NEW.raw_user_meta_data->>'first_name', '');
    meta_last_name := COALESCE(NEW.raw_user_meta_data->>'last_name', '');
    meta_gender := NEW.raw_user_meta_data->>'gender';
    meta_city := COALESCE(NEW.raw_user_meta_data->>'city', '');
    
    -- Birthdate handling
    BEGIN
        meta_birthdate := (NEW.raw_user_meta_data->>'birthdate')::DATE;
    EXCEPTION WHEN OTHERS THEN
        meta_birthdate := NULL;
    END;

    -- Insert into profiles
    INSERT INTO public.profiles (
        id, 
        email, 
        first_name, 
        last_name, 
        gender, 
        birthdate, 
        city,
        created_at,
        updated_at
    )
    VALUES (
        NEW.id, 
        NEW.email, 
        meta_first_name, 
        meta_last_name, 
        meta_gender, 
        meta_birthdate, 
        meta_city,
        NOW(),
        NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        updated_at = NOW();

    -- Initialize settings and preferences
    INSERT INTO public.user_settings (user_id) 
    VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;

    INSERT INTO public.user_preferences (user_id) 
    VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-create trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
