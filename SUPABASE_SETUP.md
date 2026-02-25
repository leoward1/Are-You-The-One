# Supabase Setup Guide

## 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign in or create an account
3. Click "New Project"
4. Fill in project details:
   - Name: Are You The One
   - Database Password: (choose a strong password)
   - Region: (choose closest to your users)

## 2. Get Your Credentials

After project creation:

1. Go to **Project Settings** → **API**
2. Copy:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon/public key** (this is safe to use in your app)

## 3. Configure Your App

### Option A: Using app.json (Current Setup)

Update `app.json`:
```json
"extra": {
  "supabaseUrl": "YOUR_SUPABASE_URL",
  "supabaseAnonKey": "YOUR_SUPABASE_ANON_KEY"
}
```

### Option B: Using Environment Variables (Recommended for Production)

1. Create `.env` file (copy from `.env.example`)
2. Add your credentials:
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 4. Database Schema

### Step A — Run this SQL in Supabase SQL Editor (tables + indexes):

```sql
-- ============================================================
-- ARE YOU THE ONE? — Full Database Schema
-- ============================================================

-- 0. Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 1. PROFILES  (one row per auth.users row)
-- ============================================================
CREATE TABLE profiles (
  id             UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email          TEXT UNIQUE NOT NULL,
  first_name     TEXT NOT NULL DEFAULT '',
  last_name      TEXT NOT NULL DEFAULT '',
  gender         TEXT CHECK (gender IN ('male','female','non-binary','other')),
  birthdate      DATE,
  age            INTEGER,
  city           TEXT DEFAULT '',
  bio            TEXT DEFAULT '',
  occupation     TEXT DEFAULT '',
  height         TEXT DEFAULT '',
  interests      TEXT[] DEFAULT '{}',
  looking_for    TEXT DEFAULT '',
  distance_miles INTEGER DEFAULT 50,
  min_age        INTEGER DEFAULT 18,
  max_age        INTEGER DEFAULT 99,
  tier           TEXT DEFAULT 'free' CHECK (tier IN ('free','plus','pro')),
  verified_photo BOOLEAN DEFAULT FALSE,
  verified_video BOOLEAN DEFAULT FALSE,
  primary_photo  TEXT,
  photo_url      TEXT,
  video_intro    TEXT,
  anim_enabled   BOOLEAN DEFAULT TRUE,
  reduce_motion  BOOLEAN DEFAULT FALSE,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 2. PHOTOS
-- ============================================================
CREATE TABLE photos (
  id         UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id    UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  url        TEXT NOT NULL,
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_photos_user ON photos(user_id);

-- ============================================================
-- 3. LIKES  (rose / kiss)
-- ============================================================
CREATE TABLE likes (
  id             UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  from_user_id   UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  to_user_id     UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  type           TEXT NOT NULL CHECK (type IN ('rose','kiss')),
  note           TEXT,
  media          TEXT,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(from_user_id, to_user_id)
);

CREATE INDEX idx_likes_to ON likes(to_user_id);

-- ============================================================
-- 4. MATCHES
-- ============================================================
CREATE TABLE matches (
  id                UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_a_id         UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  user_b_id         UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  compatibility_pct INTEGER DEFAULT 0,
  status            TEXT DEFAULT 'matched' CHECK (status IN ('matched','blocked','ended')),
  unlocked_stage    TEXT DEFAULT 'text'   CHECK (unlocked_stage IN ('text','voice','video')),
  message_count     INTEGER DEFAULT 0,
  voice_call_count  INTEGER DEFAULT 0,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_a_id, user_b_id)
);

CREATE INDEX idx_matches_a ON matches(user_a_id);
CREATE INDEX idx_matches_b ON matches(user_b_id);

-- ============================================================
-- 5. MESSAGES
-- ============================================================
CREATE TABLE messages (
  id              UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  match_id        UUID REFERENCES matches(id) ON DELETE CASCADE NOT NULL,
  from_user_id    UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  type            TEXT DEFAULT 'text' CHECK (type IN ('text','image','video','voice','date_suggestion')),
  content         TEXT,
  media           TEXT,
  date_suggestion JSONB,
  read            BOOLEAN DEFAULT FALSE,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_messages_match ON messages(match_id, created_at DESC);

-- ============================================================
-- 6. CALL SESSIONS
-- ============================================================
CREATE TABLE call_sessions (
  id               UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  match_id         UUID REFERENCES matches(id) ON DELETE CASCADE NOT NULL,
  kind             TEXT NOT NULL CHECK (kind IN ('voice','video')),
  started_at       TIMESTAMPTZ DEFAULT NOW(),
  ended_at         TIMESTAMPTZ,
  duration_seconds INTEGER DEFAULT 0,
  status           TEXT DEFAULT 'active' CHECK (status IN ('active','completed','failed'))
);

-- ============================================================
-- 7. SAFETY CHECK-INS
-- ============================================================
CREATE TABLE safety_checkins (
  id                      UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id                 UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  meeting_with            UUID REFERENCES profiles(id) ON DELETE SET NULL,
  meeting_with_name       TEXT,
  start_time              TIMESTAMPTZ NOT NULL,
  expected_end            TIMESTAMPTZ NOT NULL,
  live_lat                DOUBLE PRECISION,
  live_lng                DOUBLE PRECISION,
  status                  TEXT DEFAULT 'active' CHECK (status IN ('active','completed','escalated')),
  auto_alert_minutes      INTEGER DEFAULT 15,
  emergency_contact_email TEXT,
  emergency_contact_phone TEXT,
  sos_triggered_at        TIMESTAMPTZ,
  completed_at            TIMESTAMPTZ,
  created_at              TIMESTAMPTZ DEFAULT NOW(),
  updated_at              TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 8. DATE SUGGESTIONS
-- ============================================================
CREATE TABLE date_suggestions (
  id              UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  city            TEXT NOT NULL,
  category        TEXT DEFAULT 'all' CHECK (category IN ('coffee','museum','park','dinner','all')),
  name            TEXT NOT NULL,
  address         TEXT NOT NULL,
  avg_cost        TEXT,
  safety_rating   INTEGER,
  google_maps_url TEXT,
  image_url       TEXT,
  description     TEXT
);

-- ============================================================
-- 9. REVIEWS
-- ============================================================
CREATE TABLE reviews (
  id             UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  from_user_id   UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  about_match_id UUID REFERENCES matches(id) ON DELETE CASCADE NOT NULL,
  rating         INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  headline       TEXT NOT NULL,
  body           TEXT NOT NULL,
  approved       BOOLEAN DEFAULT FALSE,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 10. SUBSCRIPTIONS
-- ============================================================
CREATE TABLE subscriptions (
  id                    UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id               UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  plan_id               TEXT NOT NULL,
  tier                  TEXT DEFAULT 'free' CHECK (tier IN ('free','plus','pro')),
  status                TEXT DEFAULT 'active' CHECK (status IN ('active','canceled','past_due','expired')),
  current_period_start  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  current_period_end    TIMESTAMPTZ NOT NULL DEFAULT NOW() + INTERVAL '1 month',
  cancel_at_period_end  BOOLEAN DEFAULT FALSE,
  created_at            TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 11. USER SETTINGS
-- ============================================================
CREATE TABLE user_settings (
  user_id                UUID REFERENCES profiles(id) ON DELETE CASCADE PRIMARY KEY,
  notifications_enabled  BOOLEAN DEFAULT TRUE,
  push_matches           BOOLEAN DEFAULT TRUE,
  push_messages          BOOLEAN DEFAULT TRUE,
  push_safety            BOOLEAN DEFAULT TRUE,
  email_notifications    BOOLEAN DEFAULT TRUE,
  anim_enabled           BOOLEAN DEFAULT TRUE,
  reduce_motion          BOOLEAN DEFAULT FALSE,
  sound_enabled          BOOLEAN DEFAULT TRUE
);

-- ============================================================
-- 12. USER PREFERENCES
-- ============================================================
CREATE TABLE user_preferences (
  user_id        UUID REFERENCES profiles(id) ON DELETE CASCADE PRIMARY KEY,
  min_age        INTEGER DEFAULT 18,
  max_age        INTEGER DEFAULT 99,
  distance_miles INTEGER DEFAULT 50,
  looking_for    TEXT DEFAULT '',
  show_me        TEXT[] DEFAULT '{male,female}'
);

-- ============================================================
-- HELPER: auto-set updated_at on row change
-- ============================================================
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_profiles_updated  BEFORE UPDATE ON profiles        FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_matches_updated   BEFORE UPDATE ON matches         FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_checkins_updated  BEFORE UPDATE ON safety_checkins FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================
-- HELPER: auto-create profile row after sign-up
-- ============================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email)
  VALUES (NEW.id, NEW.email);

  INSERT INTO user_settings (user_id) VALUES (NEW.id);
  INSERT INTO user_preferences (user_id) VALUES (NEW.id);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

### Step B — Run this SQL next (Row Level Security policies):

```sql
-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

