-- ============================================================
-- Apple App Review — Demo Account Seed Script
-- Run this in your Supabase SQL Editor
--
-- Demo credentials to enter in App Store Connect:
--   Email:    reviewer@areyoutheone.app
--   Password: Review2026!
-- ============================================================

-- NOTE: Auth users must be created via Supabase Auth API or Dashboard.
-- 1. Go to Supabase Dashboard → Authentication → Users → Add User
--    Email: reviewer@areyoutheone.app | Password: Review2026!
--    Copy the resulting UUID into REVIEWER_ID below.
--
-- 2. Create a match partner (so reviewer sees matches & chats):
--    Email: demo.match@areyoutheone.app | Password: Review2026!
--    Copy the resulting UUID into PARTNER_ID below.
--
-- 3. Replace the placeholders below and run the script.

DO $$
DECLARE
  REVIEWER_ID  uuid := 'REPLACE_WITH_REVIEWER_AUTH_UUID';
  PARTNER_ID   uuid := 'REPLACE_WITH_PARTNER_AUTH_UUID';
  MATCH_ID     uuid := gen_random_uuid();
  CONV_ID      uuid := gen_random_uuid();
BEGIN

  -- ── Reviewer profile ──────────────────────────────────────
  INSERT INTO profiles (
    id, first_name, last_name, gender, birthdate, city,
    occupation, bio, height, primary_photo, is_verified,
    onboarding_completed, photos, interests
  ) VALUES (
    REVIEWER_ID,
    'Alex', 'Demo',
    'male',
    '1995-06-15',
    'New York',
    'Software Engineer',
    'Love hiking, great coffee, and meeting interesting people. Here to find something real.',
    180,
    'https://i.pravatar.cc/400?img=11',
    true,
    true,
    ARRAY[
      'https://i.pravatar.cc/400?img=11',
      'https://i.pravatar.cc/400?img=12',
      'https://i.pravatar.cc/400?img=13'
    ],
    ARRAY['Hiking', 'Coffee', 'Travel', 'Music', 'Cooking']
  )
  ON CONFLICT (id) DO UPDATE SET
    onboarding_completed = true,
    is_verified = true;

  -- ── Match partner profile ─────────────────────────────────
  INSERT INTO profiles (
    id, first_name, last_name, gender, birthdate, city,
    occupation, bio, height, primary_photo, is_verified,
    onboarding_completed, photos, interests
  ) VALUES (
    PARTNER_ID,
    'Jordan', 'Lee',
    'female',
    '1997-03-22',
    'New York',
    'Graphic Designer',
    'Creative soul, dog mom, and brunch enthusiast. Looking for someone genuine.',
    165,
    'https://i.pravatar.cc/400?img=47',
    true,
    true,
    ARRAY[
      'https://i.pravatar.cc/400?img=47',
      'https://i.pravatar.cc/400?img=48',
      'https://i.pravatar.cc/400?img=49'
    ],
    ARRAY['Art', 'Dogs', 'Brunch', 'Yoga', 'Travel']
  )
  ON CONFLICT (id) DO UPDATE SET
    onboarding_completed = true,
    is_verified = true;

  -- ── Create a mutual match ─────────────────────────────────
  INSERT INTO matches (
    id, user1_id, user2_id,
    stage, is_active,
    user1_text_unlocked, user2_text_unlocked,
    user1_voice_unlocked, user2_voice_unlocked,
    user1_video_unlocked, user2_video_unlocked,
    created_at
  ) VALUES (
    MATCH_ID,
    REVIEWER_ID, PARTNER_ID,
    'video',
    true,
    true, true,
    true, true,
    true, true,
    now() - interval '2 days'
  )
  ON CONFLICT DO NOTHING;

  -- ── Create conversation ───────────────────────────────────
  INSERT INTO conversations (id, match_id, created_at)
  VALUES (CONV_ID, MATCH_ID, now() - interval '2 days')
  ON CONFLICT DO NOTHING;

  -- ── Seed chat messages ────────────────────────────────────
  INSERT INTO messages (id, conversation_id, sender_id, content, type, created_at) VALUES
    (gen_random_uuid(), CONV_ID, PARTNER_ID, 'Hey! I loved your profile 😊', 'text', now() - interval '2 days'),
    (gen_random_uuid(), CONV_ID, REVIEWER_ID, 'Thanks! Your photos are amazing. How long have you been in New York?', 'text', now() - interval '47 hours'),
    (gen_random_uuid(), CONV_ID, PARTNER_ID, 'About 3 years now! Do you have any favorite spots?', 'text', now() - interval '46 hours'),
    (gen_random_uuid(), CONV_ID, REVIEWER_ID, 'Definitely Central Park and the High Line. We should check them out sometime!', 'text', now() - interval '45 hours'),
    (gen_random_uuid(), CONV_ID, PARTNER_ID, 'That sounds perfect 😊 I''d love that!', 'text', now() - interval '44 hours'),
    (gen_random_uuid(), CONV_ID, REVIEWER_ID, 'It''s a plan then! Let me know when you''re free this weekend.', 'text', now() - interval '1 hour')
  ON CONFLICT DO NOTHING;

  -- ── Seed credits balance ──────────────────────────────────
  INSERT INTO user_credits (user_id, balance, updated_at)
  VALUES (REVIEWER_ID, 25, now())
  ON CONFLICT (user_id) DO UPDATE SET balance = 25;

  -- ── Seed user settings ────────────────────────────────────
  INSERT INTO user_settings (
    user_id,
    notifications_new_matches,
    notifications_messages,
    notifications_roses,
    privacy_show_online,
    privacy_show_distance,
    discovery_show_me
  ) VALUES (
    REVIEWER_ID, true, true, true, true, true, true
  )
  ON CONFLICT (user_id) DO NOTHING;

  RAISE NOTICE 'Demo account seed complete. Match ID: %', MATCH_ID;
END $$;
