-- MamaTrack Database Schema
-- Execute this in the Supabase SQL Editor

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (may already exist, adjust if needed)
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  due_date date,
  baby_name text,
  mama_name text,
  created_at timestamptz DEFAULT now()
);

-- Weight entries
CREATE TABLE IF NOT EXISTS weight_entries (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date date NOT NULL,
  weight numeric(5,2) NOT NULL,
  note text,
  created_at timestamptz DEFAULT now()
);

-- Symptom entries
CREATE TABLE IF NOT EXISTS symptom_entries (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date date NOT NULL,
  symptoms jsonb NOT NULL DEFAULT '[]',
  severity int NOT NULL DEFAULT 3,
  note text,
  created_at timestamptz DEFAULT now()
);

-- Kick sessions
CREATE TABLE IF NOT EXISTS kick_sessions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date date NOT NULL,
  start_time text NOT NULL,
  count int NOT NULL DEFAULT 0,
  duration int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Contraction sessions
CREATE TABLE IF NOT EXISTS contraction_sessions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date date NOT NULL,
  contractions jsonb NOT NULL DEFAULT '[]',
  created_at timestamptz DEFAULT now()
);

-- Appointments
CREATE TABLE IF NOT EXISTS appointments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date date NOT NULL,
  time text NOT NULL,
  title text NOT NULL,
  doctor text,
  location text,
  notes text,
  done boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Water intake
CREATE TABLE IF NOT EXISTS water_intake (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date date NOT NULL,
  ml int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, date)
);

