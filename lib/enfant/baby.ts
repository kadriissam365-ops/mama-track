import { cache } from "react";
import { childAgeLabel } from "@/lib/family-journey";
import { createClient } from "@/lib/enfant/supabase/server";
import type { UnitSystem } from "@/lib/enfant/units";
import type { User } from "@supabase/supabase-js";

// Dedup getUser within a single request — multiple Server Components on the
// same page sharing this won't re-hit Supabase.
export const getCachedUser = cache(async (): Promise<User | null> => {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  return data.user ?? null;
});

export async function getUserUnits(prefetchedUser?: User): Promise<UnitSystem> {
  const supabase = await createClient();
  const user = prefetchedUser ?? (await getCachedUser()) ?? undefined;
  if (!user) return "metric";
  const { data } = await supabase
    .from("baby_preferences")
    .select("units")
    .eq("id", user.id)
    .maybeSingle();
  const units = (data as { units?: string } | null)?.units;
  return units === "imperial" ? "imperial" : "metric";
}

export type Baby = {
  id: string;
  user_id: string;
  name: string;
  birth_date: string;
  sex: "M" | "F" | "X" | null;
  birth_weight_g: number | null;
  birth_height_cm: number | null;
  birth_head_cm: number | null;
  photo_url: string | null;
};

export async function requireUserAndBaby(prefetchedUser?: User) {
  const supabase = await createClient();
  const user = prefetchedUser ?? (await getCachedUser()) ?? undefined;
  if (!user) return { user: null, baby: null, supabase };

  const { data: settings } = await supabase
    .from("family_settings")
    .select("active_baby_id")
    .eq("user_id", user.id)
    .maybeSingle();
  if (settings?.active_baby_id) {
    const { data: selected } = await supabase
      .from("babies")
      .select(
        "id,user_id,name,birth_date,sex,birth_weight_g,birth_height_cm,birth_head_cm,photo_url",
      )
      .eq("id", settings.active_baby_id)
      .maybeSingle();
    if (selected) return { user, baby: selected as Baby, supabase };
  }

  // Try owned first (RLS-aware, indexed on user_id), fallback to any accessible baby (collaborator)
  const cols =
    "id, user_id, name, birth_date, sex, birth_weight_g, birth_height_cm, birth_head_cm, photo_url";
  const { data: owned } = await supabase
    .from("babies")
    .select(cols)
    .eq("user_id", user.id)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (owned) {
    return { user, baby: owned as Baby, supabase };
  }
  // No owned baby — try collaborator-accessible (RLS handles auth)
  const { data: collab } = await supabase
    .from("babies")
    .select(cols)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  return { user, baby: (collab as Baby | null) ?? null, supabase };
}

export type BabyRole = "owner" | "caregiver" | "viewer";

/**
 * Détermine le rôle du user courant sur le bébé donné.
 * - owner    : babies.user_id === user.id
 * - caregiver: collaborateur accepté avec role='caregiver'
 * - viewer   : collaborateur accepté avec role='viewer'
 *
 * Renvoie null si pas d'accès du tout (ne devrait pas arriver via
 * requireUserAndBaby qui filtre déjà via RLS).
 */
export async function getUserRole(
  user: Pick<User, "id">,
  baby: Pick<Baby, "id" | "user_id">,
): Promise<BabyRole | null> {
  if (baby.user_id === user.id) return "owner";
  const supabase = await createClient();
  const { data } = await supabase
    .from("baby_collaborators")
    .select("role, accepted_at")
    .eq("baby_id", baby.id)
    .eq("collaborator_id", user.id)
    .maybeSingle();
  if (!data || !data.accepted_at) return null;
  const role = (data as { role?: string }).role;
  if (role === "viewer") return "viewer";
  // 'caregiver' (et fallback historique 'partner' pre-migration)
  return "caregiver";
}

export function ageInDays(birthDate: string): number {
  const birth = new Date(birthDate);
  const now = new Date();
  return Math.floor((now.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24));
}

export function formatAge(birthDate: string): string {
  return childAgeLabel(birthDate);
}
