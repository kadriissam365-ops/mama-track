-- Migration 20260421 12:00:00 : ajoute les tables manquantes pour la persistance cloud
-- Cible : sleep_entries, mood_entries, blood_pressure_entries, abdomen_measurements,
--         exercise_sessions, journal_notes, bump_photos, breathing_sessions
--
-- Stratégie : idempotent. La plupart de ces tables existent déjà avec des schémas
-- proches mais pas identiques ; on utilise CREATE TABLE IF NOT EXISTS pour les
-- créations et ALTER TABLE ... ADD COLUMN IF NOT EXISTS pour harmoniser.
-- RLS : policy "Users manage own" (auth.uid() = user_id) + policy
-- "Partners can view data" (has_partner_access(user_id)) pour le mode duo.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- 1) SLEEP ENTRIES (table existe déjà avec schéma légèrement différent)
-- =============================================================================
CREATE TABLE IF NOT EXISTS sleep_entries (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date date NOT NULL DEFAULT CURRENT_DATE,
  hours numeric(3,1) CHECK (hours IS NULL OR (hours >= 0 AND hours <= 24)),
  quality smallint CHECK (quality IS NULL OR (quality BETWEEN 1 AND 5)),
  note text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE sleep_entries ADD COLUMN IF NOT EXISTS hours numeric(3,1);
ALTER TABLE sleep_entries ADD COLUMN IF NOT EXISTS note text;

-- =============================================================================
-- 2) MOOD ENTRIES
-- =============================================================================
CREATE TABLE IF NOT EXISTS mood_entries (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date date NOT NULL DEFAULT CURRENT_DATE,
  mood_emoji text NOT NULL,
  mood_label text,
  note text,
  created_at timestamptz DEFAULT now()
);

-- =============================================================================
-- 3) BLOOD PRESSURE ENTRIES (existe déjà, on ajoute la colonne `date` manquante)
-- =============================================================================
CREATE TABLE IF NOT EXISTS blood_pressure_entries (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date date NOT NULL DEFAULT CURRENT_DATE,
  systolic smallint NOT NULL CHECK (systolic BETWEEN 40 AND 260),
  diastolic smallint NOT NULL CHECK (diastolic BETWEEN 20 AND 200),
  pulse smallint CHECK (pulse IS NULL OR (pulse BETWEEN 20 AND 250)),
  note text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE blood_pressure_entries ADD COLUMN IF NOT EXISTS date date DEFAULT CURRENT_DATE;
ALTER TABLE blood_pressure_entries ADD COLUMN IF NOT EXISTS note text;
ALTER TABLE blood_pressure_entries ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();

-- =============================================================================
-- 4) ABDOMEN MEASUREMENTS
-- Note : table existante nommée `abdomen_entries` (schéma différent). On
-- crée `abdomen_measurements` conformément à la spec, sans toucher l'ancienne.
-- =============================================================================
CREATE TABLE IF NOT EXISTS abdomen_measurements (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date date NOT NULL DEFAULT CURRENT_DATE,
  circumference_cm numeric(5,1) NOT NULL CHECK (circumference_cm > 0 AND circumference_cm < 200),
  note text,
  created_at timestamptz DEFAULT now()
);

-- =============================================================================
-- 5) EXERCISE SESSIONS
-- Note : table existante `exercise_entries` avec `duration_minutes`. On crée
-- la table `exercise_sessions` conforme à la spec.
-- =============================================================================
CREATE TABLE IF NOT EXISTS exercise_sessions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date date NOT NULL DEFAULT CURRENT_DATE,
  activity text NOT NULL,
  duration_min smallint NOT NULL CHECK (duration_min > 0 AND duration_min < 1440),
  intensity text CHECK (intensity IS NULL OR intensity IN ('low','moderate','high')),
  note text,
  created_at timestamptz DEFAULT now()
);

-- =============================================================================
-- 6) JOURNAL NOTES (existe déjà, on ajoute updated_at + trigger)
-- =============================================================================
CREATE TABLE IF NOT EXISTS journal_notes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text,
  body text NOT NULL,
  mood_emoji text,
  week smallint CHECK (week IS NULL OR (week BETWEEN 1 AND 45)),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE journal_notes ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

CREATE OR REPLACE FUNCTION set_journal_notes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_journal_notes_updated_at ON journal_notes;
CREATE TRIGGER trg_journal_notes_updated_at
BEFORE UPDATE ON journal_notes
FOR EACH ROW EXECUTE FUNCTION set_journal_notes_updated_at();