-- Checklist items
CREATE TABLE IF NOT EXISTS checklist_items (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category text NOT NULL,
  label text NOT NULL,
  done boolean DEFAULT false,
  custom boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Notification settings
CREATE TABLE IF NOT EXISTS notification_settings (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  water_reminders boolean DEFAULT true,
  medication_morning boolean DEFAULT false,
  medication_evening boolean DEFAULT false,
  appointment_reminders boolean DEFAULT true,
  reminder_interval_hours int DEFAULT 2,
  created_at timestamptz DEFAULT now()
);

-- Duo invitations (for sharing with partner/healthcare provider)
CREATE TABLE IF NOT EXISTS duo_invitations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  mama_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  token text NOT NULL UNIQUE,
  role text NOT NULL DEFAULT 'papa',
  accepted_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Duo access (active partner access)
CREATE TABLE IF NOT EXISTS duo_access (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  mama_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  partner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'papa',
  created_at timestamptz DEFAULT now(),
  UNIQUE(mama_id, partner_id)
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE weight_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE symptom_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE kick_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE contraction_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE water_intake ENABLE ROW LEVEL SECURITY;
ALTER TABLE checklist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE duo_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE duo_access ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for data tables
CREATE OR REPLACE FUNCTION create_data_policies(table_name text) RETURNS void AS $$
BEGIN
  EXECUTE format('DROP POLICY IF EXISTS "Users can view own data" ON %I', table_name);
  EXECUTE format('DROP POLICY IF EXISTS "Users can insert own data" ON %I', table_name);
  EXECUTE format('DROP POLICY IF EXISTS "Users can update own data" ON %I', table_name);
  EXECUTE format('DROP POLICY IF EXISTS "Users can delete own data" ON %I', table_name);
  
  EXECUTE format('CREATE POLICY "Users can view own data" ON %I FOR SELECT USING (auth.uid() = user_id)', table_name);
  EXECUTE format('CREATE POLICY "Users can insert own data" ON %I FOR INSERT WITH CHECK (auth.uid() = user_id)', table_name);
  EXECUTE format('CREATE POLICY "Users can update own data" ON %I FOR UPDATE USING (auth.uid() = user_id)', table_name);
  EXECUTE format('CREATE POLICY "Users can delete own data" ON %I FOR DELETE USING (auth.uid() = user_id)', table_name);
END;
$$ LANGUAGE plpgsql;

SELECT create_data_policies('weight_entries');
SELECT create_data_policies('symptom_entries');
SELECT create_data_policies('kick_sessions');
SELECT create_data_policies('contraction_sessions');
SELECT create_data_policies('appointments');
SELECT create_data_policies('water_intake');
SELECT create_data_policies('checklist_items');
SELECT create_data_policies('notification_settings');

-- RLS Policies for duo_invitations
DROP POLICY IF EXISTS "Mamas can view own invitations" ON duo_invitations;
DROP POLICY IF EXISTS "Mamas can create invitations" ON duo_invitations;
DROP POLICY IF EXISTS "Mamas can delete own invitations" ON duo_invitations;
DROP POLICY IF EXISTS "Anyone can view invitation by token" ON duo_invitations;

CREATE POLICY "Mamas can view own invitations" ON duo_invitations FOR SELECT USING (auth.uid() = mama_id);
CREATE POLICY "Mamas can create invitations" ON duo_invitations FOR INSERT WITH CHECK (auth.uid() = mama_id);
CREATE POLICY "Mamas can delete own invitations" ON duo_invitations FOR DELETE USING (auth.uid() = mama_id);
CREATE POLICY "Anyone can view invitation by token" ON duo_invitations FOR SELECT USING (true); -- Token is secret

-- RLS Policies for duo_access
DROP POLICY IF EXISTS "Mamas can manage access" ON duo_access;
DROP POLICY IF EXISTS "Partners can view their access" ON duo_access;
DROP POLICY IF EXISTS "Users can insert duo access" ON duo_access;

CREATE POLICY "Mamas can manage access" ON duo_access FOR ALL USING (auth.uid() = mama_id);
CREATE POLICY "Partners can view their access" ON duo_access FOR SELECT USING (auth.uid() = partner_id);
CREATE POLICY "Users can insert duo access" ON duo_access FOR INSERT WITH CHECK (true); -- Will be done after invitation acceptance

-- Partners can view mama's data (read-only)
CREATE OR REPLACE FUNCTION has_partner_access(mama_uuid uuid) RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM duo_access 
    WHERE partner_id = auth.uid() 
    AND mama_id = mama_uuid
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add partner access policies to data tables
ALTER TABLE weight_entries DROP POLICY IF EXISTS "Partners can view data";
ALTER TABLE symptom_entries DROP POLICY IF EXISTS "Partners can view data";
ALTER TABLE kick_sessions DROP POLICY IF EXISTS "Partners can view data";
ALTER TABLE contraction_sessions DROP POLICY IF EXISTS "Partners can view data";
ALTER TABLE appointments DROP POLICY IF EXISTS "Partners can view data";
ALTER TABLE water_intake DROP POLICY IF EXISTS "Partners can view data";

CREATE POLICY "Partners can view data" ON weight_entries FOR SELECT USING (has_partner_access(user_id));
CREATE POLICY "Partners can view data" ON symptom_entries FOR SELECT USING (has_partner_access(user_id));
CREATE POLICY "Partners can view data" ON kick_sessions FOR SELECT USING (has_partner_access(user_id));
CREATE POLICY "Partners can view data" ON contraction_sessions FOR SELECT USING (has_partner_access(user_id));
CREATE POLICY "Partners can view data" ON appointments FOR SELECT USING (has_partner_access(user_id));
CREATE POLICY "Partners can view data" ON water_intake FOR SELECT USING (has_partner_access(user_id));

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_weight_entries_user_date ON weight_entries(user_id, date);
CREATE INDEX IF NOT EXISTS idx_symptom_entries_user_date ON symptom_entries(user_id, date);
CREATE INDEX IF NOT EXISTS idx_kick_sessions_user_date ON kick_sessions(user_id, date);
CREATE INDEX IF NOT EXISTS idx_contraction_sessions_user_date ON contraction_sessions(user_id, date);
CREATE INDEX IF NOT EXISTS idx_appointments_user_date ON appointments(user_id, date);
CREATE INDEX IF NOT EXISTS idx_water_intake_user_date ON water_intake(user_id, date);
CREATE INDEX IF NOT EXISTS idx_checklist_items_user ON checklist_items(user_id);
CREATE INDEX IF NOT EXISTS idx_duo_invitations_token ON duo_invitations(token);
CREATE INDEX IF NOT EXISTS idx_duo_access_partner ON duo_access(partner_id);
CREATE INDEX IF NOT EXISTS idx_duo_access_mama ON duo_access(mama_id);

-- Clean up
DROP FUNCTION IF EXISTS create_data_policies(text);
