# Fix Guide — Are You The One (TestFlight Issues)

## Step 1 — Replace your files

Copy these 4 corrected files into your project root, replacing the originals:
- App.tsx
- app.json
- eas.json
- babel.config.js

---

## Step 2 — Fill in your real Supabase credentials

In BOTH `app.json` AND `eas.json`, replace the placeholders with your real keys.
You can find them at: Supabase Dashboard → Project Settings → API

Replace:
  "supabaseUrl": "https://your-project.supabase.co"
  "supabaseAnonKey": "your-supabase-anon-key-here"

With your real values from Supabase. (Done in this automated fix)

---

## Step 3 — Install expo-splash-screen (if not already installed)

Run in your project folder:

  npx expo install expo-splash-screen

---

## Step 4 — Clear all caches

  npx expo start --clear

Then stop the server (Ctrl+C) — we just need the cache cleared.

---

## Step 5 — RECOMMENDED: Use EAS Secrets instead of hardcoded keys

For better security, do NOT put real keys in eas.json (which may be committed to git).
Instead use EAS encrypted secrets:

  eas secret:create --scope project --name SUPABASE_URL --value "https://your-project.supabase.co"
  eas secret:create --scope project --name SUPABASE_ANON_KEY --value "your-anon-key"

---

## Step 6 — Build and submit to TestFlight

  eas build --platform ios --profile production
  eas submit --platform ios

---

## What these fixes resolve

| Issue                          | Fix Applied                                      |
|-------------------------------|--------------------------------------------------|
| "Invalid API key" on signup   | Supabase keys now baked into production build    |
| App skips splash screen       | expo-splash-screen added + SplashScreen.preventAutoHideAsync() |
| Auth crash on cold launch     | loadUser() now awaited before initAuthListener() |
| Animations crash on device    | babel.config.js plugin order corrected           |
| Push notifications broken     | expo-notifications plugin added to app.json      |
| Keychain/token persistence    | expo-secure-store plugin added to app.json       |
