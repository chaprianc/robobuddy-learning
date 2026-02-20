
-- Create the update_updated_at function first
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Table to store learning memory per child
CREATE TABLE public.learning_memory (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  child_id UUID NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  module TEXT NOT NULL,
  summary TEXT NOT NULL DEFAULT '',
  strengths TEXT[] DEFAULT '{}',
  weaknesses TEXT[] DEFAULT '{}',
  favorite_topics TEXT[] DEFAULT '{}',
  total_correct INTEGER DEFAULT 0,
  total_wrong INTEGER DEFAULT 0,
  highest_streak INTEGER DEFAULT 0,
  last_difficulty TEXT DEFAULT 'medium',
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(child_id, module)
);

ALTER TABLE public.learning_memory ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read learning_memory" ON public.learning_memory FOR SELECT USING (true);
CREATE POLICY "Anyone can insert learning_memory" ON public.learning_memory FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update learning_memory" ON public.learning_memory FOR UPDATE USING (true);

CREATE TRIGGER update_learning_memory_updated_at
BEFORE UPDATE ON public.learning_memory
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
