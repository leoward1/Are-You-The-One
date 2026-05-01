-- Match Lab Results table
-- Stores compatibility quiz answers and scores from Perfect Match Lab
CREATE TABLE IF NOT EXISTS match_lab_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
  answers JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Index for fast lookups by user
CREATE INDEX IF NOT EXISTS idx_match_lab_results_user_id ON match_lab_results(user_id);

-- RLS policies
ALTER TABLE match_lab_results ENABLE ROW LEVEL SECURITY;

-- Users can read their own results
CREATE POLICY "Users can read own lab results"
  ON match_lab_results FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own results
CREATE POLICY "Users can insert own lab results"
  ON match_lab_results FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own results
CREATE POLICY "Users can update own lab results"
  ON match_lab_results FOR UPDATE
  USING (auth.uid() = user_id);
