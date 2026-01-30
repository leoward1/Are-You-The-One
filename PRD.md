# Product Requirements Document - Dating App

## 1) Product Overview

Mobile dating app focused on safety, pacing, and playful matching. Unique twist:
- Men express interest with a 🌹 Rose (right swipe).
- Women express interest with a 💋 Kiss (right swipe).
- No hearts/check marks (differentiation).
- Progressive unlock of communication: Text → Voice → Video.
- Safety check-in + SOS alerts with live location.
- Date suggestions and reviews/success stories.

**Phase 1 target:** MVP on Bubble (web app), wrapped to native for iOS/Android via BDK Native or Natively.io.

---

## 2) Core Features (MVP)

### 2.1 Profiles
- Photo gallery (primary + additional).
- Optional video intro.
- Rich bio, interests, lifestyle tags, height, city.
- Age/distance preferences.

### 2.2 Discovery & Swiping
- Swipe deck (Tinder-style layout).
- Left swipe = ❌ pass.
- Right swipe (men) = 🌹 Rose Like.
- Right swipe (women) = 💋 Kiss Like.
- Mutual match = when both sent Rose/Kiss (either direction).

#### Animations & FX
- Lottie animations: ❌ red slash, 🌹 petals, 💋 lips, confetti on match.
- Optional sound effects; user can disable animations/sounds in settings.

### 2.3 Matching & Messaging
- Match detail with unlock stage chip: text → voice → video.
- Unlock rules (MVP):
  - Voice unlocks at: ≥10 messages or Plus/Pro tier.
  - Video unlocks at: ≥1 voice call or Pro tier.
- Chat supports: text, photo/video upload, voice note.
- Voice/video calls via WebRTC plugin (Agora/Daily/Vonage) in Phase 2 (Text first in MVP if needed).

### 2.4 Safety
- Start Check-in when meeting someone: meeting_with, expected_end, auto_alert_minutes.
- Live location updates during active check-in.
- Auto alert to user's emergency contact if not checked out by time window.
- SOS button sets status=escalated and sends immediate alerts.
- Disclaimer: app does not contact emergency services directly.

### 2.5 Date Suggestions
- Local recommendations filtered by user city and category (Coffee, Museum, Park, Dinner).
- "Directions" (Google Maps deep link) + "Share to Chat".

### 2.6 Reviews / Success Stories
- One review per match per user (rating, headline, body).
- Public list of approved reviews.

### 2.7 Monetization (Stripe)
- **Free:** 10 daily reveal limit, activity-based unlock, limited rose/kiss.
- **Plus:** 50 reveals/day, earlier voice unlock, 1 rose/kiss per day.
- **Pro:** Unlimited reveals, earlier video unlock, Boost profile.
- Upgrade CTAs at gated actions.

---

## 3) Platform & Architecture

### 3.1 Build Stack
- Front end & workflows: Bubble (responsive mobile first: 375–430px widths).
- Database: Bubble's built-in DB.
- Native wrapper: BDK Native or Natively.io (team to pick; both stable).
- Payments: Stripe subscriptions (Bubble plugin).
- Notifications: Native push via wrapper + email (SendGrid) + SMS (Twilio, optional for safety alerts).
- WebRTC (Phase 2): Daily.co / Agora / Vonage plugin (team to evaluate).

### 3.2 Data Model (Bubble Types & Key Fields)

**User:** first_name, last_name, gender, birthdate, city, bio, interests (list), looking_for, distance_miles, min_age, max_age, tier, verified_photo (yes/no), verified_video (yes/no), primary_photo (image), video_intro (file), anim_enabled (yes/no), reduce_motion (yes/no).

**Profile:** user, headline, lifestyle_tags (list), height_in, quiz_score, match_visibility_limit.

**Photo:** user, image, is_primary.

**Like:** from_user, to_user, type (rose | kiss), note, media.

**Match:** user_a, user_b, compatibility_pct, status (matched/blocked/ended), unlocked_stage (text | voice | video).

**Message:** match, from_user, type (text|image|video|voice), content, media.

**CallSession:** match, kind (voice|video), started_at, ended_at, status.

**SafetyCheckin:** user, meeting_with, start_time, expected_end, live_lat, live_lng, status (active|completed|escalated), auto_alert_minutes.

**DateSuggestion:** city, category, name, address, avg_cost, safety_rating.

**Review:** from_user, about_match, rating, headline, body, approved (yes/no).

### 3.3 Privacy/Access (Bubble Privacy Rules)
- Only participants can read their Matches/Messages/Likes/CallSessions/SafetyCheckins.
- Public: limited profile fields, no email/DOB.
- Reviews visible only if approved = yes.

---

## 4) Wrapping to Native (iOS/Android)

### Option A — BDK Native
**Why:** Most widely used Bubble wrapper; supports push notifications, camera, file picker, in-app purchase, deep links.

