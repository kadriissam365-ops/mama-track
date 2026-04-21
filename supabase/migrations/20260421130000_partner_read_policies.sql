-- Migration 20260421130000 : ajoute les policies "Partners can view data"
-- manquantes sur les tables de persistance existantes.
--
-- Contexte : la migration 20260419 a créé les tables baby_name_favorites,
-- shopping_items, shopping_budget, medications, birth_plan (etc.) avec les
-- policies "Users manage own" / "Users view own", mais SANS policy partner
-- read. Or le mode Duo (lib/duo-api.ts, table duo_access) suppose que les
-- partenaires actifs peuvent lire les données de la maman en lecture seule.
--
-- Pattern réutilisé : helper SQL `has_partner_access(mama_uuid uuid)` défini
-- dans supabase-schema.sql, déjà utilisé par weight_entries, symptom_entries,
-- kick_sessions, contraction_sessions, appointments, water_intake.

-- baby_name_favorites
DROP POLICY IF EXISTS "Partners can view data" ON baby_name_favorites;
CREATE POLICY "Partners can view data" ON baby_name_favorites
  FOR SELECT TO authenticated
  USING (has_partner_access(user_id));

-- shopping_items
DROP POLICY IF EXISTS "Partners can view data" ON shopping_items;
CREATE POLICY "Partners can view data" ON shopping_items
  FOR SELECT TO authenticated
  USING (has_partner_access(user_id));

-- shopping_budget (PK = user_id)
DROP POLICY IF EXISTS "Partners can view data" ON shopping_budget;
CREATE POLICY "Partners can view data" ON shopping_budget
  FOR SELECT TO authenticated
  USING (has_partner_access(user_id));

-- medications
DROP POLICY IF EXISTS "Partners can view data" ON medications;
CREATE POLICY "Partners can view data" ON medications
  FOR SELECT TO authenticated
  USING (has_partner_access(user_id));

-- birth_plan (PK = user_id)
DROP POLICY IF EXISTS "Partners can view data" ON birth_plan;
CREATE POLICY "Partners can view data" ON birth_plan
  FOR SELECT TO authenticated
  USING (has_partner_access(user_id));