-- Enable RLS on every table
ALTER TABLE profiles         ENABLE ROW LEVEL SECURITY;
ALTER TABLE photos           ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes            ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches          ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages         ENABLE ROW LEVEL SECURITY;
ALTER TABLE call_sessions    ENABLE ROW LEVEL SECURITY;
ALTER TABLE safety_checkins  ENABLE ROW LEVEL SECURITY;
ALTER TABLE date_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews          ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions    ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings    ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- ── profiles ────────────────────────────────────────────────
CREATE POLICY "Profiles are viewable by authenticated users"
  ON profiles FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id);

-- ── photos ──────────────────────────────────────────────────
CREATE POLICY "Photos viewable by everyone"
  ON photos FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can insert own photos"
  ON photos FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own photos"
  ON photos FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own photos"
  ON photos FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- ── likes ───────────────────────────────────────────────────
CREATE POLICY "Users can view likes involving them"
  ON likes FOR SELECT TO authenticated
  USING (auth.uid() = from_user_id OR auth.uid() = to_user_id);

CREATE POLICY "Users can send likes"
  ON likes FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = from_user_id);

-- ── matches ─────────────────────────────────────────────────
CREATE POLICY "Users can view own matches"
  ON matches FOR SELECT TO authenticated
  USING (auth.uid() = user_a_id OR auth.uid() = user_b_id);

