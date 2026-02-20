
-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  name TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Children table
CREATE TABLE public.children (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  age_group TEXT NOT NULL DEFAULT '7-9',
  screen_time_limit_minutes INT NOT NULL DEFAULT 30,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.children ENABLE ROW LEVEL SECURITY;

-- Learning sessions table
CREATE TABLE public.learning_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID REFERENCES public.children(id) ON DELETE CASCADE NOT NULL,
  module TEXT NOT NULL,
  topic TEXT,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ended_at TIMESTAMPTZ,
  duration_minutes INT,
  messages_count INT DEFAULT 0
);
ALTER TABLE public.learning_sessions ENABLE ROW LEVEL SECURITY;

-- Quiz scores table
CREATE TABLE public.quiz_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID REFERENCES public.children(id) ON DELETE CASCADE NOT NULL,
  topic TEXT NOT NULL,
  score INT NOT NULL,
  total INT NOT NULL DEFAULT 5,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.quiz_scores ENABLE ROW LEVEL SECURITY;

-- Helper: check if user owns profile
CREATE OR REPLACE FUNCTION public.is_owner_of_profile(profile_id UUID)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = profile_id AND user_id = auth.uid()
  );
$$;

-- Helper: check if user is parent of child
CREATE OR REPLACE FUNCTION public.is_parent_of_child(p_child_id UUID)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.children c
    JOIN public.profiles p ON c.parent_id = p.id
    WHERE c.id = p_child_id AND p.user_id = auth.uid()
  );
$$;

-- Profiles RLS
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (user_id = auth.uid());

-- Children RLS
CREATE POLICY "Parents can view own children" ON public.children FOR SELECT USING (public.is_parent_of_child(id));
CREATE POLICY "Parents can insert children" ON public.children FOR INSERT WITH CHECK (parent_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));
CREATE POLICY "Parents can update own children" ON public.children FOR UPDATE USING (public.is_parent_of_child(id));
CREATE POLICY "Parents can delete own children" ON public.children FOR DELETE USING (public.is_parent_of_child(id));

-- Learning sessions RLS
CREATE POLICY "Parents can view sessions" ON public.learning_sessions FOR SELECT USING (public.is_parent_of_child(child_id));
CREATE POLICY "Anyone can insert sessions" ON public.learning_sessions FOR INSERT WITH CHECK (true);
CREATE POLICY "Parents can update sessions" ON public.learning_sessions FOR UPDATE USING (public.is_parent_of_child(child_id));

-- Quiz scores RLS
CREATE POLICY "Parents can view scores" ON public.quiz_scores FOR SELECT USING (public.is_parent_of_child(child_id));
CREATE POLICY "Anyone can insert scores" ON public.quiz_scores FOR INSERT WITH CHECK (true);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', ''));
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
