-- Migration 20260419 : ajoute les tables manquantes pour la persistance cloud
-- Couvre : prénoms favoris, liste d'achats + budget, médicaments + logs,
-- contacts d'urgence, projet de naissance.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============== PRÉNOMS FAVORIS ==============
CREATE TABLE IF NOT EXISTS baby_name_favorites (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nom text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, nom)
);

-- ============== LISTE D'ACHATS ==============
CREATE TABLE IF NOT EXISTS shopping_items (
  id text PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  categorie text NOT NULL,
  nom text NOT NULL,
  quantite int NOT NULL DEFAULT 1,
  priorite text NOT NULL DEFAULT 'Pratique',
  budget_estime numeric(8,2) NOT NULL DEFAULT 0,
  coche boolean NOT NULL DEFAULT false,
  custom boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS shopping_budget (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  budget numeric(10,2) NOT NULL DEFAULT 0,
  updated_at timestamptz DEFAULT now()
);

-- ============== MÉDICAMENTS ==============
CREATE TABLE IF NOT EXISTS medications (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  dosage text NOT NULL DEFAULT '',
  frequency text NOT NULL DEFAULT '1x',
  time text NOT NULL DEFAULT '08:00',
  notes text,
  color text NOT NULL DEFAULT '',
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS medication_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  med_id uuid NOT NULL REFERENCES medications(id) ON DELETE CASCADE,
  date date NOT NULL,
  taken boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, med_id, date)
);

-- ============== CONTACTS D'URGENCE ==============
CREATE TABLE IF NOT EXISTS emergency_contacts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  phone text NOT NULL,
  role text NOT NULL DEFAULT 'Autre',
  emoji text NOT NULL DEFAULT '📞',
  created_at timestamptz DEFAULT now()
);

-- ============== PROJET DE NAISSANCE ==============
CREATE TABLE IF NOT EXISTS birth_plan (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz DEFAULT now()
);

-- ============== NUTRITION QUOTIDIENNE ==============
CREATE TABLE IF NOT EXISTS nutrition_checks (
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date date NOT NULL,
  checks jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz DEFAULT now(),
  PRIMARY KEY (user_id, date)
);

-- ============== RLS ==============
ALTER TABLE baby_name_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE shopping_items       ENABLE ROW LEVEL SECURITY;
ALTER TABLE shopping_budget      ENABLE ROW LEVEL SECURITY;
ALTER TABLE medications          ENABLE ROW LEVEL SECURITY;
ALTER TABLE medication_logs      ENABLE ROW LEVEL SECURITY;
ALTER TABLE emergency_contacts   ENABLE ROW LEVEL SECURITY;
ALTER TABLE birth_plan           ENABLE ROW LEVEL SECURITY;
ALTER TABLE nutrition_checks     ENABLE ROW LEVEL SECURITY;

-- Helper : policies user_id = auth.uid()
DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'baby_name_favorites','shopping_items','medications',
    'medication_logs','emergency_contacts'
  ] LOOP
    EXECUTE format('DROP POLICY IF EXISTS "Users view own" ON %I', t);
    EXECUTE format('DROP POLICY IF EXISTS "Users insert own" ON %I', t);
    EXECUTE format('DROP POLICY IF EXISTS "Users update own" ON %I', t);
    EXECUTE format('DROP POLICY IF EXISTS "Users delete own" ON %I', t);
    EXECUTE format('CREATE POLICY "Users view own"   ON %I FOR SELECT USING (auth.uid() = user_id)', t);
    EXECUTE format('CREATE POLICY "Users insert own" ON %I FOR INSERT WITH CHECK (auth.uid() = user_id)', t);
    EXECUTE format('CREATE POLICY "Users update own" ON %I FOR UPDATE USING (auth.uid() = user_id)', t);
    EXECUTE format('CREATE POLICY "Users delete own" ON %I FOR DELETE USING (auth.uid() = user_id)', t);
  END LOOP;
END $$;

-- shopping_budget / birth_plan / nutrition_checks utilisent user_id comme PK
DROP POLICY IF EXISTS "Users manage own" ON shopping_budget;
CREATE POLICY "Users manage own" ON shopping_budget FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users manage own" ON birth_plan;
CREATE POLICY "Users manage own" ON birth_plan FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users manage own" ON nutrition_checks;
CREATE POLICY "Users manage own" ON nutrition_checks FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============== INDEXES ==============
CREATE INDEX IF NOT EXISTS idx_baby_name_favorites_user ON baby_name_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_shopping_items_user      ON shopping_items(user_id);
CREATE INDEX IF NOT EXISTS idx_medications_user         ON medications(user_id);
CREATE INDEX IF NOT EXISTS idx_medication_logs_user     ON medication_logs(user_id, date);
CREATE INDEX IF NOT EXISTS idx_emergency_contacts_user  ON emergency_contacts(user_id);
CREATE INDEX IF NOT EXISTS idx_nutrition_checks_user    ON nutrition_checks(user_id, date);
