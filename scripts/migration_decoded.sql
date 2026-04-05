-- MamaTrack Database Schema
-- Tables pour l'application de suivi de grossesse

-- 1. Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  due_date DATE,
  baby_name TEXT,
  mama_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Weight entries
CREATE TABLE IF NOT EXISTS public.weight_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  weight DECIMAL(5,2) NOT NULL,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Symptom entries
CREATE TABLE IF NOT EXISTS public.symptom_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  symptoms JSONB NOT NULL DEFAULT '[]',
  severity INTEGER CHECK (severity >= 1 AND severity <= 5),
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Kick sessions
CREATE TABLE IF NOT EXISTS public.kick_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  start_time TEXT NOT NULL,
  count INTEGER NOT NULL DEFAULT 0,
  duration INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Contraction sessions
CREATE TABLE IF NOT EXISTS public.contraction_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  contractions JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Appointments
CREATE TABLE IF NOT EXISTS public.appointments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  time TEXT NOT NULL,
  title TEXT NOT NULL,
  doctor TEXT,
  location TEXT,
  notes TEXT,
  done BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Water intake
CREATE TABLE IF NOT EXISTS public.water_intake (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  ml INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- 8. Checklist items
CREATE TABLE IF NOT EXISTS public.checklist_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  category TEXT NOT NULL,
  label TEXT NOT NULL,
  done BOOLEAN DEFAULT FALSE,
  custom BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weight_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.symptom_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kick_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contraction_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.water_intake ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checklist_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for weight_entries
CREATE POLICY "Users can view own weight entries" ON public.weight_entries
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own weight entries" ON public.weight_entries
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own weight entries" ON public.weight_entries
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own weight entries" ON public.weight_entries
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for symptom_entries
CREATE POLICY "Users can view own symptom entries" ON public.symptom_entries
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own symptom entries" ON public.symptom_entries
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own symptom entries" ON public.symptom_entries
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own symptom entries" ON public.symptom_entries
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for kick_sessions
CREATE POLICY "Users can view own kick sessions" ON public.kick_sessions
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own kick sessions" ON public.kick_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own kick sessions" ON public.kick_sessions
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own kick sessions" ON public.kick_sessions
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for contraction_sessions
CREATE POLICY "Users can view own contraction sessions" ON public.contraction_sessions
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own contraction sessions" ON public.contraction_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own contraction sessions" ON public.contraction_sessions
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own contraction sessions" ON public.contraction_sessions
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for appointments
CREATE POLICY "Users can view own appointments" ON public.appointments
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own appointments" ON public.appointments
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own appointments" ON public.appointments
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own appointments" ON public.appointments
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for water_intake
CREATE POLICY "Users can view own water intake" ON public.water_intake
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own water intake" ON public.water_intake
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own water intake" ON public.water_intake
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own water intake" ON public.water_intake
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for checklist_items
CREATE POLICY "Users can view own checklist items" ON public.checklist_items
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own checklist items" ON public.checklist_items
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own checklist items" ON public.checklist_items
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own checklist items" ON public.checklist_items
  FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_weight_entries_user_date ON public.weight_entries(user_id, date);
CREATE INDEX IF NOT EXISTS idx_symptom_entries_user_date ON public.symptom_entries(user_id, date);
CREATE INDEX IF NOT EXISTS idx_kick_sessions_user_date ON public.kick_sessions(user_id, date);
CREATE INDEX IF NOT EXISTS idx_contraction_sessions_user_date ON public.contraction_sessions(user_id, date);
CREATE INDEX IF NOT EXISTS idx_appointments_user_date ON public.appointments(user_id, date);
CREATE INDEX IF NOT EXISTS idx_water_intake_user_date ON public.water_intake(user_id, date);
CREATE INDEX IF NOT EXISTS idx_checklist_items_user ON public.checklist_items(user_id);

-- Function to auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for auto-creating profile
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
