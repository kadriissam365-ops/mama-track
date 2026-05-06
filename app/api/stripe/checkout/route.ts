import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClientFromCookies } from "@/lib/supabase";
import { getAppUrl, getStripe } from "@/lib/stripe-server";

export const runtime = "nodejs";

type Plan = "monthly" | "pack";

function resolvePrice(plan: Plan): { priceId: string | undefined; mode: "subscription" | "payment" } {
  if (plan === "pack") {
    return { priceId: process.env.STRIPE_PRICE_PACK_GROSSESSE, mode: "payment" };
  }
  // Default monthly. Fall back to legacy STRIPE_PRICE_PREMIUM if STRIPE_PRICE_MONTHLY not set.
  return {
    priceId: process.env.STRIPE_PRICE_MONTHLY ?? process.env.STRIPE_PRICE_PREMIUM,
    mode: "subscription",
  };
}

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClientFromCookies(cookieStore);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    let plan: Plan = "pack";
    try {
      const body = (await req.json().catch(() => ({}))) as { plan?: string };
      if (body?.plan === "monthly" || body?.plan === "pack") plan = body.plan;
    } catch {
      // body optionnel
    }

    const { priceId, mode } = resolvePrice(plan);
    if (!priceId) {
      return NextResponse.json(
        { error: "Configuration Stripe manquante" },
        { status: 500 },
      );
    }

    const stripe = getStripe();
    const appUrl = getAppUrl();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sb = supabase as any;
    const { data: profile } = await sb
      .from("profiles")
      .select("stripe_customer_id")
      .eq("id", user.id)
      .single();

    let customerId = (profile?.stripe_customer_id as string | null) ?? null;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email ?? undefined,
        metadata: { supabase_user_id: user.id },
      });
      customerId = customer.id;

      await sb
        .from("profiles")
        .update({ stripe_customer_id: customerId })
        .eq("id", user.id);
    }

    const session = await stripe.checkout.sessions.create({
      mode,
      customer: customerId!,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${appUrl}/settings?upgraded=1`,
      cancel_url: `${appUrl}/plus`,
      allow_promotion_codes: true,
      client_reference_id: user.id,
      metadata: { supabase_user_id: user.id, plan },
      ...(mode === "subscription"
        ? { subscription_data: { metadata: { supabase_user_id: user.id } } }
        : {
            payment_intent_data: { metadata: { supabase_user_id: user.id, plan: "pack" } },
          }),
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("POST /api/stripe/checkout error:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
