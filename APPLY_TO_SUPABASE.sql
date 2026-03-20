-- ============================================================
-- COMPLETE DATABASE FIX - Run this in Supabase SQL Editor
-- Fixes: RLS Policies + Signup Trigger (column names corrected)
-- The app uses: user_a_id / user_b_id / from_user_id / sender_id
-- ============================================================

- ── 0. SCHEMA UPDATES ──────────────────────────────────────────
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_onboarded BOOLEAN DEFAULT FALSE;

-- ── 1. SIGNUP TRIGGER ────────────────────────────────────────
-- Auto-creates a profile row when a new user signs up

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    meta_first_name TEXT;
    meta_last_name  TEXT;
    meta_gender     TEXT;
    meta_birthdate  DATE;
    meta_city       TEXT;
BEGIN
    meta_first_name := COALESCE(NEW.raw_user_meta_data->>'first_name', '');
    meta_last_name  := COALESCE(NEW.raw_user_meta_data->>'last_name', '');
    meta_gender     := NEW.raw_user_meta_data->>'gender';
    meta_city       := COALESCE(NEW.raw_user_meta_data->>'city', '');

    BEGIN
        meta_birthdate := (NEW.raw_user_meta_data->>'birthdate')::DATE;
    EXCEPTION WHEN OTHERS THEN
        meta_birthdate := NULL;
    END;

    INSERT INTO public.profiles (
        id, email, first_name, last_name, gender, birthdate, city,
        created_at, updated_at
    )
    VALUES (
        NEW.id, NEW.email, meta_first_name, meta_last_name,
        meta_gender, meta_birthdate, meta_city, NOW(), NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
        email      = EXCLUDED.email,
        updated_at = NOW();

    INSERT INTO public.user_settings (user_id)
    VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;

    INSERT INTO public.user_preferences (user_id)
    VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();


-- ── 2. DROP OLD POLICIES (clean slate) ───────────────────────

DROP POLICY IF EXISTS "Profiles are viewable by authenticated users" ON profiles;
DROP POLICY IF EXISTS "Users can view all profiles"                  ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile"                 ON profiles;
DROP POLICY IF EXISTS "Users can update own profile"                 ON profiles;
DROP POLICY IF EXISTS "Photos viewable by everyone"                  ON photos;
DROP POLICY IF EXISTS "Users can view verified user photos"          ON photos;
DROP POLICY IF EXISTS "Users can insert own photos"                  ON photos;
DROP POLICY IF EXISTS "Users can update own photos"                  ON photos;
DROP POLICY IF EXISTS "Users can delete own photos"                  ON photos;
DROP POLICY IF EXISTS "Users can view likes involving them"          ON likes;
DROP POLICY IF EXISTS "Users can send likes"                         ON likes;
DROP POLICY IF EXISTS "Users can view own matches"                   ON matches;
DROP POLICY IF EXISTS "Users can create matches"                     ON matches;
DROP POLICY IF EXISTS "Users can update own matches"                 ON matches;
DROP POLICY IF EXISTS "Users can view messages in their matches"     ON messages;
DROP POLICY IF EXISTS "Users can send messages"                      ON messages;
DROP POLICY IF EXISTS "Users can update own messages"                ON messages;
DROP POLICY IF EXISTS "Users can mark messages as read"              ON messages;
DROP POLICY IF EXISTS "Users can view their call sessions"           ON call_sessions;
DROP POLICY IF EXISTS "Users can insert call sessions"               ON call_sessions;
DROP POLICY IF EXISTS "Users can update call sessions"               ON call_sessions;
DROP POLICY IF EXISTS "Users can view own checkins"                  ON safety_checkins;
DROP POLICY IF EXISTS "Users can create own checkins"                ON safety_checkins;
DROP POLICY IF EXISTS "Users can update own checkins"                ON safety_checkins;
DROP POLICY IF EXISTS "Date suggestions are public"                  ON date_suggestions;
DROP POLICY IF EXISTS "Users can view approved reviews"              ON reviews;
DROP POLICY IF EXISTS "Users can create reviews"                     ON reviews;
DROP POLICY IF EXISTS "Users can view own subscription"              ON subscriptions;
DROP POLICY IF EXISTS "Users can update own subscription"            ON subscriptions;
DROP POLICY IF EXISTS "Users can insert own subscription"            ON subscriptions;
DROP POLICY IF EXISTS "Users can view own settings"                  ON user_settings;
DROP POLICY IF EXISTS "Users can update own settings"                ON user_settings;
DROP POLICY IF EXISTS "Users can insert own settings"                ON user_settings;
DROP POLICY IF EXISTS "Users can view own preferences"               ON user_preferences;
DROP POLICY IF EXISTS "Users can update own preferences"             ON user_preferences;
DROP POLICY IF EXISTS "Users can insert own preferences"             ON user_preferences;


-- ── 3. CREATE CORRECTED RLS POLICIES ─────────────────────────
-- NOTE: matches uses user_a_id / user_b_id (matches the app services)
-- NOTE: messages uses from_user_id   (matches the app services)

-- profiles
CREATE POLICY "Users can view all profiles"
  ON profiles FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- photos
CREATE POLICY "Users can view verified user photos"
  ON photos FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Users can insert own photos"
  ON photos FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own photos"
  ON photos FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own photos"
  ON photos FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- likes
CREATE POLICY "Users can view likes involving them"
  ON likes FOR SELECT TO authenticated
  USING (auth.uid() = from_user_id OR auth.uid() = to_user_id);

CREATE POLICY "Users can send likes"
  ON likes FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = from_user_id);