**Deliverables:**
- App icons & splash screens (all sizes).
- App Store/Play assets & copy.
- OneSignal (or Firebase) push setup through BDK.
- Deep link handling (open /chat/:matchId, /profile/:userId).
- Native navigation, status bar color, offline screen.

### Option B — Natively.io
**Why:** Very simple onboarding, auto-build pipelines, native UI wrappers, push, deep links.

**Deliverables:** similar to BDK; choose based on the team's experience/cost.

**Both options require:**
- Bubble app CORS/headers configured.
- Authentication persistence (check cookies/session behavior).
- Responsive QA across iPhone SE → Pro Max and common Android widths.

---

## 5) Integrations
- **Stripe:** Subscriptions (Free/Plus/Pro). Entitlements map to feature flags in UI conditions.
- **OneSignal** (via wrapper) or **Firebase Cloud Messaging** for push (match created, new message, safety reminders).
- **SendGrid:** transactional emails (welcome, receipts, safety alerts).
- **Twilio** (optional): SMS safety alerts to emergency contact.
- **Maps:** Google Maps links for date directions.
- **Geolocation:** Bubble plugin for lat/lng updates during SafetyCheckin.
- **Lottie:** animations (rose, kiss, X, confetti, glow).

---

## 6) Permissions (to list in App Store/Play)
- **Location** (While Using + Precise): safety check-ins and live meeting tracking (user-initiated only).
- **Camera/Microphone:** video intro, voice/video calls (when unlocked).
- **Photo Library:** profile photos, message attachments.
- **Notifications:** new matches, messages, safety reminders.
- **Background Location** (optional/strict): Not for MVP. If requested later, limit to user-explicit scenarios.

Include clear privacy disclosures and in-app prompts explaining purpose at time of request.

---

## 7) Analytics & Events

Instrument with Segment/GA4 (or Bubble plugin). Minimum events:
- sign_up_completed, profile_completed
- swipe_left, swipe_right_rose, swipe_right_kiss
- mutual_match_created
- message_sent (type), voice_call_started, video_call_started
- safety_checkin_started, safety_auto_alert_sent, sos_triggered
- date_suggestion_shared
- subscription_upgraded (tier)

---

## 8) Non-Functional Targets
- Initial load (wifi): < 3.0s to first interactive screen.
- Swipe latency: < 100ms gesture response, < 600ms card transition (inc. Lottie).
- Chat send latency: < 1s perceived (optimistic UI).
- Crash-free sessions: ≥ 99.5%.
- P50 API time: < 350ms.

---

## 9) Milestones & Deliverables

### Milestone 1 — App Skeleton (1–2 wks)
- Responsive mobile pages, navigation, basic data model, swiping UX (no animations).
- Basic chat (text only).
- Stripe Free/Plus/Pro; feature flags wired.

### Milestone 2 — Core Logic (1–2 wks)
- Rose/Kiss swipes, mutual match popup.
- Progressive unlock logic + stage badge.
- Safety Check-in + scheduled alert (email).

### Milestone 3 — Polish & Native (1–2 wks)
- Lottie animations + sounds.
- Date Suggestions & sharing.
- Reviews w/ moderation.
- Push notifications + wrapper builds for iOS/Android.
- Store submission assets & privacy copy.

### QA/Acceptance Criteria (sample)
- Right-swipe by male → Like(type=rose).
- Right-swipe by female → Like(type=kiss).
- Mutual Rose/Kiss → Match created, confetti plays, popup shows.
- Voice unlocks at ≥10 messages (Free), immediately on Plus/Pro.
- Video unlocks after ≥1 voice call (Free/Plus), immediately on Pro.
- Safety check-in generates auto alert when not completed on time.
- Stripe tier change updates gates instantly.

---

## 10) Risks & Mitigations
- **WebRTC complexity:** If call plugin blocks release, ship MVP with text/voice notes first; add live calls in a point release.
- **Push limits:** Use wrapper's native push integration; confirm device tokens and topic routing early.
- **Location/privacy:** Keep check-in user-initiated, show clear instructions and opt-out; never track in background without explicit consent/use case.

---

## 11) Nice-to-Haves (Post-MVP)
- Advanced filters (height, lifestyle habits, etc.).
- Profile Boosts (paid).
- Background checks (via 3rd-party).
- In-app date booking/discounts.
- AI icebreakers and compatibility scoring refinement.

---

## Ask from the Team
1. Confirm wrapper choice (BDK vs Natively) and WebRTC provider.
2. Provide timeline & effort for Milestones 1–3.
3. Identify any blockers for Stripe, Push, Geolocation.
4. Propose test plan across iOS (SE, 13, 15 Pro Max) and Android (Pixel 6/8, Samsung S21/S23).