-- =============================================================================
-- 7) BUMP PHOTOS (existe déjà ; ajoute UNIQUE(user_id, week))
-- =============================================================================
CREATE TABLE IF NOT EXISTS bump_photos (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  week smallint NOT NULL CHECK (week BETWEEN 1 AND 45),
  storage_path text NOT NULL,
  note text,
  created_at timestamptz DEFAULT now()
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'bump_photos_user_week_unique'
  ) THEN
    BEGIN
      ALTER TABLE bump_photos
        ADD CONSTRAINT bump_photos_user_week_unique UNIQUE (user_id, week);
    EXCEPTION WHEN unique_violation THEN
      RAISE NOTICE 'bump_photos already contains duplicates on (user_id, week), skipping unique';
    END;
  END IF;
END $$;

-- =============================================================================
-- 8) BREATHING SESSIONS
-- =============================================================================
CREATE TABLE IF NOT EXISTS breathing_sessions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  started_at timestamptz NOT NULL,
  duration_sec integer NOT NULL CHECK (duration_sec > 0),
  pattern text NOT NULL,
  rounds smallint CHECK (rounds IS NULL OR rounds > 0),
  completed boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- =============================================================================
-- RLS : activer + policies (auth.uid() = user_id) + partner read
-- =============================================================================
ALTER TABLE sleep_entries            ENABLE ROW LEVEL SECURITY;
ALTER TABLE mood_entries             ENABLE ROW LEVEL SECURITY;
ALTER TABLE blood_pressure_entries   ENABLE ROW LEVEL SECURITY;
ALTER TABLE abdomen_measurements     ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_sessions        ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_notes            ENABLE ROW LEVEL SECURITY;
ALTER TABLE bump_photos              ENABLE ROW LEVEL SECURITY;
ALTER TABLE breathing_sessions       ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'sleep_entries','mood_entries','blood_pressure_entries',
    'abdomen_measurements','exercise_sessions','journal_notes',
    'bump_photos','breathing_sessions'
  ] LOOP
    EXECUTE format('DROP POLICY IF EXISTS "Users manage own" ON %I', t);
    EXECUTE format(
      'CREATE POLICY "Users manage own" ON %I FOR ALL '
      'USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id)', t);

    EXECUTE format('DROP POLICY IF EXISTS "Partners can view data" ON %I', t);
    EXECUTE format(
      'CREATE POLICY "Partners can view data" ON %I FOR SELECT '
      'USING (has_partner_access(user_id))', t);
  END LOOP;
END $$;

-- =============================================================================
-- INDEXES
-- =============================================================================
CREATE INDEX IF NOT EXISTS idx_sleep_entries_user_date           ON sleep_entries(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_mood_entries_user_date            ON mood_entries(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_blood_pressure_entries_user_date  ON blood_pressure_entries(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_abdomen_measurements_user_date    ON abdomen_measurements(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_exercise_sessions_user_date       ON exercise_sessions(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_journal_notes_user_created        ON journal_notes(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bump_photos_user_week             ON bump_photos(user_id, week);
CREATE INDEX IF NOT EXISTS idx_breathing_sessions_user_started   ON breathing_sessions(user_id, started_at DESC);

-- =============================================================================
-- STORAGE BUCKET : bump-photos (private) + policies
-- =============================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('bump-photos', 'bump-photos', false)
ON CONFLICT (id) DO NOTHING;

-- Chemin attendu : {auth.uid()}/...
DROP POLICY IF EXISTS "bump_photos_owner_insert" ON storage.objects;
CREATE POLICY "bump_photos_owner_insert" ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'bump-photos'
    AND (auth.uid())::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "bump_photos_owner_update" ON storage.objects;
CREATE POLICY "bump_photos_owner_update" ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'bump-photos'
    AND (auth.uid())::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "bump_photos_owner_delete" ON storage.objects;
CREATE POLICY "bump_photos_owner_delete" ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'bump-photos'
    AND (auth.uid())::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "bump_photos_owner_select" ON storage.objects;
CREATE POLICY "bump_photos_owner_select" ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'bump-photos'
    AND (auth.uid())::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "bump_photos_partner_select" ON storage.objects;
CREATE POLICY "bump_photos_partner_select" ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'bump-photos'
    AND has_partner_access(((storage.foldername(name))[1])::uuid)
  );
