import "server-only";
import { NextResponse } from "next/server";

/**
 * Limitation de débit par utilisateur, adossée à la fonction SQL
 * `consume_rate_limit(bucket, limit, window_seconds)` (SECURITY DEFINER,
 * réservée aux utilisateurs authentifiés). Une fenêtre glissante simple :
 * le compteur repart à 1 quand la fenêtre est expirée.
 */
export interface RateLimitRule {
  bucket: string;
  limit: number;
  windowSeconds: number;
}

export const RATE_LIMITS = {
  coachChat: { bucket: "coach_chat", limit: 60, windowSeconds: 3600 },
  coachTip: { bucket: "coach_tip", limit: 12, windowSeconds: 3600 },
  dailyStory: { bucket: "daily_story", limit: 10, windowSeconds: 3600 },
  mealPlan: { bucket: "meal_plan", limit: 6, windowSeconds: 3600 },
  vision: { bucket: "vision", limit: 15, windowSeconds: 3600 },
  duoInvite: { bucket: "duo_invite", limit: 10, windowSeconds: 3600 },
  weeklyEmail: { bucket: "weekly_email", limit: 3, windowSeconds: 3600 },
  pushSend: { bucket: "push_send", limit: 20, windowSeconds: 3600 },
  babyCoach: { bucket: "baby_coach", limit: 5, windowSeconds: 86400 },
  babyImport: { bucket: "baby_import", limit: 3, windowSeconds: 3600 },
} as const satisfies Record<string, RateLimitRule>;

interface RpcClient {
  rpc: (
    fn: string,
    args: Record<string, unknown>,
  ) => PromiseLike<{ data: unknown; error: { message: string } | null }>;
}

/**
 * Consomme un jeton pour l'utilisateur courant (identifié côté SQL via auth.uid()).
 * La base valide les quotas par bucket. Une panne ne doit pas ouvrir
 * l'accès sans limite aux services payants.
 */
export async function consumeRateLimit(supabase: unknown, rule: RateLimitRule): Promise<boolean> {
  try {
    const client = supabase as RpcClient;
    const { data, error } = await client.rpc("consume_rate_limit", {
      p_bucket: rule.bucket,
      p_limit: rule.limit,
      p_window_seconds: rule.windowSeconds,
    });
    if (error) {
      console.warn("[rate-limit] rpc error:", error.message);
      return false;
    }
    return data === true;
  } catch (err) {
    console.warn("[rate-limit] failed:", err);
    return false;
  }
}

export function rateLimitedResponse(rule: RateLimitRule) {
  return NextResponse.json(
    { error: "Trop de requêtes pour le moment. Réessaie dans quelques minutes." },
    { status: 429, headers: { "Retry-After": String(Math.min(rule.windowSeconds, 300)) } },
  );
}
