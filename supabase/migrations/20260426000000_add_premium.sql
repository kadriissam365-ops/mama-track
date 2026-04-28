-- Migration 20260426 : ajoute les colonnes Stripe / freemium sur profiles.
-- Appliquée via Supabase MCP sur le projet xddutehapskhgrgimpme le 2026-04-26.
-- Conservée ici pour reproduction sur les autres environnements (dev, staging).

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_premium BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
  ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT,
  ADD COLUMN IF NOT EXISTS premium_until TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS profiles_stripe_customer_id_idx
  ON public.profiles (stripe_customer_id)
  WHERE stripe_customer_id IS NOT NULL;
