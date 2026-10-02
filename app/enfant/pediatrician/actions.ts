"use server";
import { saveMutation } from "@/lib/enfant/mutations";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { randomBytes } from "node:crypto";
import { requireUserAndBaby } from "@/lib/enfant/baby";

const ALLOWED_SCOPES = [1, 3, 6, 12] as const;
const ALLOWED_DURATIONS = [1, 7, 30] as const;

function genToken(): string {
  // 32 random bytes → 43 chars base64url. Cryptographically strong.
  return randomBytes(32).toString("base64url");
}

export async function createPediatricianToken(formData: FormData) {
  const { user, baby, supabase } = await requireUserAndBaby();
  if (!user) redirect("/auth/login");
  if (!baby) redirect("/enfant/onboarding");

  // Ownership : seul le propriétaire du bébé peut générer un lien public.
  // Les collaborateurs (mode duo) n'ont pas le droit (responsabilité légale
  // sur la diffusion des données médicales — owner only).
  if (baby.user_id !== user.id) return;

  const labelRaw = String(formData.get("label") ?? "").trim();
  const label = labelRaw ? labelRaw.slice(0, 80) : null;

  const scopeRaw = Number(formData.get("scope_months") ?? 6);
  const scope_months = (ALLOWED_SCOPES as readonly number[]).includes(scopeRaw)
    ? scopeRaw
    : 6;

  const include_diary = String(formData.get("include_diary") ?? "") === "on";

  const durationRaw = Number(formData.get("duration_days") ?? 7);
  const durationDays = (ALLOWED_DURATIONS as readonly number[]).includes(
    durationRaw,
  )
    ? durationRaw
    : 7;

  const expiresAt = new Date(
    Date.now() + durationDays * 24 * 60 * 60 * 1000,
  ).toISOString();

  const token = genToken();

  await saveMutation(supabase.from("pediatrician_tokens").insert({
    baby_id: baby.id,
    created_by: user.id,
    token,
    scope_months,
    include_diary,
    label,
    expires_at: expiresAt,
  }));

  revalidatePath("/enfant/pediatrician");
}

export async function revokePediatricianToken(formData: FormData) {
  const { user, baby, supabase } = await requireUserAndBaby();
  if (!user) redirect("/auth/login");
  if (!baby) redirect("/enfant/onboarding");

  const id = String(formData.get("id") ?? "");
  if (!id) return;

  // Soft-delete : on garde le row pour l'audit (access_count + last_accessed_at).
  // RLS empêche déjà la modification d'un token d'un autre user, mais on filtre
  // par created_by + baby_id en plus pour défense en profondeur.
  await saveMutation(supabase
    .from("pediatrician_tokens")
    .update({ revoked_at: new Date().toISOString() })
    .eq("id", id)
    .eq("created_by", user.id)
    .eq("baby_id", baby.id));

  revalidatePath("/enfant/pediatrician");
}
