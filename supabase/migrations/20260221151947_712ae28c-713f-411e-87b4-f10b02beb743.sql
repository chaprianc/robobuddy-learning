
-- Add XP and level to children
ALTER TABLE public.children
ADD COLUMN xp integer NOT NULL DEFAULT 0,
ADD COLUMN level integer NOT NULL DEFAULT 1;

-- Create badges table
CREATE TABLE public.badges (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  child_id uuid NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  badge_key text NOT NULL,
  badge_name text NOT NULL,
  badge_icon text NOT NULL DEFAULT '🏅',
  earned_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(child_id, badge_key)
);

ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert badges" ON public.badges FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can read badges" ON public.badges FOR SELECT USING (true);
