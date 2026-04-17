-- Drop existing blocks table and recreate cleanly
DROP TABLE IF EXISTS public.blocks CASCADE;

-- Create blocks table with explicit FK constraint names
CREATE TABLE public.blocks (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  blocker_id uuid NOT NULL,
  blocked_user_id uuid NOT NULL,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT blocks_blocker_id_fkey FOREIGN KEY (blocker_id) REFERENCES public.profiles(id) ON DELETE CASCADE,
  CONSTRAINT blocks_blocked_user_id_fkey FOREIGN KEY (blocked_user_id) REFERENCES public.profiles(id) ON DELETE CASCADE,
  CONSTRAINT blocks_unique UNIQUE (blocker_id, blocked_user_id)
);

-- Enable RLS
ALTER TABLE public.blocks ENABLE ROW LEVEL SECURITY;

-- Full CRUD policies
CREATE POLICY "blocks_insert" ON public.blocks
  FOR INSERT WITH CHECK (auth.uid() = blocker_id);

CREATE POLICY "blocks_select" ON public.blocks
  FOR SELECT USING (auth.uid() = blocker_id);

CREATE POLICY "blocks_delete" ON public.blocks
  FOR DELETE USING (auth.uid() = blocker_id);

-- Drop and recreate reports table cleanly
DROP TABLE IF EXISTS public.reports CASCADE;

CREATE TABLE public.reports (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  reporter_id uuid NOT NULL,
  reported_user_id uuid NOT NULL,
  match_id uuid,
  reason text,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT reports_reporter_id_fkey FOREIGN KEY (reporter_id) REFERENCES public.profiles(id) ON DELETE CASCADE,
  CONSTRAINT reports_reported_user_id_fkey FOREIGN KEY (reported_user_id) REFERENCES public.profiles(id) ON DELETE CASCADE,
  CONSTRAINT reports_match_id_fkey FOREIGN KEY (match_id) REFERENCES public.matches(id) ON DELETE SET NULL
);

ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "reports_insert" ON public.reports
  FOR INSERT WITH CHECK (auth.uid() = reporter_id);