-- matches  (uses user_a_id / user_b_id)
CREATE POLICY "Users can view own matches"
  ON matches FOR SELECT TO authenticated
  USING (auth.uid() = user_a_id OR auth.uid() = user_b_id);

CREATE POLICY "Users can create matches"
  ON matches FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_a_id OR auth.uid() = user_b_id);

CREATE POLICY "Users can update own matches"
  ON matches FOR UPDATE TO authenticated
  USING (auth.uid() = user_a_id OR auth.uid() = user_b_id)
  WITH CHECK (auth.uid() = user_a_id OR auth.uid() = user_b_id);

-- messages  (uses from_user_id)
CREATE POLICY "Users can view messages in their matches"
  ON messages FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM matches
      WHERE matches.id = messages.match_id
        AND (matches.user_a_id = auth.uid() OR matches.user_b_id = auth.uid())
    )
  );

CREATE POLICY "Users can send messages"
  ON messages FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = from_user_id
    AND EXISTS (
      SELECT 1 FROM matches
      WHERE matches.id = match_id
        AND (matches.user_a_id = auth.uid() OR matches.user_b_id = auth.uid())
    )
  );

CREATE POLICY "Users can update own messages"
  ON messages FOR UPDATE TO authenticated
  USING (auth.uid() = from_user_id)
  WITH CHECK (auth.uid() = from_user_id);

-- call_sessions
CREATE POLICY "Users can view their call sessions"
  ON call_sessions FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM matches
      WHERE matches.id = call_sessions.match_id
        AND (matches.user_a_id = auth.uid() OR matches.user_b_id = auth.uid())
    )
  );

CREATE POLICY "Users can insert call sessions"
  ON call_sessions FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM matches
      WHERE matches.id = match_id
        AND (matches.user_a_id = auth.uid() OR matches.user_b_id = auth.uid())
    )
  );

CREATE POLICY "Users can update call sessions"
  ON call_sessions FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM matches
      WHERE matches.id = call_sessions.match_id
        AND (matches.user_a_id = auth.uid() OR matches.user_b_id = auth.uid())
    )
  );

-- safety_checkins
CREATE POLICY "Users can view own checkins"
  ON safety_checkins FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own checkins"
  ON safety_checkins FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own checkins"
  ON safety_checkins FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- date_suggestions (public read)
CREATE POLICY "Date suggestions are public"
  ON date_suggestions FOR SELECT TO authenticated
  USING (true);

-- reviews
CREATE POLICY "Users can view approved reviews"
  ON reviews FOR SELECT TO authenticated
  USING (approved = true OR auth.uid() = from_user_id);

CREATE POLICY "Users can create reviews"
  ON reviews FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = from_user_id);

-- subscriptions
CREATE POLICY "Users can view own subscription"
  ON subscriptions FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own subscription"
  ON subscriptions FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscription"
  ON subscriptions FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- user_settings
CREATE POLICY "Users can view own settings"
  ON user_settings FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own settings"
  ON user_settings FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can insert own settings"
  ON user_settings FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- user_preferences
CREATE POLICY "Users can view own preferences"
  ON user_preferences FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences"
  ON user_preferences FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences"
  ON user_preferences FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