CREATE POLICY "Users can create matches"
  ON matches FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_a_id);

CREATE POLICY "Users can update own matches"
  ON matches FOR UPDATE TO authenticated
  USING (auth.uid() = user_a_id OR auth.uid() = user_b_id);

-- ── messages ────────────────────────────────────────────────
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
  WITH CHECK (auth.uid() = from_user_id);

CREATE POLICY "Users can mark messages as read"
  ON messages FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM matches
      WHERE matches.id = messages.match_id
        AND (matches.user_a_id = auth.uid() OR matches.user_b_id = auth.uid())
    )
  );

-- ── call_sessions ───────────────────────────────────────────
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
      WHERE matches.id = call_sessions.match_id
        AND (matches.user_a_id = auth.uid() OR matches.user_b_id = auth.uid())
    )
  );

-- ── safety_checkins ─────────────────────────────────────────
CREATE POLICY "Users can view own checkins"
  ON safety_checkins FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own checkins"
  ON safety_checkins FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own checkins"
  ON safety_checkins FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

-- ── date_suggestions (read-only for everyone) ───────────────
CREATE POLICY "Date suggestions are public"
  ON date_suggestions FOR SELECT TO authenticated USING (true);

-- ── reviews ─────────────────────────────────────────────────
CREATE POLICY "Users can view approved reviews"
  ON reviews FOR SELECT TO authenticated
  USING (approved = true OR auth.uid() = from_user_id);

CREATE POLICY "Users can create reviews"
  ON reviews FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = from_user_id);

-- ── subscriptions ───────────────────────────────────────────
CREATE POLICY "Users can view own subscription"
  ON subscriptions FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- ── user_settings ───────────────────────────────────────────
CREATE POLICY "Users can view own settings"
  ON user_settings FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own settings"
  ON user_settings FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

-- ── user_preferences ────────────────────────────────────────
CREATE POLICY "Users can view own preferences"
  ON user_preferences FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences"
  ON user_preferences FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);
```

### Step C — Enable Realtime (optional but recommended for chat):

```sql
-- Enable realtime on messages and matches tables
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE matches;
```

## 5. Storage Buckets

### Step D — Create the `photos` bucket:

1. Go to **Storage** in Supabase Dashboard
2. Click **"New bucket"**
3. Name: `photos`
4. Toggle **"Public bucket"** ON
5. Click **"Create bucket"**

### Step E — Run this SQL for storage policies:

```sql
-- Allow authenticated users to upload photos
CREATE POLICY "Users can upload photos"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'photos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow public read access to photos
CREATE POLICY "Photos are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'photos');

-- Allow users to update their own photos
CREATE POLICY "Users can update own photos"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'photos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to delete their own photos
CREATE POLICY "Users can delete own photos"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'photos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
```

## 6. Test Connection

Run your app and check the console for any Supabase connection warnings.

## 7. Migration from Current Backend

The `supabaseService` is ready to use. You can gradually migrate from your current API to Supabase:

1. Start with authentication
2. Move user profiles
3. Migrate matches and messages
4. Update photo storage

## Usage Examples

```typescript
import { supabaseService } from './src/services/supabase.service';

// Sign up
await supabaseService.signUp({
  email: 'user@example.com',
  password: 'password123',
  name: 'John Doe',
  age: 25,
  gender: 'male',
  city: 'New York'
});

// Sign in
await supabaseService.signIn({
  email: 'user@example.com',
  password: 'password123'
});

// Get user profile
const profile = await supabaseService.getUserProfile(userId);

// Upload photo
const url = await supabaseService.uploadPhoto(userId, photoBlob, 'profile.jpg');
```
