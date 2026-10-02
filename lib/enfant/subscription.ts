import { redirect } from "next/navigation";
import { createClient } from "@/lib/enfant/supabase/server";
import { getCachedUser } from "@/lib/enfant/baby";

export async function getSubscriptionState() {
  const user = await getCachedUser();
  if (!user) return null;
  const client = await createClient();
  const { data } = await client.from("profiles").select("is_premium,premium_until").eq("id", user.id).maybeSingle();
  const isPremium = Boolean(data?.is_premium && (!data.premium_until || new Date(data.premium_until).getTime() > Date.now()));
  return { status: isPremium ? "active" : "free", plan: null, trialEndsAt: null, currentPeriodEnd: data?.premium_until ?? null, isPremium, isInTrial: false, hasAccess: isPremium };
}
export function isPremiumModule(slug: string) { return ["diversification", "reports", "timeline", "push"].includes(slug); }
export async function requirePremium(_fromSlug: string) {
  const state = await getSubscriptionState();
  if (!state) redirect("/auth/login");
  if (!state.hasAccess) redirect("/settings?premium=1");
  return state;
}
export function trialDaysLeft(_trialEndsAt: string | null) { return 0; }
