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

Run this SQL in Supabase SQL Editor:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  age INTEGER,
  gender TEXT,
  city TEXT,
  bio TEXT,
  occupation TEXT,
  height INTEGER,
  photo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Photos table
CREATE TABLE photos (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Matches table
CREATE TABLE matches (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  matched_user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, matched_user_id)
);

-- Messages table
CREATE TABLE messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  chat_id UUID NOT NULL,
  sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Photos policies
CREATE POLICY "Photos are viewable by everyone"
  ON photos FOR SELECT
  USING (true);

CREATE POLICY "Users can insert own photos"
  ON photos FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own photos"
  ON photos FOR DELETE
  USING (auth.uid() = user_id);

-- Matches policies
CREATE POLICY "Users can view their matches"
  ON matches FOR SELECT
  USING (auth.uid() = user_id OR auth.uid() = matched_user_id);

CREATE POLICY "Users can create matches"
  ON matches FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Messages policies
CREATE POLICY "Users can view messages in their chats"
  ON messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM matches
      WHERE (matches.user_id = auth.uid() OR matches.matched_user_id = auth.uid())
      AND matches.id = messages.chat_id
    )
  );

CREATE POLICY "Users can send messages"
  ON messages FOR INSERT
  WITH CHECK (auth.uid() = sender_id);
```

## 5. Storage Buckets

1. Go to **Storage** in Supabase Dashboard
2. Create a new bucket called `photos`
3. Make it **public**
4. Set up policies:

```sql
-- Allow authenticated users to upload
CREATE POLICY "Users can upload photos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'photos' AND
  auth.role() = 'authenticated'
);

-- Allow public read access
CREATE POLICY "Photos are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'photos');

-- Allow users to delete their own photos
CREATE POLICY "Users can delete own photos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'photos' AND
  auth.uid()::text = (storage.foldername(name))[1]
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
