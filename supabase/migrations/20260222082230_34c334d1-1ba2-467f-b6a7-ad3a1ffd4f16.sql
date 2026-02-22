-- Allow anyone to read learning_sessions (matches pattern of badges/learning_memory)
DROP POLICY IF EXISTS "Parents can view sessions" ON public.learning_sessions;
CREATE POLICY "Anyone can read sessions"
ON public.learning_sessions
FOR SELECT
USING (true);

-- Allow anyone to read quiz_scores (matches pattern)
DROP POLICY IF EXISTS "Parents can view scores" ON public.quiz_scores;
CREATE POLICY "Anyone can read scores"
ON public.quiz_scores
FOR SELECT
USING (true);

-- Allow anyone to read children (needed for dashboard without Supabase auth)
DROP POLICY IF EXISTS "Parents can view own children" ON public.children;
CREATE POLICY "Anyone can read children"
ON public.children
FOR SELECT
USING (true);

-- Allow anyone to update children XP/level
DROP POLICY IF EXISTS "Parents can update own children" ON public.children;
CREATE POLICY "Anyone can update children"
ON public.children
FOR UPDATE
USING (true);

-- Allow anyone to insert children
DROP POLICY IF EXISTS "Parents can insert children" ON public.children;
CREATE POLICY "Anyone can insert children"
ON public.children
FOR INSERT
WITH CHECK (true);

-- Allow anyone to delete children
DROP POLICY IF EXISTS "Parents can delete own children" ON public.children;
CREATE POLICY "Anyone can delete children"
ON public.children
FOR DELETE
USING (true);